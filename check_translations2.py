import re

with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\translations\index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the Hindi section
hi_start = content.find('hi: {')
mr_start = content.find('mr: {')
hi_section = content[content.find('hi: {'):content.find('mr: {')]

# Find farmerDashboard in Hindi section
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
keys = re.findall(r'(\w+):\s*[\'\"].*?[\'\"],', hi_section[hi_section.find('farmerDashboard: {'):])
print('Hindi farmerDashboard keys:')
for k in sorted(set(re.findall(r'(\w+):', hi_section[hi_section.find('farmerDashboard: {'):]))):
    print(f'  {k}')

# Check if all English keys are present
en_keys = [
    'activeAlerts', 'addCrop', 'addFirstCrop', 'allCaughtUp', 'bookTransport',
    'categoryPrices', 'critical', 'cropsCritical', 'learnMore', 'myCrops',
    'needTransport', 'netReturn', 'netReturnCalculator', 'netReturnDesc',
    'netReturnPerKg', 'noCategoryData', 'noCropsListed', 'noPendingActions',
    'offersAwaitingResponse', 'ordersAwaitingAction', 'ordersNeedConfirmation',
    'pendingActions', 'pendingOffers', 'pendingOffersLabel', 'quickActions',
    'spoilageAlerts', 'spoilageAlertsLabel', 'transportDesc', 'urgentSpoilageAlert',
    'viewAlerts', 'viewMarketplace', 'viewOffers'
]

print('\nChecking if all English keys exist in Hindi:')
missing = []
for k in sorted(hi_keys):
    if k not in hi_section:
        print(f'  MISSING: {k}')
    else:
        print(f'  FOUND: {k}')