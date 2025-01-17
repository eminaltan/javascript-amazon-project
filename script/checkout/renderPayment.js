import { cart, getLocalStorage } from "../../data/cart.js";
import { products } from "../../data/products.js";
import { deliveryOptions } from "../../data/deliveryOptions.js";
import { formatCurrency } from "../utils/money.js";

/**
 * Sepetteki ürünlerin listesini ve bunlara ilişkin toplam fiyat
 * bilgisini gösterir.
 *
 * @return {void} - Hiçbir şey döndürmez.
 */
export function renderPayment() {
  getLocalStorage();

  const cartItems = products
    .filter((productItems) =>
      cart.some((Items) => Items.id === productItems.id)
    )
    .map((productItems) => {
      const matchingCartItem = cart.find(
        (cartItems) => cartItems.id === productItems.id
      );

      return {
        productItems,
        quantity: matchingCartItem.quantity,
        deliveryPrice: deliveryOptions.find(
          (option) => option.deliveryId === matchingCartItem.deliveryId
        )?.deliveryPriceCents,
      };
    });

  let totalItemsQuantity = 0,
    itemPrice = 0,
    basketPrice = 0,
    totalShipping = 0,
    totalPriceBeforeTax = 0,
    estimatedTax = 0,
    totalBasketPrice = 0;

  cartItems.forEach((item) => {
    totalItemsQuantity += item.quantity;
    itemPrice = item.quantity * item.productItems.priceCents;
    basketPrice += itemPrice;
    totalShipping += item.deliveryPrice ?? 0;
    totalPriceBeforeTax = basketPrice + totalShipping;
    estimatedTax = totalPriceBeforeTax * 0.1;
    totalBasketPrice = totalPriceBeforeTax + estimatedTax;
  });

  let paymentSummaryHtml;

  paymentSummaryHtml = ` <div class="payment-summary-title">Order Summary</div>
   
   <div class="payment-summary-row">
    
   <div>Items (${totalItemsQuantity}):</div>
   <div class="payment-summary-money">$${formatCurrency(basketPrice)}</div>
   </div>
   
   <div class="payment-summary-row">
   <div>Shipping &amp; handling:</div>
   <div class="payment-summary-money">$${formatCurrency(totalShipping)}</div>
   </div>

   <div class="payment-summary-row subtotal-row">
            <div>Total before tax:</div>
            <div class="payment-summary-money">$${formatCurrency(
              totalPriceBeforeTax
            )}</div>
          </div>
          
          <div class="payment-summary-row">
            <div>Estimated tax (10%):</div>
            <div class="payment-summary-money">$${formatCurrency(
              estimatedTax
            )}</div>
          </div>

          <div class="payment-summary-row total-row">
          <div>Order total:</div>
          <div class="payment-summary-money">$${formatCurrency(
            totalBasketPrice
          )}</div>
          </div>
          
          <button class="place-order-button button-primary">
          Place your order
          </button>
          </div>
          
          `;

  document.querySelector(".js-payment-summary").innerHTML = paymentSummaryHtml;
  document.querySelector(".js-checkout-header-middle-section").innerText =
    "Checkout (" + totalItemsQuantity + ")";
}
