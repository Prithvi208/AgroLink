import { Router } from 'express';
import { all, run } from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/conversations', authenticate, (req, res) => {
  try {
    const conversations = all(`
      SELECT DISTINCT u.id as user_id, u.name, u.role,
        (SELECT content FROM messages WHERE 
          (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) 
          ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE 
          (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) 
          ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = ? AND read = 0) as unread_count
      FROM users u 
      WHERE u.id IN (
        SELECT sender_id FROM messages WHERE receiver_id = ?
        UNION
        SELECT receiver_id FROM messages WHERE sender_id = ?
      )
      ORDER BY last_message_time DESC
    `, [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:userId', authenticate, (req, res) => {
  try {
    const messages = all(
      `SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id 
       WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?) 
       ORDER BY m.created_at ASC`,
      [req.user.id, req.params.userId, req.params.userId, req.user.id]
    );

    run('UPDATE messages SET read = 1 WHERE sender_id = ? AND receiver_id = ?', [req.params.userId, req.user.id]);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    if (!receiver_id || !content) return res.status(400).json({ error: 'Receiver and content required' });

    run('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)', [req.user.id, receiver_id, content]);
    res.status(201).json({ message: 'Sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
