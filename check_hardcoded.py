import re

with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\pages\FarmerDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Check for hardcoded Hindi
print('Checking for hardcoded Hindi strings...')
for i, line in enumerate(content.split('\n'), 1):
    for ch in line:
        if '\u0900' <= ch <= '\u097F':
            print(f'Line {i}: Found Hindi char: {ch}')

# Check for hardcoded English strings that should use translation
print()
print('Checking for hardcoded English strings that should use translation...')
lines = content.split('\n')
for i, line in enumerate(lines, 1):
    if 'Pending Offers' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Pending Offers": {}'.format(i, line.strip()))
    if 'Post-Harvest Alerts' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Post-Harvest Alerts": {}'.format(i, line.strip()))
    if 'Quick Actions' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Quick Actions": {}'.format(i, line.strip()))
    if 'Pending Tasks' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Pending Tasks": {}'.format(i, line.strip()))
    if 'Add New Crop' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Add New Crop": {}'.format(i, line.strip()))
    if 'View Marketplace' in line and 't(' not in line:
        print('Line {}: Found hardcoded "View Marketplace": {}'.format(i, line.strip()))
    if 'View Offers' in line and 't(' not in line:
        print('Line {}: Found hardcoded "View Offers": {}'.format(i, line.strip()))
    if 'Post-Harvest Alerts' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Post-Harvest Alerts": {}'.format(i, line.strip()))
    if 'Pending Tasks' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Pending Tasks": {}'.format(i, line.strip()))
    if 'Orders Awaiting Action' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Orders Awaiting Action": {}'.format(i, line.strip()))
    if 'Orders Need Confirmation' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Orders Need Confirmation": {}'.format(i, line.strip()))
    if 'My Crops' in line and 't(' not in line:
        print('Line {}: Found hardcoded "My Crops": {}'.format(i, line.strip()))
    if 'Add New Crop' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Add New Crop": {}'.format(i, line.strip()))
    if 'Net Profit Calculator' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Net Profit Calculator": {}'.format(i, line.strip()))
    if 'Net Return' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Net Return": {}'.format(i, line.strip()))
    if 'Net Return Calculator' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Net Return Calculator": {}'.format(i, line.strip()))
    if 'See what you actually earn after costs' in line and 't(' not in line:
        print('Line {}: Found hardcoded "See what you actually earn after costs": {}'.format(i, line.strip()))
    if 'Learn More' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Learn More": {}'.format(i, line.strip()))
    if 'Need Transport?' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Need Transport?": {}'.format(i, line.strip()))
    if 'Book a verified transporter' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Book a verified transporter": {}'.format(i, line.strip()))
    if 'Book Transport' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Book Transport": {}'.format(i, line.strip()))
    if 'Category Prices' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Category Prices": {}'.format(i, line.strip()))
    if 'No category data yet' in line and 't(' not in line:
        print('Line {}: Found hardcoded "No category data yet": {}'.format(i, line.strip()))
    if 'Pending Offers' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Pending Offers": {}'.format(i, line.strip()))
    if 'Pending Offers' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Pending Offers": {}'.format(i, line.strip()))
    if 'Pending Offers' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Pending Offers": {}'.format(i, line.strip()))
    if 'Pending Offers' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Pending Offers": {}'.format(i, line.strip()))
    if 'Pending Offers' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Pending Offers": {}'.format(i, line.strip()))
    if 'Pending Offers' in line and 't(' not in line:
        print('Line {}: Found hardcoded "Pending Offers": {}'.format(i, line.strip()))