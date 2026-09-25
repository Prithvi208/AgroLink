import re

with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\translations\index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the Hindi section
hi_start = content.find('hi: {')
mr_start = content.find('mr: {')
hi_section = content[hi_start:mr_start]

# Find farmerDashboard in Hindi section
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

print('Hindi farmerDashboard section found, length:', len(hi_fd_section))

# Find all keys in Hindi farmerDashboard
keys = re.findall(r'(\w+):\s*[\'\"].*?[\'\"],', hi_fd_section)
print('Hindi farmerDashboard keys:')
for k in sorted(set(re.findall(r'(\w+):', hi_fd_section))):
    print(f'  {k}')