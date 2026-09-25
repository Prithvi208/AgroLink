import re

with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\translations\index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract English section
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

# Extract farmerDashboard from English
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

# Check keys
en_keys = re.findall(r'(\w+):\s*[\'\"].*?[\'\"],', en_fd_section)
print('English farmerDashboard keys:', len(set(en_keys)))

# Hindi section
hi_start = content.find('hi: {')
mr_start = content.find('mr: {')
hi_section = content[content.find('hi: {'):content.find('mr: {')]

fd_start = hi_section.find('farmerDashboard: {')
brace_count = 0
hi_fd_section = ''
for i, ch in enumerate(hi_section[fd_start:]):
    if ch == '{':
        brace_count += 1
    elif ch == '}':
        brace_count -= 1
        if brace_count == 0:
            hi_fd_section = hi_section[fd_start:fd_start+i+1]
            break

hi_keys = re.findall(r'(\w+):\s*[\'\"].*?[\'\"],', hi_fd_section)
print('Hindi farmerDashboard keys:', len(set(hi_keys)))

# Marathi section
mr_start = content.find('mr: {')
mr_section = content[content.find('mr: {'):]
fd_start = mr_section.find('farmerDashboard: {')
if fd_start >= 0:
    brace_count = 0
    mr_fd_section = ''
    for i, ch in enumerate(content[content.find('mr: {'):]):
        if ch == '{':
            brace_count += 1
        elif ch == '}':
            brace_count -= 1
            if brace_count == 0:
                mr_fd_section = content[content.find('mr: {')+fd_start:content.find('mr: {')+fd_start+i+1]
                break

mr_keys = re.findall(r'(\w+):\s*[\'\"].*?[\'\"],', mr_fd_section)
print('Marathi farmerDashboard keys:', len(set(mr_keys)))

print('All three sections have farmerDashboard!')