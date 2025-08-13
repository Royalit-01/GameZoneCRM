function pad(str, len = 10) {
  str = String(str);
  return str.length >= len ? str.slice(0, len) : str.padEnd(len, ' ');
}

function generateBill(order) {
  // Format date as "YYYY-MM-DD hh:mm AM/PM"
  const dateObj = new Date(order.createdAt);
  const dateStr = dateObj.toLocaleDateString();
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let total = 0;
  let itemLines = order.items.map(item => {
    const amt = item.snackQuantity * item.snackPrice;
    total += amt;
    return (
      pad(item.snackName, 10) +
      pad(item.snackQuantity, 4) +
      pad(item.snackPrice, 6) +
      pad(amt, 6)
    );
  }).join('\n');
  const neworderId = pad(order.orderId,15)
  return `
-------------------------------
          GamerSquad
-------------------------------
Name   : ${order.customerName}
Mobile : ${order.phone}
OrderID: ${neworderId}
Date   : ${dateStr} ${timeStr}

Items     Qty  Rate   Amt
${itemLines}
-------------------------------
TOTAL               ${total}
                           
Thank you for visiting!
-------------------------------
  `.trim();
}


module.exports = generateBill;