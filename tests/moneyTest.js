import { formatCurrency } from "../script/utils/money.js";

console.log("test suite: formatCurrency");
// #region a test case
console.log("converts cents into dollars");
if (formatCurrency(2095) === "20.95") {
  console.log("test passed");
} else {
  console.log("test failed");
}
// #endregion

console.log("works with 0");
if (formatCurrency(0) === "0.00") {
  console.log("test passed");
} else {
  console.log("test failed");
}

console.log("rounds up to the nearest cent");
if (formatCurrency(2000.5) === "20.01") {
  console.log("test passed");
} else {
  console.log("test failed");
}
