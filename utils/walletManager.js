const User = require("../models/User")
const WalletTransaction = require("../models/WalletTransaction")

// Vietnamese banks supported by the VietQR image service. The `code` is what
// img.vietqr.io expects when building a scannable transfer QR.
const BANKS = [
  { code: "970436", name: "Vietcombank" },
  { code: "970418", name: "BIDV" },
  { code: "970405", name: "Agribank" },
  { code: "970415", name: "VietinBank" },
  { code: "970422", name: "MB Bank" },
  { code: "970407", name: "Techcombank" },
  { code: "970416", name: "ACB" },
  { code: "970432", name: "VPBank" },
  { code: "970423", name: "TPBank" },
  { code: "970403", name: "Sacombank" },
  { code: "970443", name: "SHB" },
  { code: "970441", name: "VIB" },
  { code: "970426", name: "MSB" },
  { code: "970431", name: "Eximbank" },
  { code: "970437", name: "HDBank" },
  { code: "970448", name: "OCB" },
  { code: "970429", name: "SCB" },
  { code: "970454", name: "VietCapital Bank" },
  { code: "546034", name: "Cake by VPBank" },
  { code: "963388", name: "Timo" },
]

function getBanks() {
  return BANKS
}

function findBank(codeOrName) {
  const needle = String(codeOrName || "").trim().toLowerCase()
  if (!needle) return null
  return (
    BANKS.find((b) => b.code === needle) ||
    BANKS.find((b) => b.name.toLowerCase() === needle) ||
    null
  )
}

// Build a scannable VietQR transfer image. Falls back to a generic QR encoder
// when the bank is unknown so the admin always has something to scan.
function buildQrUrl({ bankCode, bankName, accountNumber, accountHolder, amount, note }) {
  const bank = findBank(bankCode) || findBank(bankName)
  const account = String(accountNumber || "").replace(/\s+/g, "")
  const safeAmount = Math.max(0, Math.round(Number(amount) || 0))
  const addInfo = String(note || "Hoan tien vi").slice(0, 50)

  if (bank && account) {
    const params = new URLSearchParams({
      amount: String(safeAmount),
      addInfo,
      accountName: String(accountHolder || "").slice(0, 50),
    })
    return `https://img.vietqr.io/image/${bank.code}-${account}-compact2.png?${params.toString()}`
  }

  // Unknown bank: encode the raw transfer details as text so it is still usable.
  const fallback = `Bank: ${bankName || "N/A"} | STK: ${account} | Chu TK: ${accountHolder || "N/A"} | So tien: ${safeAmount} | ND: ${addInfo}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(fallback)}`
}

function normalizeAmount(amount) {
  const value = Math.round(Number(amount) || 0)
  return value > 0 ? value : 0
}

// Add money to a wallet and record the movement. Uses an atomic $inc so
// concurrent refunds cannot overwrite each other's balance.
async function credit(userId, amount, options = {}) {
  const value = normalizeAmount(amount)
  if (!userId || value <= 0) return null

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: value } },
    { new: true },
  ).select("walletBalance")

  if (!user) return null

  const transaction = await WalletTransaction.create({
    userId,
    direction: "credit",
    type: options.type || "order_refund",
    amount: value,
    balanceAfter: user.walletBalance,
    orderId: options.orderId || null,
    refundRequestId: options.refundRequestId || null,
    description: options.description || "",
  })

  console.log("[restaurant] Wallet credited:", { userId: String(userId), amount: value, balance: user.walletBalance })
  return { balance: user.walletBalance, transaction }
}

// Remove money from a wallet. The conditional update guarantees the balance can
// never go negative even if two debits race each other.
async function debit(userId, amount, options = {}) {
  const value = normalizeAmount(amount)
  if (!userId || value <= 0) return null

  const user = await User.findOneAndUpdate(
    { _id: userId, walletBalance: { $gte: value } },
    { $inc: { walletBalance: -value } },
    { new: true },
  ).select("walletBalance")

  if (!user) {
    console.log("[restaurant] Wallet debit rejected (insufficient balance):", { userId: String(userId), amount: value })
    return null
  }

  const transaction = await WalletTransaction.create({
    userId,
    direction: "debit",
    type: options.type || "order_payment",
    amount: value,
    balanceAfter: user.walletBalance,
    orderId: options.orderId || null,
    refundRequestId: options.refundRequestId || null,
    description: options.description || "",
  })

  console.log("[restaurant] Wallet debited:", { userId: String(userId), amount: value, balance: user.walletBalance })
  return { balance: user.walletBalance, transaction }
}

async function getBalance(userId) {
  if (!userId) return 0
  const user = await User.findById(userId).select("walletBalance")
  return user && user.walletBalance ? user.walletBalance : 0
}

module.exports = { credit, debit, getBalance, getBanks, findBank, buildQrUrl }
