import test from "node:test";
import assert from "node:assert/strict";
import {
  convertUnit,
  makeRequest,
  MARKETS,
  CURRENCIES,
  EXAMPLE_PRICES,
  comparisonCsv,
  quoteMessage,
} from "../public/model.mjs";
import { calculateFbaFee } from "../src/index.mjs";
const values = {
  length: 20,
  width: 20,
  height: 10,
  dimensionUnit: "cm",
  weight: 200,
  weightUnit: "g",
  saleDate: "2026-10-31",
  lowPriceEligibility: "conservative",
  cep: false,
};

test("unit switches preserve the physical package at exact AU gram/fee boundaries", () => {
  const original = makeRequest(values, "AU", 25);
  const converted = {
    ...values,
    dimensionUnit: "in",
    weightUnit: "lb",
    length: convertUnit(20, "cm", "in"),
    width: convertUnit(20, "cm", "in"),
    height: convertUnit(10, "cm", "in"),
    weight: convertUnit(200, "g", "lb"),
  };
  const fee = calculateFbaFee(makeRequest(converted, "AU", 25));
  assert.deepEqual(fee.fee, calculateFbaFee(original).fee);
  assert.equal(fee.fee.total, 7.24);
  assert.equal(fee.classification.shippingWeight, 1);
  assert.equal(convertUnit("", "g", "kg"), "");
  assert.equal(convertUnit(1000, "g", "kg"), "1");
  assert.throws(() => convertUnit(10, "g", "cm"));
});

test("each marketplace uses its own currency and price; CEP is sent only for DE", () => {
  assert.equal(MARKETS.length, 14);
  for (const [code] of MARKETS) {
    const req = makeRequest(
      { ...values, cep: true },
      code,
      EXAMPLE_PRICES[code],
    );
    assert.equal(req.price.amount, EXAMPLE_PRICES[code]);
    assert.equal(req.price.currency, CURRENCIES[code]);
    assert.equal(
      Object.hasOwn(req.options, "centralEuropeProgram"),
      code === "DE",
    );
    assert.equal(calculateFbaFee(req).status, "estimated");
  }
});

test("CSV retains currencies and uses an empty fee for quote_required, never a zero estimate", () => {
  const req = makeRequest(values, "CA", 13.99);
  const csv = comparisonCsv([
    { request: req, result: { status: "quote_required", rateVersion: "test" } },
  ]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /"加拿大","CAD","13.99",""/);
  assert.match(csv, /需报价/);
  assert.match(quoteMessage("OFFICIAL_SOURCE_CONFLICT"), /不一致/);
});
