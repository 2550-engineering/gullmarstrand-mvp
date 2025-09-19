import React from 'react';

export default function DeliverySelection({ deliveryType, onSelect, onPickupRequest, shippingProvider, onShippingProviderSelect }) {
  return (
    <div>
      <h3>Delivery Method</h3>
      <label>
        <input
          type="radio"
          name="delivery"
          value="pickup"
          checked={deliveryType === 'pickup'}
          onChange={() => onSelect('pickup')}
        />
        Pickup
      </label>
      <label>
        <input
          type="radio"
          name="delivery"
          value="flat"
          checked={deliveryType === 'flat'}
          onChange={() => onSelect('flat')}
        />
        Fixed Shipping
      </label>
      {deliveryType === 'pickup' && (
        <div style={{ marginTop: 12 }}>
          <button type="button" onClick={onPickupRequest}>
            Submit Pickup Request to Seller
          </button>
        </div>
      )}
      {deliveryType === 'flat' && (
        <div style={{ marginTop: 12 }}>
          <h4>Choose Shipping Provider</h4>
          <label>
            <input
              type="radio"
              name="shippingProvider"
              value="postnord"
              checked={shippingProvider === 'postnord'}
              onChange={() => onShippingProviderSelect('postnord')}
            />
            PostNord
          </label>
          <label style={{ marginLeft: 16 }}>
            <input
              type="radio"
              name="shippingProvider"
              value="instabox"
              checked={shippingProvider === 'instabox'}
              onChange={() => onShippingProviderSelect('instabox')}
            />
            Instabox
          </label>
        </div>
      )}
    </div>
  );
}