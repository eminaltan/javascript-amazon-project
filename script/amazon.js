import { products } from "../data/products.js";
import { formatCurrency } from "./utils/money.js";
import { cart, getLocalStorage, saveLocalStorage } from "../data/cart.js";

let html = "";

for (const productItems of products) {
  html += `
    <div class="product-container">
        <div class="product-image-container">
        <img
            class="product-image"
            src=${productItems.image}
        />
        </div>

        <div class="product-name limit-text-to-2-lines">
            ${productItems.name}
        </div>

        <div class="product-rating-container">
        <img
            class="product-rating-stars"
            src="images/ratings/rating-${productItems.rating.stars * 10}.png"
        />
        <div class="product-rating-count link-primary">
            ${productItems.rating.count}
        </div>
        </div>

        <div class="product-price">
            $${formatCurrency(productItems.priceCents)}
        </div>

        <div class="product-quantity-container">
        <select class="js-product-select-${productItems.id}">
            <option selected value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
        </select>
        </div>

        <div class="product-spacer"></div>

        <div class="added-to-cart">
        <img src="images/icons/checkmark.png" />
        Added
        </div>

        <button 
            class="add-to-cart-button button-primary js-add-to-cart" 
            data-product-id="${productItems.id}"
            >
            Add to Cart
        </button>
        <p class="add-to-cart-message js-message-${productItems.id}"></p>
    </div>
  `;
}

document.querySelector(".js-product-grid").innerHTML = html;

getLocalStorage();

// Script ilk render edildiğinde cart içerisinde ürünlerin sayısını bul ve js-cart-quantity içerisine aktar
updateQuantityCart();

function addToCart(productId) {
  // Sepette ürünü ara
  const matchingProduct = cart.find((cartItem) => cartItem.id === productId);

  // Ürün miktarını al
  const productQuantity = document.querySelector(
    `.js-product-select-${productId}`
  ).value;

  // Eğer ürün sepette varsa miktarını güncelle
  if (matchingProduct) {
    // matchingProduct = cart
    matchingProduct.quantity += Number(productQuantity); // Mevcut miktara ekle
  } else {
    // Ürün sepette yoksa yeni bir öğe olarak ekle
    cart.push({
      id: productId,
      quantity: Number(productQuantity),
    });
  }

  // Sepeti localStorage'a kaydet
  saveLocalStorage(cart);
}

function updateQuantityCart() {
  // Quantity başlangıç değerini belirle
  let cartQuantity = 0;

  // cart içerisindeki tüm ürünlerin toplam sayısınının hesaplanması
  cart.forEach((cartItems) => {
    cartQuantity += cartItems.quantity;
  });

  document.querySelector(".js-cart-quantity").innerText = cartQuantity;
}

document.querySelectorAll(".js-add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const { productId } = button.dataset;
    const pElement = document.querySelector(`.js-message-${productId}`);
    pElement.innerText = "Added";

    setTimeout(() => {
      pElement.innerText = "";
    }, 2000);

    addToCart(productId);
    updateQuantityCart();
  });
});
