# Database Models Reference

## 1. User Model

**Location:** `/models/User.js`

### New Fields Added:
```javascript
loyaltyPoints: Number (default: 0)
customerTier: Enum ["guest", "loyal", "silver", "gold", "platinum"]
totalSpent: Number (default: 0)
lastOrderDate: Date
isVerified: Boolean (default: false)
secondaryAddress: String
bankInfo: {
  accountNumber: String,
  bankName: String,
  accountHolder: String
}
dateOfBirth: Date
```

### New Methods:
```javascript
user.calculateTier() // Updates customerTier based on totalSpent
user.getTierDiscount() // Returns discount % (0, 5, 7, 10)
```

### Tier Calculation Logic:
- Guest: <100,000đ
- Loyal: 100,000đ OR 1+ orders
- Silver: 500,000đ+
- Gold: 2,000,000đ+
- Platinum: 5,000,000đ+

---

## 2. Dish Model

**Location:** `/models/Dish.js`

### New Fields:
```javascript
isActive: Boolean (default: true)  // Controls visibility
preparationTime: Number (default: 15) // Minutes
```

### Existing Important Fields:
```javascript
isBestSelling: Boolean
bestSellingPromotedAt: Date
totalOrdersCompleted: Number
quantity: Number
```

---

## 3. Product Model

**Location:** `/models/Product.js`

### New Fields:
```javascript
isActive: Boolean (default: true)     // Controls visibility
warrantyMonths: Number (default: 0)   // 0 = no warranty
```

### Existing Important Fields:
```javascript
isHot: Boolean           // Manual OR auto-promoted at 100 orders
isAutoHot: Boolean       // Flag for auto-promotion
isBestSelling: Boolean   // 24-hour rotation
totalOrdersCompleted: Number
quantity: Number
```

---

## 4. Coupon Model

**Location:** `/models/Coupon.js` (NEW)

```javascript
{
  code: String (unique, uppercase)
  description: String
  discountType: Enum ["percentage", "fixed_amount"]
  discountValue: Number (required)
  minOrderAmount: Number (optional)
  maxUses: Number (-1 = unlimited)
  usedCount: Number (tracks usage)
  validFrom: Date (required)
  validUntil: Date (required)
  applicableTo: Array ["dishes", "products", "all"]
  createdBy: ObjectId (admin who created)
  isActive: Boolean (default: true)
  createdAt: Date
}
```

### Methods:
```javascript
coupon.isValid() // Checks expiry, usage limits, active status
```

### Example Usage:
```javascript
const coupon = await Coupon.findOne({ code: "SUMMER2024" });
if (coupon.isValid()) {
  // Apply discount
  const discount = coupon.discountType === "percentage"
    ? (total * coupon.discountValue) / 100
    : coupon.discountValue;
}
```

---

## 5. Review Model

**Location:** `/models/Review.js` (NEW)

```javascript
{
  orderId: ObjectId (ref: Order, required)
  productId: ObjectId (ref: Product) OR
  dishId: ObjectId (ref: Dish)
  userId: ObjectId (ref: User, required)
  rating: Number (1-5, required)
  comment: String
  images: [String] // URLs
  verifiedPurchase: Boolean (default: true)
  helpful: Number (vote count, default: 0)
  status: Enum ["pending", "approved", "rejected"]
  createdAt: Date
  updatedAt: Date
}
```

### Workflow:
1. User submits review (status: "pending")
2. Admin approves/rejects
3. If approved, display on product page

---

## 6. QA Model

**Location:** `/models/QA.js` (NEW)

```javascript
{
  productId: ObjectId (ref: Product) OR
  dishId: ObjectId (ref: Dish)
  userId: ObjectId (ref: User, required) // Who asked
  question: String (required)
  answer: String (optional)
  answeredBy: ObjectId (ref: User) // Admin who answered
  answeredAt: Date
  helpful: Number (vote count, default: 0)
  status: Enum ["pending", "answered"]
  createdAt: Date
}
```

### Example:
- Customer asks: "Is this gluten-free?"
- Admin answers: "Yes, our recipe is gluten-free."
- Displayed under product Q&A section

---

## 7. Warranty Model

**Location:** `/models/Warranty.js` (NEW)

```javascript
{
  orderId: ObjectId (ref: Order, required)
  productId: ObjectId (ref: Product, required)
  userId: ObjectId (ref: User, required)
  warrantyPeriodMonths: Number (required)
  issueDescription: String
  status: Enum ["active", "claimed", "expired", "resolved"]
  startDate: Date (default: now)
  endDate: Date (auto-calculated)
  claimedAt: Date
  resolvedAt: Date
  notes: String
  createdAt: Date
}
```

### Auto-Calculation:
```javascript
// endDate automatically set to: startDate + warrantyPeriodMonths
```

### Methods:
```javascript
warranty.isActive() // Check if still within warranty period
```

---

## 8. Order Model

**Location:** `/models/Order.js` (ENHANCED)

### New Fields:
```javascript
// Detailed status workflow
status: Enum [
  "pending_approval",    // New order awaiting admin review
  "approved",           // Admin approved, ready for processing
  "assigned_shipper",   // Delivery: shipper assigned
  "shipped",            // Delivery: in transit
  "delivery_failed",    // Delivery: failed attempt
  "delivered_success",  // Delivery: delivered
  "confirmed",          // Dine-in: confirmed reservation
  "preparing",          // Dine-in: kitchen preparing
  "ready",             // Dine-in: ready for pickup
  "served",            // Dine-in: served to customer
  "payment_pending",    // Waiting for payment
  "payment_completed"   // Payment received
]

// Approval workflow
approvedBy: ObjectId (ref: User)
approvedAt: Date

// Shipper assignment
assignedShipperId: ObjectId (ref: User)
assignedAt: Date
deliveryAttempts: [{
  attemptNumber: Number
  timestamp: Date
  status: Enum ["success", "failed", "rescheduled"]
  reason: String
}]

// Coupon and loyalty
couponCode: String
couponDiscount: Number
loyaltyPointsEarned: Number
loyaltyPointsUsed: Number

// Collection tracking
collectionStatus: Enum ["not_collected", "pending_collection", "collected"]
```

---

## Relationships Diagram

```
User
├── orders (Order[])
├── reviews (Review[])
├── qaQuestions (QA[])
└── loyalty data

Order
├── user (User)
├── items[].dish (Dish) or items[].product (Product)
├── shipper (User)
├── approvedBy (User)
├── coupon (Coupon reference by code)
└── warranty (Warranty if product with warranty)

Product/Dish
├── reviews (Review[])
├── qaItems (QA[])
└── warranty (Warranty reference)

Coupon
└── createdBy (User/Admin)

Review
├── order (Order)
├── product (Product) or dish (Dish)
└── user (User)

QA
├── product (Product) or dish (Dish)
└── user (User)
└── answeredBy (User/Admin)

Warranty
├── order (Order)
├── product (Product)
└── user (User)
```

---

## Indexing Recommendations

For optimal performance, create indexes on:

```javascript
// User
db.users.createIndex({ customerTier: 1 })
db.users.createIndex({ totalSpent: 1 })
db.users.createIndex({ createdAt: -1 })

// Dish
db.dishes.createIndex({ isActive: 1 })
db.dishes.createIndex({ category: 1, isActive: 1 })
db.dishes.createIndex({ isBestSelling: 1 })

// Product
db.products.createIndex({ isActive: 1 })
db.products.createIndex({ isHot: 1 })
db.products.createIndex({ isBestSelling: 1 })

// Order
db.orders.createIndex({ userId: 1, createdAt: -1 })
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ paymentStatus: 1 })

// Coupon
db.coupons.createIndex({ code: 1 })
db.coupons.createIndex({ validUntil: 1 })

// Review
db.reviews.createIndex({ productId: 1, status: 1 })
db.reviews.createIndex({ dishId: 1, status: 1 })
db.reviews.createIndex({ rating: -1 })

// QA
db.qas.createIndex({ productId: 1, status: 1 })
db.qas.createIndex({ dishId: 1, status: 1 })

// Warranty
db.warranties.createIndex({ productId: 1, status: 1 })
db.warranties.createIndex({ endDate: 1 })
```
