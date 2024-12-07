export function formatCurrency(priceCents) {
  return (priceCents / 100).toFixed(2);
}

export function calculatePrice(
  cart,
  // product price => default tanımlanmıştır fiyat hesaplaması içindir.
  calculationType = "product price"
) {
  if (calculationType === "product price") {
    return formatCurrency(cart.productItems.priceCents * cart.quantity);
  }
}
