import re

with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\translations\index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the Hindi section
hi_start = content.find('hi: {')
mr_start = content.find('mr: {')
hi_section = content[hi_start:mr_start]

keys = [
    'activeAlerts', 'addCrop', 'addFirstCrop', 'allCaughtUp', 'bookTransport',
    'categoryPrices', 'critical', 'cropsCritical', 'learnMore', 'myCrops',
    'needTransport', 'netReturn', 'netReturnCalculator', 'netReturnDesc',
    'netReturnPerKg', 'noCategoryData', 'noCropsListed', 'noPendingActions',
    'offersAwaitingResponse', 'ordersAwaitingAction', 'ordersNeedConfirmation',
    'pendingActions', 'pendingOffers', 'pendingOffersLabel', 'quickActions',
    'spoilageAlerts', 'spoilageAlertsLabel', 'transportDesc', 'urgentSpoilageAlert',
    'viewAlerts', 'viewMarketplace', 'viewOffers'
]

print('Checking keys in Hindi section:')
hi_keys = [
    'activeAlerts', 'addCrop', 'addFirstCrop', 'allCaughtUp', 'bookTransport',
    'categoryPrices', 'critical', 'cropsCritical', 'learnMore', 'myCrops',
    'needTransport', 'netReturn', 'netReturnCalculator', 'netReturnDesc',
    'netReturnPerKg', 'noCategoryData', 'noCropsListed', 'noPendingActions',
    'offersAwaitingResponse', 'ordersAwaitingAction', 'ordersNeedConfirmation',
    'pendingActions', 'pendingOffers', 'pendingOffersLabel', 'quickActions',
    'spoilageAlerts', 'spoilageAlertsLabel', 'transportDesc', 'urgentSpoilageAlert',
    'viewAlerts', 'viewMarketplace', 'viewOffers'
]
hi_keys_set = set(hi_keys)
for k in sorted(hi_keys):
    if k in hi_section:
        print('FOUND: farmerDashboard.' + k)
    else:
        print('MISSING: farmerDashboard.' + k)

print()
print('Checking Marathi section...')
mr_start = content.find('mr: {')
mr_section = content[content.find('mr: {'):]

mr_keys = [
    'activeAlerts', 'addCrop', 'addFirstCrop', 'allCaughtUp', 'bookTransport',
    'categoryPrices', 'critical', 'cropsCritical', 'learnMore', 'myCrops',
    'needTransport', 'netReturn', 'netReturnCalculator', 'netReturnDesc',
    'netReturnPerKg', 'noCategoryData', 'noCropsListed', 'noPendingActions',
    'offersAwaitingResponse', 'ordersAwaitingAction', 'ordersNeedConfirmation',
    'pendingActions', 'pendingOffers', 'pendingOffersLabel', 'quickActions',
    'spoilageAlerts', 'spoilageAlertsLabel', 'transportDesc', 'urgentSpoilageAlert',
    'viewAlerts', 'viewMarketplace', 'viewOffers'
]
mr_keys = [
    'activeAlerts', 'addCrop', 'addFirstCrop', 'allCaughtUp', 'bookTransport',
    'categoryPrices', 'critical', 'cropsCritical', 'learnMore', 'myCrops',
    'needTransport', 'netReturn', 'netReturnCalculator', 'netReturnDesc',
    'netReturnPerKg', 'noCategoryData', 'noCropsListed', 'noPendingActions',
    'offersAwaitingResponse', 'ordersAwaitingAction', 'ordersNeedConfirmation',
    'pendingActions', 'pendingOffers', 'pendingOffersLabel', 'quickActions',
    'spoilageAlerts', 'spoilageAlertsLabel', 'transportDesc', 'urgentSpoilageAlert',
    'viewAlerts', 'viewMarketplace', 'viewOffers'
]
for k in sorted(set(mr_keys)):
    if k in content[content.find('mr: {'):]:
        print('FOUND: farmerDashboard.' + k)
    else:
        print('MISSING: farmerDashboard.' + k)