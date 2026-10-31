export const MARKETS = [
  ["US", "美国", "USD"],
  ["CA", "加拿大", "CAD"],
  ["MX", "墨西哥", "MXN"],
  ["UK", "英国", "GBP"],
  ["DE", "德国", "EUR"],
  ["FR", "法国", "EUR"],
  ["IT", "意大利", "EUR"],
  ["ES", "西班牙", "EUR"],
  ["NL", "荷兰", "EUR"],
  ["SE", "瑞典", "SEK"],
  ["PL", "波兰", "PLN"],
  ["BE", "比利时", "EUR"],
  ["IE", "爱尔兰", "EUR"],
  ["AU", "澳大利亚", "AUD"],
];
export const MARKET_NAMES = Object.fromEntries(
  MARKETS.map(([code, name]) => [code, name]),
);
export const CURRENCIES = Object.fromEntries(
  MARKETS.map(([code, , currency]) => [code, currency]),
);
export const EXAMPLE_PRICES = {
  US: 25,
  CA: 13.99,
  MX: 449,
  UK: 15,
  DE: 25,
  FR: 25,
  IT: 25,
  ES: 25,
  NL: 25,
  SE: 250,
  PL: 100,
  BE: 25,
  IE: 25,
  AU: 25,
};
const FACTORS = {
  cm: 1,
  in: 2.54,
  g: 1,
  kg: 1000,
  lb: 453.59237,
  oz: 28.349523125,
};
export function convertUnit(value, from, to) {
  if (value === "") return "";
  const number = Number(value);
  if (!Number.isFinite(number) || !FACTORS[from] || !FACTORS[to]) return "";
  if (["cm", "in"].includes(from) !== ["cm", "in"].includes(to))
    throw new Error("Incompatible units");
  return String(
    Number(((number * FACTORS[from]) / FACTORS[to]).toPrecision(15)),
  );
}
export function makeRequest(values, marketplace, price) {
  const options = { lowPriceEligibility: values.lowPriceEligibility };
  if (marketplace === "DE") options.centralEuropeProgram = values.cep;
  return {
    marketplace,
    price: { amount: Number(price), currency: CURRENCIES[marketplace] },
    package: {
      dimensions: {
        length: Number(values.length),
        width: Number(values.width),
        height: Number(values.height),
        unit: values.dimensionUnit,
      },
      weight: { value: Number(values.weight), unit: values.weightUnit },
    },
    saleDate: values.saleDate,
    category: "general",
    program: "domestic",
    options,
  };
}
export function formatMoney(amount, currency) {
  return `${currency} ${Number(amount).toFixed(2)}`;
}
export function formatWeight(value, unit) {
  return `${new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 4 }).format(value)} ${unit}`;
}
const TIERS = {
  "small-envelope": "小信封",
  "light-envelope": "轻信封",
  "standard-envelope": "标准信封",
  "large-envelope": "大信封",
  "extra-large-envelope": "特大信封",
  envelope: "信封",
  parcel: "包裹",
  "small-parcel": "小包裹",
  "standard-parcel": "标准包裹",
  standard: "标准件",
  "small-standard": "小号标准件",
  "large-standard": "大号标准件",
  "small-bulky": "小号大件",
  "large-bulky": "大号大件",
  "small-oversize": "小号超大件",
  "medium-oversize": "中号超大件",
  "large-oversize": "大号超大件",
  "standard-oversize": "标准超大件",
  "standard-oversize-light": "轻型标准超大件",
  "standard-oversize-heavy": "重型标准超大件",
  "standard-oversize-large": "大型标准超大件",
  "bulky-oversize": "大体积超大件",
  "heavy-oversize": "重型超大件",
  "extra-large": "特大件",
  oversize: "大件",
  "extra-large-0-50": "特大件 ≤50 lb",
  "extra-large-50-70": "特大件 50–70 lb",
  "extra-large-70-150": "特大件 70–150 lb",
};
export const tierLabel = (id) => TIERS[id] ?? id;
export const planLabel = (plan) =>
  ({ regular: "常规费率", peak: "旺季费率", low_price: "低价费率" })[plan] ??
  plan;
export function quoteMessage(code) {
  return (
    {
      OFFICIAL_SOURCE_CONFLICT:
        "该尺寸档的官方续重单价存在不一致。请使用亚马逊收入计算器或官方报价核实。",
      PACKAGE_OUT_OF_SCOPE:
        "当前包装超出本工具已支持的尺寸或重量范围，请取得亚马逊官方报价。",
      UNSUPPORTED_MARKETPLACE: "当前站点尚未纳入已核验的费率范围。",
      UNSUPPORTED_PROGRAM:
        "当前仅支持国内 FBA 配送。跨境、远程配送和特殊计划需单独报价。",
      UNSUPPORTED_CATEGORY:
        "当前仅支持普通、非服装、非危险品商品。请先核实官方费用类目。",
      NO_HISTORICAL_RATE:
        "所选日期早于当前费率表的生效时间，请选择其他日期或核实历史报价。",
      RATE_REVIEW_REQUIRED: "该条件下的费率仍需进一步核实，请取得官方报价。",
    }[code] ?? "当前条件下暂时无法给出可靠金额，请核实官方报价。"
  );
}
export function noticeText(notice, market) {
  const cap =
    { UK: "10 GBP", DE: "11 EUR", SE: "140 SEK", PL: "55 PLN" }[market] ??
    "12 EUR";
  return (
    {
      CONSERVATIVE_LOW_PRICE: `未确认官方费用类目，低价优惠按 ${cap} 的保守门槛判断。`,
      FUTURE_DATE:
        "当前为未来日期测算，使用核验日已公布的规则；实际售出前请复核费率更新。",
      NEW_YEAR_RATE_REVIEW:
        "当前使用旺季结束后的常规费率，尚不代表已核验下一年度的新费率。",
      DE_STORAGE_ASSUMPTION: notice.message.includes("Uses CEP")
        ? "按中欧计划（CEP）费率测算，请确认已符合该计划资格。"
        : "按仅德国存储的费率测算，已包含相应费率差额。",
      IE_PROMOTIONAL_RATES:
        "爱尔兰采用官方当前有效的促销费率，亚马逊可能提前 30 天通知调整。",
      AU_INBOUND_ELIGIBILITY:
        "包装超出澳洲普通入仓限重或尺寸；费用预估不代表已获得入仓资格。",
    }[notice.code] ?? notice.message
  );
}
export function resultText(result) {
  if (result.status !== "estimated")
    return `${MARKET_NAMES[result.marketplace]}：${quoteMessage(result.reason?.code)}`;
  return [
    `${MARKET_NAMES[result.marketplace]} FBA 配送费：${formatMoney(result.fee.total, result.currency)}/件`,
    `包装：${result.package.dimensionsCm.join(" × ")} cm；实重 ${result.package.unitWeightG} g`,
    `尺寸档：${tierLabel(result.classification.tier)}；计费重 ${formatWeight(result.classification.shippingWeight, result.classification.weightUnit)}`,
    `预计售出日期：${result.saleDate}；${planLabel(result.classification.plan)}`,
    `费率版本：${result.rateVersion}；${result.fee.includesTax ? "费表已含税" : "未额外含税"}`,
  ].join("\n");
}
export function comparisonCsv(results) {
  const rows = [
    [
      "站点",
      "币种",
      "售价",
      "FBA配送费",
      "尺寸档",
      "计费重量",
      "计费重量单位",
      "预计售出日期",
      "状态",
      "费率版本",
    ],
  ];
  for (const { request, result } of results)
    rows.push([
      MARKET_NAMES[request.marketplace],
      request.price.currency,
      request.price.amount,
      result?.status === "estimated" ? result.fee.total : "",
      result?.classification ? tierLabel(result.classification.tier) : "",
      result?.classification?.shippingWeight ?? "",
      result?.classification?.weightUnit ?? "",
      request.saleDate,
      result?.status === "estimated" ? "已测算" : "需报价",
      result?.rateVersion ?? "",
    ]);
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((cell) => '"' + String(cell).replaceAll('"', '""') + '"')
          .join(","),
      )
      .join("\r\n")
  );
}
