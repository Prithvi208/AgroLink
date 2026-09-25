import re

with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\pages\FarmerDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all t() calls with farmerDashboard
keys = re.findall(r"t\(['\"]farmerDashboard\.([^'\"]+)['\"]\)", content)
print('Translation keys used in FarmerDashboard:')
for k in sorted(set(keys)):
    print(f'  farmerDashboard.{k}')

# Check for hardcoded Hindi strings
print()
print('Checking for hardcoded Hindi strings...')
for i, line in enumerate(content.split('\n'), 1):
    for ch in line:
        if '\u0900' <= ch <= '\u097F':
            print(f'Line {content[:i].count(chr(10))+1}: Found Hindi char: {ch}')