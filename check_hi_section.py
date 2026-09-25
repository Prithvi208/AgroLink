import re
with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\translations\index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the hi section
hi_start = content.find('hi: {')
mr_start = content.find('mr: {')
hi_section = content[hi_start:mr_start]

# Search for buyer-related keys in hi section
buyer_keys = ['availableCrops', 'activeOrders', 'pendingOffers', 'activeDeliveries', 'browseMarketplace', 'myOrders', 'myOffers', 'findTransport', 'quickActions', 'pendingActions', 'pendingOffers', 'pendingOffersLabel', 'offersAwaitingResponse', 'ordersPendingConfirmation', 'ordersAwaitingConfirmation', 'ordersAwaitingTransport', 'ordersNeedTransport', 'activeDeliveriesLabel', 'deliveriesInProgress', 'allCaughtUp', 'noPendingActions', 'recentMarketplace', 'noCropsAvailable', 'checkBackLater', 'marketInsights', 'marketInsightsDesc', 'viewInsights', 'priceAlerts', 'priceAlertsDesc', 'manageAlerts', 'activeDeliveriesTitle', 'deliveriesInProgress', 'trackDeliveries', 'categoryPrices', 'noCategoryData', 'availableCrops', 'activeOrders', 'pendingOffers', 'activeDeliveries']

print('Searching for buyer-related keys in hi section:')
found_any = False
for key in buyer_keys:
    if key in hi_section:
        idx = hi_section.find(key)
        print(f'FOUND: {key} at index {idx}')
    else:
        print(f'MISSING: {key}')

# Also check if buyerDashboard object exists in hi section
if 'buyerDashboard' in hi_section:
    print('\nbuyerDashboard object FOUND in hi section')
else:
    print('\nbuyerDashboard object NOT found in hi section')
    
# Check if buyerDashboard keys are at top level of hi section
print('\nChecking for buyerDashboard keys at top level of hi section...')
buyer_keys_top = ['availableCrops', 'activeOrders', 'pendingOffers', 'activeDeliveries', 'browseMarketplace', 'myOrders', 'myOffers', 'findTransport', 'quickActions', 'pendingActions', 'pendingOffers', 'pendingOffersLabel', 'offersAwaitingResponse', 'ordersPendingConfirmation', 'ordersAwaitingConfirmation', 'ordersAwaitingTransport', 'ordersNeedTransport', 'activeDeliveriesLabel', 'deliveriesInProgress', 'allCaughtUp', 'noPendingActions', 'recentMarketplace', 'noCropsAvailable', 'checkBackLater', 'marketInsights', 'marketInsightsDesc', 'viewInsights', 'priceAlerts', 'priceAlertsDesc', 'manageAlerts', 'activeDeliveriesTitle', 'deliveriesInProgress', 'trackDeliveries', 'categoryPrices', 'noCategoryData', 'availableCrops', 'activeOrders', 'pendingOffers', 'activeDeliveries']
for key in buyer_keys_top:
    if key in hi_section:
        idx = hi_section.find(key)
        if idx >= 0:
            # Get context
            start = max(0, idx - 50)
            end = min(len(hi_section), idx + len(key) + 50)
            context = hi_section[start:end]
            # Write to file to avoid encoding issues
            with open('hi_context.txt', 'a', encoding='utf-8') as f:
                f.write(f'FOUND: {key} at index {idx}\n')
                f.write(f'Context: {hi_section[start:end]}\n\n')
            print(f'FOUND: {key} at index {idx}')
"