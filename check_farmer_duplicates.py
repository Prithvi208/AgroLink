import re

with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\translations\index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all occurrences of farmerDashboard:
matches = list(re.finditer(r'farmerDashboard:', content))
for m in matches:
    pos = m.start()
    with open('found_positions.txt', 'a', encoding='utf-8') as f:
        f.write(f'Found at position {m.start()}: {content[m.start():m.start()+50]}\n')