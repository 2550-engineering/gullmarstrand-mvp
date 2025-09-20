import React from 'react';

export default function Confirmation({ orderId, email }) {
  return (
    <div>
      <h3>Thank you for your purchase!</h3>
      <p>Your order ID: {orderId}</p>
      <p>A receipt has been sent to {email}.</p>
    </div>
  );
}