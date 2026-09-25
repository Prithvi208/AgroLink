with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\translations\index.js', 'r', encoding='utf-8') as f:
    content = f.read()

import re
matches = list(re.finditer(r'farmerDashboard:', content))
for i, m in enumerate(matches):
    pos = m.start()
    with open('found_positions.txt', 'a', encoding='utf-8') as f:
        f.write(f'=== Match {i+1} at position {m.start()} ===\n')
        f.write(content[m.start()-50:m.start()+200])
        f.write('\n---\n')