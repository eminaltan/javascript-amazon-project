import { products } from "../data/products.js";
import { cart, getLocalStorage, saveLocalStorage } from "../data/cart.js";
import { calculatePrice } from "./utils/money.js";

getLocalStorage();

let html = "";

const matchingProducts = products
  .filter((productItems) =>
    cart.some((cartItems) => cartItems.id === productItems.id)
  )
  .map((productItems) => {
    const matchingItem = cart.find(
      (cartItems) => cartItems.id === productItems.id
    );
    return {
      productItems,
      quantity: matchingItem.quantity,
    };
  });

let productsPrice = {};

for (const cart of matchingProducts) {
  productsPrice[cart.productItems.id] = cart.productItems.priceCents;

  html += `
        <div class="cart-item-container">
        <div class="delivery-date">Delivery date: Wednesday, June 15</div>

        <div class="cart-item-details-grid">
            <img
            class="product-image"
            src=${cart.productItems.image}
            />

            <div class="cart-item-details">
            <div class="product-name">${cart.productItems.name}</div>
            <div class="product-price js-product-price-${cart.productItems.id}">
            $${calculatePrice(cart.productItems.priceCents, cart.quantity)}
            </div>
            <div class="product-quantity">
                <span 
                    class="js-product-quantity"
                    data-product-id=${cart.productItems.id}
                > Quantity: 
                    <span class="quantity-label">${cart.quantity}</span> 
                </span>
                <span 
                  class="update-quantity-link link-primary js-cart-update" 
                  data-product-id="${cart.productItems.id}"
                  > Update 
                </span>
                <span 
                  class="delete-quantity-link link-primary js-cart-delete"
                  data-product-id="${cart.productItems.id}"
                  > Delete </span>
            </div>
            </div>

            <div class="delivery-options">
            <div class="delivery-options-title">Choose a delivery option:</div>

            <div class="delivery-option">
                <input
                type="radio"
                class="delivery-option-input"
                name="delivery-option-2"
                />
                <div>
                <div class="delivery-option-date">Tuesday, June 21</div>
                <div class="delivery-option-price">FREE Shipping</div>
                </div>
            </div>
            <div class="delivery-option">
                <input
                type="radio"
                checked
                class="delivery-option-input"
                name="delivery-option-2"
                />
                <div>
                <div class="delivery-option-date">Wednesday, June 15</div>
                <div class="delivery-option-price">$4.99 - Shipping</div>
                </div>
            </div>
            <div class="delivery-option">
                <input
                type="radio"
                class="delivery-option-input"
                name="delivery-option-2"
                />
                <div>
                <div class="delivery-option-date">Monday, June 13</div>
                <div class="delivery-option-price">$9.99 - Shipping</div>
                </div>
            </div>
            </div>
        </div>
        </div>
    `;
}

document.querySelector(".js-order-summary").innerHTML = html;

function updateQuantityAndPrice(productId, cartQuantity) {
  // productsPrice değişkeni içerisindeki productId'ye ait ait fiyat bilgisini priceCents değişkenine aktar
  const priceCents = productsPrice[productId];

  // Fiyat hesaplamasını gerçekleştir ve elde edilen sonucu result değişkenine aktar
  const result = calculatePrice(priceCents, cartQuantity);

  // result değerini js-product-price içine yerleştir
  document.querySelector(
    `.js-product-price-${productId}`
  ).textContent = `$${result}`;

  // cart içerisinde productId ile uyumlu ürünü bul ve matchingItem değişkenine kopyala
  const matchingItem = cart.find((cartItem) => cartItem.id === productId);

  if (matchingItem) {
    // matchingItem değişkeninde (yani cart) değer varsa quantity bilgisini güncelle
    matchingItem.quantity = cartQuantity;

    // Sonucu local storage aktar ve sakla
    saveLocalStorage(cart);
  }
}

function endQuantityEdit(childSpanElement) {
  // (inner <span> element) childSpanElement'den quantity-enabled seçicisini kaldır.
  childSpanElement.classList.remove("quantity-enabled");

  // childSpanElement'inden contenteditable attr'sini kaldır.
  childSpanElement.setAttribute("contenteditable", "false");

  // js-product-quantity altındaki <span> elementine product quantity bilgisini al
  const cartQuantity = Number(childSpanElement.textContent.trim());

  // Metodun çağrıldığı yere cartQuantity'i tekrar geri dönder
  return cartQuantity;
}

document.querySelectorAll(".js-product-quantity").forEach((spanElement) => {
  // js-product-quantity selector'e ait data-product-id bilgisini al
  const { productId } = spanElement.dataset;

  // js-product-quantity seçicisi altındaki <span> elementini seç. (cart quantity bilgisini tutan <span>)
  const childSpanElement = spanElement.querySelector("span");

  // js-product-quantity üzerine mouse geldiğinde

  spanElement.addEventListener("mouseover", () => {
    // childSpanElement'e contenteditable attr'yi true olacak şekilde tanımla
    childSpanElement.setAttribute("contenteditable", "true");

    // childSpanElement'i quantity-enabled seçicisi ile yeni stil özellikleri ver
    childSpanElement.classList.add("quantity-enabled");
  });

  // js-product-quantity contenteditable ile içeriği değiştirilebilir durumda iken Enter tuşuna basılıp çekildiğinde yapılacak işlemler
  spanElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      // child <span> elementini deaktif hale getir
      const cartQuantity = endQuantityEdit(childSpanElement);

      // Ürün fiyatı ve quantity bilgisini güncellemek ve HTML yazdırmak için updateQuantityAndPrice() metodunu çağır.
      updateQuantityAndPrice(productId, cartQuantity);
    }
  });
});

// Update butonuna basıldığında ürün fiyat bilgisi ve sayısı güncelleme
document.querySelectorAll(".js-cart-update").forEach((button) => {
  button.addEventListener("click", () => {
    // Basılan butona ait data-product-id bilgisine ulaş
    const { productId } = button.dataset;

    // childSpanElementini seç
    const childSpanElement = document.querySelector(
      `[data-product-id="${productId}"] span`
    );

    // child <span> elementini deaktif hale getir
    const cartQuantity = endQuantityEdit(childSpanElement);

    // Güncelleme yap
    updateQuantityAndPrice(productId, cartQuantity);
  });
});

// "Delete" butonuna basıldığında cart içerisinden ürün silme işlemi
document.querySelectorAll(".js-cart-delete").forEach((button) => {
  button.addEventListener("click", () => {
    // "Delete" butonun data-product-id attr'sine ait bilgiyi al.
    const { productId } = button.dataset;

    // Güncellenen cart.id ile productId'si aynı olmayan ürünlerden oluşan listeyi cart içerisine aktar ve local storage'a sakla
    saveLocalStorage(cart.filter((cartItem) => cartItem.id !== productId));

    // Sayfa yeniden reload edilerek cart içerisinin tazelenmesini sağla.
    location.reload();
  });
});
