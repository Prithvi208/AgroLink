with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\components\Sidebar.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Check for hardcoded Hindi
print('Checking for hardcoded Hindi in Sidebar...')
for i, line in enumerate(content.split('\n'), 1):
    for ch in line:
        if '\u0900' <= ch <= '\u097F':
            with open('hindi_check.txt', 'a', encoding='utf-8') as f:
                f.write(f'Line {i}: Found Hindi char: {ch}\n')

with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\components\Navbar.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

print('Checking Navbar...')
for i, line in enumerate(content.split('\n'), 1):
    for ch in line:
        if '\u0900' <= ch <= '\u097F':
            with open('hindi_check.txt', 'a', encoding='utf-8') as f:
                f.write(f'Line {i}: Found Hindi char: {ch}\n')