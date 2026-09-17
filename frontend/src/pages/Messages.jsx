import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function Messages() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeChat, setActiveChat] = useState(userId || null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEnd = useRef(null);

  useEffect(() => {
    api.get('/messages/conversations').then(setConversations).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat);
      const interval = setInterval(() => loadMessages(activeChat), 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = (uid) => {
    api.get(`/messages/${uid}`).then(setMessages).catch(() => {});
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;
    try {
      await api.post('/messages', { receiver_id: activeChat, content: input });
      setInput('');
      loadMessages(activeChat);
      api.get('/messages/conversations').then(setConversations);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.length < 2) { setSearchResults([]); return; }
    // Filter existing conversations client-side
    const filtered = conversations.filter(c => 
      c.name.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const activeConvo = conversations.find(c => c.user_id === activeChat);

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-5rem)] bg-white rounded-2xl shadow-sm border overflow-hidden flex">
      <div className={`w-80 border-r flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b">
          <h2 className="font-bold text-gray-900 mb-3">Messages</h2>
          <input type="text" value={searchTerm} onChange={e => handleSearch(e.target.value)}
            placeholder="Search people..."
            className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-agro-500" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No conversations yet</div>
          ) : (
            conversations
              .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(c => (
              <button key={c.user_id} onClick={() => setActiveChat(c.user_id)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition border-b flex items-center gap-3 ${activeChat === c.user_id ? 'bg-agro-50' : ''}`}>
                <div className="h-10 w-10 bg-agro-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  {c.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 truncate">{c.name}</p>
                    {c.unread_count > 0 && <span className="bg-agro-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{c.unread_count}</span>}
                  </div>
                  <p className="text-xs text-gray-500 truncate capitalize">{c.role} · {c.last_message}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center"><MessageSquare className="h-16 w-16 mx-auto mb-4" /><p>Select a conversation to start messaging</p></div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <button onClick={() => setActiveChat(null)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></button>
              <div className="h-10 w-10 bg-agro-500 rounded-full flex items-center justify-center text-white font-bold">{activeConvo?.name?.charAt(0)}</div>
              <div><p className="font-bold text-gray-900">{activeConvo?.name}</p><p className="text-xs text-gray-500 capitalize">{activeConvo?.role}</p></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${m.sender_id === user?.id ? 'bg-agro-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'}`}>
                    <p className="text-sm">{m.content}</p>
                    <p className={`text-xs mt-1 ${m.sender_id === user?.id ? 'text-agro-200' : 'text-gray-400'}`}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEnd} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t flex gap-3">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-agro-500" />
              <button type="submit" disabled={!input.trim()}
                className="bg-agro-600 text-white p-3 rounded-xl hover:bg-agro-700 transition disabled:opacity-50">
                <Send className="h-5 w-5" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}