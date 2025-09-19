import React from 'react';

export default function PaymentWidget({ amount, onPay }) {
  // Placeholder for PSP widget integration
  return (
    <div>
      <h3>Payment</h3>
      <p>Amount: {amount} SEK</p>
      <button onClick={onPay}>Pay now</button>
    </div>
  );
}