/**
 * Shopify Order Processor - Aligned with real Shopify CSV export format
 * Handles multi-line orders, apostrophe-prefixed zip codes, and full column set.
 */

// Clean zip code - Shopify exports may prefix with apostrophe
const cleanZip = (zip) => {
  if (!zip) return '';
  return zip.toString().replace(/^'/, '').trim();
};

// Clean phone - normalize phone numbers
const cleanPhone = (phone) => {
  if (!phone) return '';
  return phone.toString().replace(/\s+/g, '').trim();
};

// Validate Indian phone number (10 digits, optionally prefixed with +91, 0, etc.)
const isValidIndianPhone = (phone) => {
  const cleaned = cleanPhone(phone);
  if (!cleaned) return false;
  // Match: 10 digits, or +91/0 prefix + 10 digits
  const pattern = /^(\+?91|0)?[6-9]\d{9}$/;
  return pattern.test(cleaned.replace(/[-\s]/g, ''));
};

// Validate Indian PIN code (6 digits)
const isValidPinCode = (zip) => {
  const cleaned = cleanZip(zip);
  if (!cleaned) return false;
  return /^\d{6}$/.test(cleaned);
};

// Check if address is proper (not too short, not gibberish)
const isProperAddress = (addr1, addr2, city) => {
  const combined = [addr1, addr2, city].filter(Boolean).join(' ').trim();
  return combined.length >= 10;
};

export const analyzeOrders = (rawOrders) => {
  // Step 1: Merge multi-line orders (same order Name, subsequent rows have empty financial details)
  const mergedOrders = [];
  const orderMap = new Map();

  rawOrders.forEach((row) => {
    const orderName = row['Name'];
    if (!orderName) return;

    if (orderMap.has(orderName)) {
      // This is a continuation row (additional line item)
      const existing = orderMap.get(orderName);
      const existingQty = parseInt(existing['Lineitem quantity'] || '0', 10);
      const newQty = parseInt(row['Lineitem quantity'] || '0', 10);
      existing['Lineitem quantity'] = String(existingQty + newQty);
      existing['_lineItems'] = (existing['_lineItems'] || 1) + 1;
    } else {
      const entry = { ...row, _lineItems: 1 };
      orderMap.set(orderName, entry);
      mergedOrders.push(entry);
    }
  });

  // Step 2: Build customer history for repeat order detection
  const customerHistory = {}; // phone/email -> [dates]

  mergedOrders.forEach((order) => {
    const phone = cleanPhone(order['Shipping Phone']);
    const email = order['Email'] || '';
    const key = phone || email;
    const date = new Date(order['Created at']);

    if (key) {
      if (!customerHistory[key]) customerHistory[key] = [];
      customerHistory[key].push({ date, orderName: order['Name'] });
    }
  });

  // Step 3: Flag each order
  return mergedOrders.map((order) => {
    const phone = cleanPhone(order['Shipping Phone']);
    const zip = cleanZip(order['Shipping Zip']);
    const addr1 = order['Shipping Address1'] || '';
    const addr2 = order['Shipping Address2'] || '';
    const city = order['Shipping City'] || '';
    const quantity = parseInt(order['Lineitem quantity'] || '0', 10);
    const email = order['Email'] || '';
    const date = new Date(order['Created at']);
    const key = phone || email;

    const reasons = [];

    // ===== RED FLAG CHECKS =====
    const isMissingPhone = !phone;
    const isInvalidPhone = phone && !isValidIndianPhone(phone);
    const isMissingZip = !zip;
    const isInvalidZip = zip && !isValidPinCode(zip);
    const isBadAddress = !isProperAddress(addr1, addr2, city);

    if (isMissingPhone) reasons.push('Missing Phone');
    if (isInvalidPhone) reasons.push('Invalid Phone');
    if (isMissingZip) reasons.push('Missing Pin Code');
    if (isInvalidZip) reasons.push('Invalid Pin Code');
    if (isBadAddress) reasons.push('Improper Address');

    if (reasons.length > 0) {
      return { ...order, flag: 'red', flagReason: reasons.join(', '), _cleanZip: zip, _cleanPhone: phone };
    }

    // ===== ORANGE FLAG CHECKS =====
    const orangeReasons = [];

    // Bulk quantity > 10
    if (quantity > 10) {
      orangeReasons.push(`Bulk Qty (${quantity})`);
    }

    // Multiple orders within 7 days from same customer
    if (key && customerHistory[key]) {
      const recentOrders = customerHistory[key].filter((entry) => {
        if (entry.orderName === order['Name']) return false;
        const diffDays = Math.abs(date - entry.date) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      });
      if (recentOrders.length > 0) {
        orangeReasons.push(`${recentOrders.length + 1} orders in 7 days`);
      }
    }

    if (orangeReasons.length > 0) {
      return { ...order, flag: 'orange', flagReason: orangeReasons.join(', '), _cleanZip: zip, _cleanPhone: phone };
    }

    // ===== GREEN FLAG =====
    return { ...order, flag: 'green', flagReason: 'Ready for Dispatch', _cleanZip: zip, _cleanPhone: phone };
  });
};
