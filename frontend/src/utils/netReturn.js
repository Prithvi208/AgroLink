export function calculateNetReturn({
  sellingPricePerKg,
  quantityKg,
  transportCostPerKg,
  transportCostTotal,
  platformFeePercent = 0,
  otherCosts = 0
}) {
  const sellingPrice = Number(sellingPricePerKg) || 0;
  const qty = Number(quantityKg) || 0;
  const transportPerKg = Number(transportCostPerKg) || 0;
  const transportTotal = Number(transportCostTotal) || (transportPerKg * qty);
  const platformFee = (platformFeePercent / 100) * (sellingPrice * qty);
  const other = Number(otherCosts) || 0;

  const grossSaleValue = sellingPrice * qty;
  const totalTransportCost = transportTotal;
  const totalPlatformFee = platformFee;
  const totalOtherCosts = other;
  const totalCosts = totalTransportCost + totalPlatformFee + totalOtherCosts;

  const netReturn = grossSaleValue - totalCosts;
  const netReturnPerKg = qty > 0 ? netReturn / qty : 0;
  const transportCostPerKgCalculated = qty > 0 ? totalTransportCost / qty : 0;

  return {
    sellingPricePerKg: sellingPrice,
    quantityKg: qty,
    grossSaleValue: Math.round(grossSaleValue * 100) / 100,
    transportCostPerKg: Math.round(transportCostPerKgCalculated * 100) / 100,
    transportCostTotal: Math.round(totalTransportCost * 100) / 100,
    platformFee: Math.round(totalPlatformFee * 100) / 100,
    otherCosts: Math.round(totalOtherCosts * 100) / 100,
    totalCosts: Math.round(totalCosts * 100) / 100,
    netReturn: Math.round(netReturn * 100) / 100,
    netReturnPerKg: Math.round(netReturnPerKg * 100) / 100,
    isProfitable: netReturn > 0,
    breakdown: {
      gross: Math.round(grossSaleValue * 100) / 100,
      transport: Math.round(totalTransportCost * 100) / 100,
      platform: Math.round(totalPlatformFee * 100) / 100,
      other: Math.round(totalOtherCosts * 100) / 100
    }
  };
}

export function compareNetReturns(options) {
  return options
    .map(opt => ({
      ...opt,
      calculation: calculateNetReturn(opt)
    }))
    .sort((a, b) => b.calculation.netReturn - a.calculation.netReturn);
}

export function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPerUnit(amount, unit = 'kg') {
  return `${formatCurrency(amount)}/${unit}`;
}

export function formatCurrencyCompact(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}