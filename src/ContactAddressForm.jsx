import React, { useState } from 'react';

export default function ContactAddressForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ name, email, address });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3>Contact & Address</h3>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Address (if shipping)"
        value={address}
        onChange={e => setAddress(e.target.value)}
        required
      />
      <button type="submit">Continue to Payment</button>
    </form>
  );
}