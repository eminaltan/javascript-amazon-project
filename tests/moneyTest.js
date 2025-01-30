import { formatCurrency } from "../script/utils/money.js";

if (formatCurrency(2095) === "20.95") {
  console.log("test passed");
} else {
  console.log("test failed");
}

if (formatCurrency(0) === "0.00") {
  console.log("test passed");
} else {
  console.log("test failed");
}

if (formatCurrency(2000.5) === "20.01") {
  console.log("test passed");
} else {
  console.log("test failed");
}
