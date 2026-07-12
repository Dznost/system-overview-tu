const attempts = new Map()

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

function normalizePhone(value = "") {
  let phone = String(value).replace(/\D/g, "")
  if (phone.startsWith("84")) phone = `0${phone.slice(2)}`
  if (!/^0(3|5|7|8|9)\d{8}$/.test(phone)) return null
  return phone
}

function orderCode(order) {
  return order.orderCode || order._id.toString().slice(-8).toUpperCase()
}

function limiterKey(req) {
  return `${req.ip || req.socket.remoteAddress || "unknown"}:${req.sessionID || "anonymous"}`
}

function getLimit(req) {
  const key = limiterKey(req)
  const now = Date.now()
  let entry = attempts.get(key)
  if (entry && entry.expiresAt <= now) {
    attempts.delete(key)
    entry = null
  }
  return {
    key,
    remaining: entry ? Math.max(0, MAX_ATTEMPTS - entry.count) : MAX_ATTEMPTS,
    retryAfterMs: entry ? Math.max(0, entry.expiresAt - now) : 0,
    locked: Boolean(entry && entry.count >= MAX_ATTEMPTS),
  }
}

function recordFailure(req) {
  const { key } = getLimit(req)
  const now = Date.now()
  const entry = attempts.get(key)
  const next = entry && entry.expiresAt > now
    ? { count: entry.count + 1, expiresAt: entry.expiresAt }
    : { count: 1, expiresAt: now + WINDOW_MS }
  attempts.set(key, next)
  return getLimit(req)
}

function clearFailures(req) {
  attempts.delete(limiterKey(req))
}

function grantGuestAccess(req, phone) {
  req.session.guestOrderAccess = {
    phone,
    expiresAt: Date.now() + WINDOW_MS,
  }
}

function hasGuestAccess(req, phone) {
  const access = req.session.guestOrderAccess
  return Boolean(access && access.phone === phone && access.expiresAt > Date.now())
}

function appendHistory(order, { status, actor, note = "" }) {
  order.statusHistory = order.statusHistory || []
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    actorId: actor && actor._id ? actor._id : null,
    actorRole: actor && actor.role ? actor.role : "system",
    actorName: actor && actor.name ? actor.name : "Hệ thống",
    note,
  })
}

module.exports = {
  MAX_ATTEMPTS,
  WINDOW_MS,
  normalizePhone,
  orderCode,
  getLimit,
  recordFailure,
  clearFailures,
  grantGuestAccess,
  hasGuestAccess,
  appendHistory,
}
