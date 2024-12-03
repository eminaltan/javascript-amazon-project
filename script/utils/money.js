export function formatCurrency(priceCents) {
  return (priceCents / 100).toFixed(2);
}

export function calculatePrice(
  priceCents,
  productQuantity,
  // product price => default tanımlanmıştır fiyat hesaplaması içindir.
  calculationType = "product price"
) {
  if (calculationType === "product price") {
    return formatCurrency(priceCents * productQuantity);
  }
}
