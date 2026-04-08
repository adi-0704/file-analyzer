/**
 * Shopify Order Processor
 * Categorizes orders into Red, Orange, and Green flags.
 */

export const analyzeOrders = (orders) => {
  // Sort orders by date to check for repetitive orders
  const sortedOrders = [...orders].sort((a, b) => new Date(a['Created at']) - new Date(b['Created at']));
  
  const customerOrderHistory = {}; // email -> [dates]
  
  return orders.map(order => {
    const flags = [];
    const email = order['Email'];
    const phone = order['Shipping Phone'] || '';
    const zip = order['Shipping Zip'] || '';
    const address = order['Shipping Address1'] || '';
    const quantity = parseInt(order['Lineitem quantity'] || '0', 10);
    const date = new Date(order['Created at']);

    // Track history for repetitive orders
    if (!customerOrderHistory[email]) customerOrderHistory[email] = [];
    customerOrderHistory[email].push(date);

    // 1. Red Flag Logic
    const isMissingPhone = !phone || phone.trim() === '';
    const isMissingZip = !zip || zip.trim() === '';
    const isImproperAddress = !address || address.length < 10;
    
    if (isMissingPhone || isMissingZip || isImproperAddress) {
      return { ...order, flag: 'red', flagReason: 'Missing/Improper Address or Contact' };
    }

    // 2. Orange Flag Logic
    let orangeReason = '';
    
    // Ordered Bulk Quantity > 10
    if (quantity > 10) {
      orangeReason = 'Bulk Quantity (>10)';
    }
    
    // Ordered same shirts multiple time within 7 days
    const recentOrders = customerOrderHistory[email].filter(d => {
      const diffDays = Math.abs(date - d) / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= 7;
    });
    
    if (recentOrders.length > 0) {
      orangeReason = orangeReason ? `${orangeReason}, Multiple orders in 7 days` : 'Multiple orders in 7 days';
    }

    // Note: RTO > 50% would require a database. For local processing, we can add a placeholder.
    // If we had a database of RTO customers, we'd check it here.

    if (orangeReason) {
      return { ...order, flag: 'orange', flagReason: orangeReason };
    }

    // 3. Green Flag Logic
    return { ...order, flag: 'green', flagReason: 'Ready for Dispatch' };
  });
};
