import { formatCurrency } from "../../../script/utils/money.js";

// describe() test suite ismi oluşturmak için kullanılıyor.
describe("test suite: formatCurrency", () => {
  // #region bir test case örneği
  // it() teste isim vermek için kullanılır.
  it("converst cents into dollars", () => {
    // expect() ile verilen koşul sınanır, koşul doğru ise true değilse false değer döndürür.
    expect(formatCurrency(2095)).toEqual("20.95");
  });
  //#endregion

  it("works with 0", () => {
    expect(formatCurrency(0)).toEqual("0.00");
  });

  it("rounds up to the nearest cent", () => {
    expect(formatCurrency(2000.5)).toEqual("20.01");
  });
});
