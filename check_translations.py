import re

with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\translations\index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all occurrences of farmerDashboard:
matches = list(re.finditer(r'farmerDashboard:', content))
for m in matches:
    pos = m.start()
    print(f'Found at position {m.start()}: {content[m.start():m.start()+50]}')

print("\n\n--- Checking for duplicate farmerDashboard keys ---")
# Check for duplicate keys in the en section
en_start = content.find('en: {')
if en_start >= 0:
    brace_count = 0
    en_section = ''
    for i, ch in enumerate(content[en_start:]):
        if ch == '{':
            brace_count += 1
        elif ch == '}':
            brace_count -= 1
            if brace_count == 0:
                en_section = content[en_start:en_start+i+1]
                break
    
    # Find all farmerDashboard in en section
    matches = list(re.finditer(r'farmerDashboard:', en_section))
    print(f"\nFound {len(matches)} farmerDashboard in en section")
    for m in matches:
        pos = m.start()
        print(f'  At position {pos}: {en_section[pos:pos+50]}')