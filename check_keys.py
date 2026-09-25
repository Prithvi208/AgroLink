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

# Get all keys
keys = re.findall(r'(\w+):\s*[\'\"].*?[\'\"],', en_fd_section)
key_set = set(keys)

# Keys used in FarmerDashboard.jsx
used_keys = [
    'addCrop',
    'viewMarketplace', 
    'viewOffers',
    'spoilageAlerts',
    'quickActions',
    'pendingOffers',
    'pendingOffersLabel',
    'offersAwaitingResponse',
    'ordersAwaitingAction',
    'ordersNeedConfirmation',
    'spoilageAlertsLabel',
    'activeAlerts',
    'critical',
    'allCaughtUp',
    'noPendingActions',
    'myCrops',
    'netReturn',
    'noCropsListed',
    'addFirstCrop',
    'netReturnCalculator',
    'netReturnDesc',
    'learnMore',
    'needTransport',
    'transportDesc',
    'bookTransport',
    'urgentSpoilageAlert',
    'cropsCritical',
    'viewAlerts',
    'categoryPrices',
    'noCategoryData',
]

print('Keys in English farmerDashboard:', len(key_set))
print()
for k in used_keys:
    if k in key_set:
        print('  OK:', k)
    else:
        print('  MISSING:', k)