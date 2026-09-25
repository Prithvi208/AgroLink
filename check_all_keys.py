import re

with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\translations\index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the English section
en_start = content.find('en: {')
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

# Find all farmerDashboard keys in English section
fd_start = en_section.find('farmerDashboard: {')
brace_count = 0
en_fd_section = ''
for i, ch in enumerate(en_section[fd_start:]):
    if ch == '{':
        brace_count += 1
    elif ch == '}':
        brace_count -= 1
        if brace_count == 0:
            en_fd_section = en_section[fd_start:fd_start+i+1]
            break

en_keys = re.findall(r'(\w+):\s*[\'\"].*?[\'\"],', en_fd_section)
print('English farmerDashboard keys:')
for k in sorted(set(en_keys)):
    print(f'  {k}')

# Extract the Hindi section
hi_start = content.find('hi: {')
mr_start = content.find('mr: {')
hi_section = content[hi_start:mr_start]

# Find farmerDashboard section in hi
fd_start = content.find('farmerDashboard: {', content.find('hi: {'))
brace_count = 0
hi_fd_section = ''
for i, ch in enumerate(content[fd_start:]):
    if ch == '{':
        brace_count += 1
    elif ch == '}':
        brace_count -= 1
        if brace_count == 0:
            hi_fd_section = content[fd_start:fd_start+i+1]
            break

# Find all keys in Hindi farmerDashboard
hi_keys = re.findall(r'(\w+):\s*[\'\"].*?[\'\"],', content[fd_start:fd_start+len(hi_fd_section)])
hi_keys_set = set(re.findall(r'(\w+):', hi_section[hi_section.find('farmerDashboard: {'):]))
print('\nHindi farmerDashboard keys:')
for k in sorted(set(hi_keys)):
    print(f'  {k}')

# Check missing keys in Hindi
en_keys_set = set(re.findall(r'(\w+):', en_fd_section))
hi_keys_set = set(re.findall(r'(\w+):', hi_section[hi_section.find('farmerDashboard: {'):]))

missing = en_keys - hi_keys_set
print('\nMissing in Hindi:')
for k in sorted(missing):
    print(f'  MISSING: {k}')

# Check Marathi
mr_start = content.find('mr: {')
mr_section = content[mr_start:]

fd_start = content.find('farmerDashboard: {', content.find('mr: {'))
brace_count = 0
mr_fd_section = ''
for i, ch in enumerate(content[fd_start:]):
    if ch == '{':
        brace_count += 1
    elif ch == '}':
        brace_count -= 1
        if brace_count == 0:
            mr_fd_section = content[fd_start:fd_start+i+1]
            break

mr_keys = set(re.findall(r'(\w+):', mr_section[mr_section.find('farmerDashboard: {'):mr_section.find('}')+1]))
missing_mr = en_keys - mr_keys
print('\nMissing in Marathi:')
for k in sorted(missing):
    print(f'  MISSING: {k}')