// FILE: admin/src/Pages/Voucher/accountingHelpers.js  (NEW)
import { VOUCHER_TYPE_CONFIG, VOUCHER_NUMBER_STORAGE_KEY } from "./accountingConstants";

let cachedChartOfAccounts = null;

export async function loadChartOfAccounts() {
  if (cachedChartOfAccounts) return cachedChartOfAccounts;
  const res = await fetch("/JSON/chartOfAccounts.json");
  if (!res.ok) throw new Error("Failed to load chart of accounts.");
  const data = await res.json();
  cachedChartOfAccounts = Array.isArray(data) ? data : [];
  return cachedChartOfAccounts;
}

export function groupAccountsByType(accounts) {
  return accounts.reduce((groups, acc) => {
    const key = acc.type || "Other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(acc);
    return groups;
  }, {});
}

export function findAccountByCode(accounts, code) {
  return accounts.find((a) => a.code === code) || null;
}

export function clampAmount(value, min = 0, max = 999999999) {
  const num = Number(value);
  if (Number.isNaN(num)) return min;
  return Math.min(Math.max(num, min), max);
}

export function sanitizeNarration(value, maxLength = 300) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

// Core double-entry rule enforcement: every voucher, of every type, must balance.
export function validateDoubleEntry(lines) {
  const totalDebit = lines.reduce((sum, l) => sum + clampAmount(l.debit), 0);
  const totalCredit = lines.reduce((sum, l) => sum + clampAmount(l.credit), 0);
  const hasAtLeastOneAccount = lines.some(
    (l) => l.accountCode && (clampAmount(l.debit) > 0 || clampAmount(l.credit) > 0)
  );

  if (!hasAtLeastOneAccount) {
    return { valid: false, message: "Add at least one account line with an amount.", totalDebit: 0, totalCredit: 0 };
  }
  if (totalDebit === 0 && totalCredit === 0) {
    return { valid: false, message: "Total debit and credit cannot both be zero.", totalDebit, totalCredit };
  }
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return {
      valid: false,
      message: `Debit (${totalDebit.toFixed(2)}) and Credit (${totalCredit.toFixed(2)}) must be equal.`,
      totalDebit,
      totalCredit,
    };
  }
  return { valid: true, message: "", totalDebit, totalCredit };
}

function readCounters() {
  try {
    const raw = localStorage.getItem(VOUCHER_NUMBER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCounters(counters) {
  localStorage.setItem(VOUCHER_NUMBER_STORAGE_KEY, JSON.stringify(counters));
}

// Each voucher type gets its own independent sequence (CPV-2026-0001, JV-2026-0001, ...).
export function generateVoucherNumber(voucherType) {
  const config = VOUCHER_TYPE_CONFIG[voucherType];
  const prefix = config?.prefix || "VCH";
  const counters = readCounters();
  const next = (counters[voucherType] || 0) + 1;
  counters[voucherType] = next;
  writeCounters(counters);
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(next).padStart(4, "0")}`;
}

export function generateGrnNumber() {
  const counters = readCounters();
  const next = (counters["grn"] || 0) + 1;
  counters["grn"] = next;
  writeCounters(counters);
  return `GRN-${String(next).padStart(5, "0")}`;
}

export function generateLineId() {
  return `ln_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyVoucherLine(prefill = {}) {
  return { id: generateLineId(), accountCode: "", narration: "", debit: 0, credit: 0, ...prefill };
}