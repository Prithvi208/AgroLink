with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\translations\index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the duplicate farmerDashboard section
idx = content.find('listings: \'listings\'')
if idx >= 0:
    # Find the next marketplace: { after this
    marketplace_idx = content.find('marketplace: {', content.find('listings: \'listings\'', idx))
    if marketplace_idx >= 0:
        # Find the duplicate farmerDashboard between them
        dup_start = content.find('farmerDashboard: {', content.find('listings: \'listings\'', idx))
        dup_end = content.find('marketplace: {', idx)
        
        if dup_start >= 0 and dup_end >= 0:
            # Remove the duplicate farmerDashboard section
            before = content[:dup_start]
            after = content[dup_end:]
            new_content = before + after
            
            with open(r'C:\Users\PRITHVI\OneDrive\Documents\Default Project\frontend\src\translations\index.js', 'w', encoding='utf-8') as f:
                f.write(new_content)
            print('Removed duplicate farmerDashboard section')
        else:
            print('Could not find duplicate section')
    else:
        print('Could not find listings')