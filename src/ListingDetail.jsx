import React, { useState } from 'react';

export default function ListingDetail({ listing, onBuyNow }) {
  if (!listing) return <div>Loading...</div>;
  return (
    <div>
      <h2>{listing.title}</h2>
      <p>{listing.description}</p>
      <p>Price: {listing.amount_sek} SEK</p>
      <button onClick={onBuyNow} disabled={listing.isOwnListing || listing.sold}>
        Buy now
      </button>
      {listing.isOwnListing && <div>You cannot buy your own listing.</div>}
      {listing.sold && <div>This item is sold.</div>}
    </div>
  );
}