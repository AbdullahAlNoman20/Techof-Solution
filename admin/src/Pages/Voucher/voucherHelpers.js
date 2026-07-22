import chartOfAccounts from "../../assets/data/chartOfAccounts.json";

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];

const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigits(n) {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${TENS[t]}${o ? " " + ONES[o] : ""}`;
}

function threeDigits(n) {
  const h = Math.floor(n / 100);
  const rest = n % 100;

  let str = "";

  if (h) str += `${ONES[h]} Hundred${rest ? " " : ""}`;
  if (rest) str += twoDigits(rest);

  return str.trim();
}

export function numberToWordsBDT(amount) {
  const num = Math.floor(Math.abs(Number(amount) || 0));

  if (num === 0) return "Zero Taka Only";
  if (!Number.isFinite(num) || num > 999999999999)
    return "Amount Too Large";

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;

  const parts = [];

  if (crore) parts.push(`${threeDigits(crore)} Crore`);
  if (lakh) parts.push(`${threeDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));

  return `${parts.join(" ")} Taka Only`
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeText(value, maxLen = 500) {
  if (typeof value !== "string") return "";

  return value
    .replace(/<[^>]*>?/gm, "")
    .replace(/javascript:/gi, "")
    .slice(0, maxLen);
}

export function clampNumber(value, min = 0, max = 999999999) {
  const n = Number(value);

  if (Number.isNaN(n) || !Number.isFinite(n)) {
    return min;
  }

  return Math.min(Math.max(n, min), max);
}

export function generateVoucherNo() {
  const d = new Date();

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  const rand =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().split("-")[0].toUpperCase()
      : Math.random().toString(36).slice(2, 8).toUpperCase();

  return `TSL-VCH-${y}${m}${day}-${rand}`;
}

export function generateRowId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatCurrency(amount) {
  return clampNumber(amount, -999999999, 999999999).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function groupAccountsByType(accounts = []) {
  return accounts.reduce((groups, account) => {
    const type = account.accountType || account.type || "Others";

    if (!groups[type]) {
      groups[type] = [];
    }

    groups[type].push(account);

    return groups;
  }, {});
}

export function sortGroupedAccounts(groups = {}) {
  return Object.keys(groups)
    .sort()
    .reduce((obj, key) => {
      obj[key] = groups[key].sort((a, b) =>
        (a.accountName || "").localeCompare(b.accountName || "")
      );
      return obj;
    }, {});
}




export async function loadChartOfAccounts() {
  return Array.isArray(chartOfAccounts) ? chartOfAccounts : [];
}



export function clampAmount(value, min = 0, max = 999999999) {
  const n = parseFloat(value);

  if (Number.isNaN(n) || !Number.isFinite(n)) {
    return min;
  }

  return Math.min(Math.max(n, min), max);
}


export function sanitizeNarration(value, maxLen = 200) {
  return sanitizeText(value, maxLen);
}