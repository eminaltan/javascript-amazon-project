export let cart = [];

if (!cart) {
  cart = [
    {
      id: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
      image: "images/products/athletic-cotton-socks-6-pairs.jpg",
      name: "Black and Gray Athletic Cotton Socks - 6 Pairs",
    },
    {
      id: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
      image: "images/products/intermediate-composite-basketball.jpg",
      name: "Intermediate Size Basketball",
    },
  ];
}

export function saveLocalStorage(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function getLocalStorage() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
}
