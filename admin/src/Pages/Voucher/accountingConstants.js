// FILE: admin/src/Pages/Voucher/accountingConstants.js  (NEW)
export const VOUCHER_TYPES = Object.freeze({
  CASH_PAYMENT: "cash_payment",
  CASH_RECEIPT: "cash_receipt",
  BANK_PAYMENT: "bank_payment",
  BANK_RECEIPT: "bank_receipt",
  JOURNAL: "journal",
  CONTRA: "contra",
  PURCHASE: "purchase",
  SALES: "sales",
  PETTY_CASH: "petty_cash",
});

// nature drives which side of the entry is pre-locked to Cash/Bank (1000/1010),
// and which accounts a user is allowed to pick on the other line(s).
export const VOUCHER_TYPE_CONFIG = {
  [VOUCHER_TYPES.CASH_PAYMENT]: {
    label: "Cash Payment Voucher",
    prefix: "CPV",
    partyLabel: "Paid To",
    fixedSide: "credit",
    fixedAccountCode: "1000",
    signatureRoles: ["Payee's Signature", "Accounts Officer", "Accountant", "ED. F&A/MD"],
    natureNote:
      "Cash decreases (Credit, fixed). Expense/Liability account increases (Debit).",
  },
  [VOUCHER_TYPES.CASH_RECEIPT]: {
    label: "Cash Receipt Voucher (Cash Credit)",
    prefix: "CRV",
    partyLabel: "Received From",
    fixedSide: "debit",
    fixedAccountCode: "1000",
    signatureRoles: ["Payee's Signature", "Accounts Officer", "Accountant", "ED. F&A/MD"],
    natureNote:
      "Cash increases (Debit, fixed). Income/Receivable account is Credit.",
  },
  [VOUCHER_TYPES.BANK_PAYMENT]: {
    label: "Bank Payment Voucher",
    prefix: "BPV",
    partyLabel: "Pay To",
    fixedSide: "credit",
    fixedAccountCode: "1010",
    signatureRoles: ["Receiver Signature", "Accountant", "HOD-FAD", "CFO"],
    natureNote:
      "Bank decreases (Credit, fixed). Expense/Liability account increases (Debit).",
  },
  [VOUCHER_TYPES.BANK_RECEIPT]: {
    label: "Bank Receipt Voucher (Bank Credit)",
    prefix: "BRV",
    partyLabel: "Received From",
    fixedSide: "debit",
    fixedAccountCode: "1010",
    signatureRoles: ["Receiver Signature", "Accountant", "HOD-FAD", "CFO"],
    natureNote:
      "Bank increases (Debit, fixed). Income/Receivable account is Credit.",
  },
  [VOUCHER_TYPES.JOURNAL]: {
    label: "Journal Voucher",
    prefix: "JV",
    partyLabel: "Pay To",
    fixedSide: null,
    fixedAccountCode: null,
    natureNote:
      "No cash/bank movement required. Any account Debit = any account Credit (credit purchase, depreciation, correction).",
  },
  [VOUCHER_TYPES.CONTRA]: {
    label: "Contra Voucher",
    prefix: "CV",
    partyLabel: null,
    fixedSide: null,
    fixedAccountCode: null,
    restrictToAccountCodes: ["1000", "1010"],
    natureNote:
      "Only between Cash (1000) and Bank (1010) — deposit to bank or cash withdrawal from bank.",
  },
  [VOUCHER_TYPES.PURCHASE]: {
    label: "Purchase Voucher (Credit Purchase)",
    prefix: "PUR",
    partyLabel: "Supplier",
    fixedSide: "credit",
    fixedAccountCode: "2000",
    restrictToTypes: ["Assets", "Expenses"],
    natureNote:
      "Goods/service received on credit. Inventory or Expense account increases (Debit). Accounts Payable increases (Credit, fixed) — settled later by a Payment Voucher.",
  },
  [VOUCHER_TYPES.SALES]: {
    label: "Sales Voucher (Credit Sale)",
    prefix: "SV",
    partyLabel: "Customer",
    fixedSide: "debit",
    fixedAccountCode: "1020",
    restrictToTypes: ["Income"],
    natureNote:
      "Goods/service sold on credit. Accounts Receivable increases (Debit, fixed). Sales/Service Income increases (Credit) — collected later by a Receipt Voucher.",
  },
  [VOUCHER_TYPES.PETTY_CASH]: {
    label: "Petty Cash Voucher",
    prefix: "PCV",
    partyLabel: "Paid To",
    fixedSide: "credit",
    fixedAccountCode: "1001",
    restrictToTypes: ["Expenses"],
    signatureRoles: ["Payee's Signature", "Accounts Officer", "Accountant"],
    natureNote:
      "Small day-to-day office expense paid from the petty cash float (1001), not the main Cash account (1000).",
  },
};

export const VOUCHER_NUMBER_STORAGE_KEY = "techof_voucher_counters";
export const GRN_PREFIX = "GRN";

export const COMPANY_INFO = {
  name: "TechOf Solution.",
  tagline: "Smart Mind Smart Solution",
  address: "House #383/1, Btv, Banasree Main Road #1219, Dhaka, Bangladesh",
  phone: "+880 1764-308876",
  email: "info@techofsolution.com",
  website: "www.techofsolution.com",
  logoPath: "/Image/Techof Logo.jpeg",
};