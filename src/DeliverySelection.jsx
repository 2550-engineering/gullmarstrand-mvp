import React from 'react';

export default function DeliverySelection({ deliveryType, onSelect, onPickupRequest, shippingProvider, onShippingProviderSelect, pickupMessage, onPickupMessageChange }) {
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label htmlFor="pickupMessage" style={{ fontWeight: 600 }}>Message to Seller (optional)</label>
            <textarea
              id="pickupMessage"
              rows={4}
              placeholder="Hi, I'd like to pick this up. I'm available this weekend..."
              value={pickupMessage || ''}
              onChange={(e) => onPickupMessageChange && onPickupMessageChange(e.target.value)}
              style={{ resize: 'vertical', padding: 8, fontFamily: 'inherit' }}
            />
            <small style={{ color: '#555' }}>{(pickupMessage?.length || 0)}/500</small>
            <button
              type="button"
              onClick={onPickupRequest}
              disabled={(pickupMessage || '').length > 500}
            >
              Submit Pickup Request to Seller
            </button>
          </div>
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