import { products } from "../../data/products.js";
import { cart, getLocalStorage, saveLocalStorage } from "../../data/cart.js";
import { formatCurrency } from "../utils/money.js";
import { deliveryOptions } from "../../data/deliveryOptions.js";
import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import { renderPayment } from "./renderPayment.js";

/**
 * Sepetteki ürünlerin listesini  ve ürünleri güncellemek için gerekli
 * fonksiyonları çağırmak için kullanılır.
 *
 * @return {void} - Hiçbir şey döndürmez.
 */
export function renderCheckOut() {
  getLocalStorage();

  let html = "";

  // deliveryId ve deliveryDate değişkenlerini globalleştiriyoruz.
  const dateGlobal = new Map();

  const cartItems = products
    .filter((productItems) =>
      cart.some((Items) => Items.id === productItems.id)
    )
    .map((productItems) => {
      const matchingCartItem = findCartItem(cart, null, productItems.id);

      return {
        productItems,
        quantity: matchingCartItem.quantity,
        deliveryId: matchingCartItem.deliveryId,
        deliveryDate: matchingCartItem.deliveryDate,
      };
    });

  for (const cart of cartItems) {
    html += `
        <div class="cart-item-container">
        <div class="delivery-date js-delivery-date-${cart.productItems.id}">${
      cart.deliveryDate
        ? "Delivery date: " + cart.deliveryDate
        : "Select delivery date "
    } </div>

        <div class="cart-item-details-grid">
            <img
            class="product-image"
            src=${cart.productItems.image}
            />

            <div class="cart-item-details">
            <div class="product-name">${cart.productItems.name}</div>
            <div class="product-price js-product-price-${cart.productItems.id}">
            $${formatCurrency(cart.productItems.priceCents * cart.quantity)}
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

            ${deliveryDate(cart)}
           
            </div>
        </div>
        </div>
    `;
  }

  document.querySelector(".js-order-summary").innerHTML = html;

  /**
   * Bir içeriği başka bir içerik içerisinde uniqueId'yi kullanarak bulur.
   * @param {array} whatInFind - Neyin içerisinde bulmak istediğimizi belirten içerik.
   * @param {string} whatFind - Neyi bulmak istediğimizi belirtiren içerik.
   * @param {string} unqiueId - uniqueId'yi kullanarak bulmak istediğimiz içeriğin id'si.
   * @return {object} bulmak istediğimiz içeriği içeren obje.
   */
  function findCartItem(whatInFind, whatFind, unqiueId) {
    let findResult;

    if (whatInFind === cart) {
      findResult = whatInFind.find((items) => items.id === unqiueId);
    } else if (whatInFind === cartItems) {
      findResult = whatInFind.find(
        (items) => items.productItems.id === unqiueId
      );
    }

    return findResult;
  }

  /**
   * deliveryDate() fonksiyonu, seçili ürün için teslim alma tarihçesi
   * seçeneklerini oluşturur ve bunlardan birini seçili olarak gösterir.
   * @param {object} cart -Sepet içerisinde ürün bilgilerini içeren bir obje.
   * @return {string} -Olusturulan html kodunu döndürür.
   */
  function deliveryDate(cart) {
    let deliveryHtml = "";

    for (const parameters of deliveryOptions) {
      const today = dayjs();
      const { deliveryId, deliverydDay, deliveryPriceCents } = parameters;

      const formattedPrice =
        deliveryPriceCents === 0
          ? "FREE"
          : `$${formatCurrency(deliveryPriceCents)}`;

      const estimatedDate = today
        .add(deliverydDay, "days")
        .format("dddd, MMMM D");

      const isSelected = deliveryId === cart.deliveryId;

      if (!dateGlobal.has(deliveryId)) {
        dateGlobal.set(deliveryId, estimatedDate);
      }

      deliveryHtml += `
      <div class="delivery-option">
        <input
          type="radio"
          class="delivery-option-input"
          name="delivery-option js-delivery-option-${cart.productItems.id}"
          data-delivery-id="${deliveryId}"
          data-product-id="${cart.productItems.id}"
          ${isSelected ? "checked" : ""}
        />
        <div>
          <div class="delivery-option-date">${estimatedDate}</div>
          <div class="delivery-option-price">${formattedPrice} - Shipping</div>
        </div>
      </div>
    `;
    }

    return deliveryHtml;
  }

  /**
   * Ürün miktarını içeren span elementinin üzerinde mouse ile gezinildiğinde,
   * ürün miktarını değiştirilebilecek bir alan oluşturulur.
   * Bu fonksiyon, ürün miktarını değiştirilebilecek alandan çıkıldığında,
   * ürün miktarını güncellemek için kullanılır.
   * @param {HTMLElement} quantitySpan - Ürün miktarını içeren span elementini içerir.
   * @returns {number} - Güncellenen ürün miktarını içerir.
   */
  function endQuantityEdit(quantitySpan) {
    quantitySpan.classList.remove("quantity-enabled");
    quantitySpan.contentEditable = "false";

    const quantity = Number(quantitySpan.textContent.trim());

    return quantity;
  }

  /**
   * Bu metod, ürün miktarını ve fiyatını güncellemek için kullanılır.
   * @param {Event} event - Ürün miktarını içeren span elementinin üzerinde mouse ile gezinildiğinde oluşan event objesini içerir.
   * @param {string} cartItemId - Ürün id'sini içerir.
   * @returns {void}
   */
  function updateQuantityAndPrice(event, cartItemId) {
    let selectedProductId;

    // event true ve cartItemId false ise selectedProductId'ye event.target.dataset.productId'yi ata.
    if (event && !cartItemId) {
      selectedProductId = event.target.dataset.productId;

      // event false ve cartItemId true ise selectedProductId'ye cartItemId'yi ata.
    } else if (!event && cartItemId) {
      selectedProductId = cartItemId;
    }

    // Ürün miktarını içeren span elementini seç.
    const quantitySpan = document.querySelector(
      `[data-product-id="${selectedProductId}"] span`
    );

    // Span elementini deaktif hale getir ve yeni miktarı al.
    const newCartQuantity = endQuantityEdit(quantitySpan);

    const updatedCartItem = findCartItem(cartItems, null, selectedProductId);

    updatedCartItem.quantity = newCartQuantity;

    document.querySelector(
      `.js-product-price-${selectedProductId}`
    ).textContent = `$${formatCurrency(
      updatedCartItem.productItems.priceCents * newCartQuantity
    )}`;

    // cart içerisinde cartItemId ile uyuşan ürünü seç ve quantity'ını değiştir.
    findCartItem(cart, null, selectedProductId).quantity = newCartQuantity;

    saveLocalStorage(cart);
    renderPayment();
  }

  /**
   * @description Basılan delete butonuna ait event objesini kullanarak,
   * productId'ye ait ürünü sepetten siler ve sepeti günceller.
   * @param {Event} event - Tıklanılan delete butonuna ait event objesi.
   * @returns {void}
   */
  function deleteCartItem(event) {
    const { productId } = event.target.dataset;
    const updatedCart = cart.filter((item) => item.id !== productId);

    saveLocalStorage(updatedCart);

    renderCheckOut();
    renderPayment();
  }

  /**
   * @description Delivery radyo butonuna tıklandığında cart'a ait deliveryId
   * ve deliveryDate bilgilerini güncellemek için updateDeliveryDate() metodunu
   * kullanır.
   * @param {Event} event - Tıklanılan radyo butonuna ait event objesi.
   * @returns {void}
   */
  function updateDeliveryDate({ target }) {
    const { productId, deliveryId } = target.dataset;

    const selectedCartItem = findCartItem(cart, null, productId);

    if (selectedCartItem) {
      selectedCartItem.deliveryId = deliveryId;

      const dateString = dateGlobal.get(deliveryId);

      if (dateString) {
        selectedCartItem.deliveryDate = dateString;

        document.querySelector(
          `.js-delivery-date-${selectedCartItem.id}`
        ).innerText = `Delivery date: ${selectedCartItem.deliveryDate}`;
      }

      saveLocalStorage(cart);
      renderPayment();
    }
  }

  // Ürün miktarını içeren span elementinin üzerinde mouse ile gezinildiğinde, ürün miktarını değiştirilebilecek bir alan oluşturulur.
  document.querySelectorAll(".js-product-quantity").forEach((spanElement) => {
    const { productId: cartItemId } = spanElement.dataset;
    const childSpanElement = spanElement.querySelector("span");

    // Enter tuşuna basıldığında, ürün miktarını ve fiyatını güncellemek için updateQuantityAndPrice() metodunu çağır.
    spanElement.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        updateQuantityAndPrice(null, cartItemId);
      }
    });

    // Ürün miktarını içeren span elementinin üzerinde mouse ile gezinildiğinde, ürün miktarını değiştirilebilecek bir alan oluşturulur.
    spanElement.addEventListener("mouseover", () => {
      childSpanElement.setAttribute("contenteditable", "true");
      childSpanElement.classList.add("quantity-enabled");
    });

    // Mouse imleci spanElement'in üzerinden ayrıldığında deaktif hale getirilir. (opsiyonel)
    /*   spanElement.addEventListener("mouseout", () => {
    endQuantityEdit(childSpanElement);
  }); */
  });

  // Update buttonuna basıldığında ürün fiyat bilgisi ve miktarını güncellemek için updateCartQuantity() metodunu çagır.
  document.querySelectorAll(".js-cart-update").forEach((button) => {
    button.addEventListener("click", updateQuantityAndPrice);
  });

  // Ürün silme işlemi için deleteCartItem() metodunu çağır.
  document.querySelectorAll(".js-cart-delete").forEach((button) => {
    button.addEventListener("click", deleteCartItem);
  });

  // Delivery radyo butonuna tıklandığında cart'a ait deliveryId ve deliveryDate bilgilerini güncellemek için updateDeliveryDate() metodunu çağır.
  document
    .querySelectorAll('input[name^="delivery-option js-delivery-option-"]')
    .forEach((radioButton) => {
      radioButton.addEventListener("click", updateDeliveryDate);
    });
}
