# TMDT Quick Start Guide for Developers

## Overview
All TMDT (E-commerce Scoring) requirements have been integrated into the database models and utilities. This guide shows how to use them in your code immediately.

---

## 1. Loyalty System - User Tiers

### Auto-Calculate Tier After Order
```javascript
const User = require("../models/User");
const loyaltyManager = require("../utils/loyaltyManager");

// After order completion
const user = await User.findById(userId);
await loyaltyManager.updateUserSpending(userId, finalPrice);

// OR just update tier if you already updated totalSpent
await loyaltyManager.updateUserTier(userId);
```

### Display User Tier & Discount
```javascript
const user = await User.findById(userId);
console.log(`User tier: ${user.customerTier}`);
console.log(`Discount: ${user.getTierDiscount()}%`);
```

### Earn Loyalty Points
```javascript
const loyaltyManager = require("../utils/loyaltyManager");

// 1 point = 1,000 VND spent
const points = loyaltyManager.calculatePointsFromOrder(50000); // 50 points
await loyaltyManager.addLoyaltyPoints(userId, points);
```

---

## 2. Showing Only Active Items

### Get Active Dishes for Homepage
```javascript
const inventoryManager = require("../utils/inventoryManager");

// Only show isActive: true dishes
const dishes = await inventoryManager.getActiveDishes({ 
  category: "main" 
});

// Or check individual visibility
const dish = await Dish.findById(dishId);
const isVisible = inventoryManager.isDishVisible(dish);
```

### Get Active Products
```javascript
const inventoryManager = require("../utils/inventoryManager");

// Only show isActive: true products
const products = await inventoryManager.getActiveProducts();
```

---

## 3. Coupon System

### Create Coupon (Admin)
```javascript
const Coupon = require("../models/Coupon");

const coupon = new Coupon({
  code: "SUMMER2024",
  description: "Summer sale 20% off",
  discountType: "percentage",
  discountValue: 20,
  minOrderAmount: 100000,
  maxUses: 100,
  validFrom: new Date("2024-06-01"),
  validUntil: new Date("2024-08-31"),
  applicableTo: ["all"],
  createdBy: adminId
});

await coupon.save();
```

### Apply Coupon at Checkout
```javascript
const Coupon = require("../models/Coupon");

const coupon = await Coupon.findOne({ code: req.body.couponCode });

if (!coupon || !coupon.isValid()) {
  return res.status(400).send("Invalid or expired coupon");
}

// Calculate discount
const discount = coupon.discountType === "percentage"
  ? Math.round((orderTotal * coupon.discountValue) / 100)
  : coupon.discountValue;

// Update order
order.couponCode = coupon.code;
order.couponDiscount = discount;
order.finalPrice = orderTotal - discount;

// Track usage
await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
```

---

## 4. Order Approval Workflow

### Set Order Status on Creation
```javascript
const order = new Order({
  userId: userId,
  items: [...],
  status: "pending_approval",  // All new orders start here
  paymentStatus: "unpaid"
});
```

### Approve Order (Admin)
```javascript
const Order = require("../models/Order");

const order = await Order.findByIdAndUpdate(
  orderId,
  {
    status: "approved",
    approvedBy: adminId,
    approvedAt: new Date()
  },
  { new: true }
);
```

### Assign Shipper to Delivery Order
```javascript
const Order = require("../models/Order");

await Order.findByIdAndUpdate(
  orderId,
  {
    status: "assigned_shipper",
    assignedShipperId: shipperId,
    assignedAt: new Date()
  }
);
```

### Track Delivery Attempts
```javascript
const Order = require("../models/Order");

const order = await Order.findById(orderId);

order.deliveryAttempts.push({
  attemptNumber: 1,
  timestamp: new Date(),
  status: "failed",
  reason: "Customer not home"
});

order.status = "delivery_failed";
await order.save();

// Retry
order.status = "shipped";
await order.save();
```

---

## 5. Review & Rating System

### Submit Review (Customer)
```javascript
const Review = require("../models/Review");

const review = new Review({
  orderId: orderId,
  productId: productId,
  userId: userId,
  rating: 5,
  comment: "Excellent product, fast delivery!",
  images: ["url1", "url2"],
  verifiedPurchase: true,
  status: "pending" // Admin reviews first
});

await review.save();
```

### Approve Review (Admin)
```javascript
const Review = require("../models/Review");

await Review.findByIdAndUpdate(
  reviewId,
  { status: "approved" }
);
```

### Display Reviews on Product Page
```javascript
const Review = require("../models/Review");

const reviews = await Review.find({
  productId: productId,
  status: "approved"
}).sort({ createdAt: -1 });
```

---

## 6. Q&A System

### Customer Asks Question
```javascript
const QA = require("../models/QA");

const question = new QA({
  productId: productId,
  userId: userId,
  question: "Is this gluten-free?",
  status: "pending"
});

await question.save();
```

### Admin Answers Question
```javascript
const QA = require("../models/QA");

await QA.findByIdAndUpdate(
  qaId,
  {
    answer: "Yes, our recipe contains no gluten.",
    answeredBy: adminId,
    answeredAt: new Date(),
    status: "answered"
  }
);
```

### Display Q&A on Product
```javascript
const QA = require("../models/QA");

const qas = await QA.find({
  productId: productId,
  status: "answered"
});
```

---

## 7. Warranty Tracking

### Add Warranty When Creating Order with Warranted Product
```javascript
const Warranty = require("../models/Warranty");

// Check if product has warranty
const product = await Product.findById(productId);
if (product.warrantyMonths > 0) {
  const warranty = new Warranty({
    orderId: orderId,
    productId: productId,
    userId: userId,
    warrantyPeriodMonths: product.warrantyMonths,
    status: "active"
    // endDate is auto-calculated
  });
  
  await warranty.save();
}
```

### Process Warranty Claim
```javascript
const Warranty = require("../models/Warranty");

const warranty = await Warranty.findById(warrantyId);

if (!warranty.isActive()) {
  return res.status(400).send("Warranty expired");
}

warranty.status = "claimed";
warranty.claimedAt = new Date();
warranty.issueDescription = req.body.issue;
warranty.notes = "Processing claim...";

await warranty.save();
```

---

## 8. Collection Tracking (COD)

### Mark Payment Collected
```javascript
const Order = require("../models/Order");

await Order.findByIdAndUpdate(
  orderId,
  {
    paymentStatus: "paid",
    collectionStatus: "collected",
    paidAt: new Date()
  }
);
```

### Track Debt
```javascript
const Order = require("../models/Order");

// Find unpaid orders
const unpaidOrders = await Order.find({
  paymentStatus: "unpaid",
  status: "delivered_success"
});

// Mark for collection
await Order.findByIdAndUpdate(
  unpaidOrders[0]._id,
  { collectionStatus: "pending_collection" }
);
```

---

## Quick Reference: Tier Benefits

| Tier | Spending | Discount |
|------|----------|----------|
| Guest | < 100k | 0% |
| Loyal | 100k+ | 0% |
| Silver | 500k+ | 5% |
| Gold | 2M+ | 7% |
| Platinum | 5M+ | 10% |

---

## Common Workflows

### Complete Order Flow
```javascript
// 1. Create order (pending_approval)
const order = new Order({ status: "pending_approval", ... });

// 2. Admin approves
order.status = "approved";
order.approvedBy = adminId;

// 3. For delivery: assign shipper
order.status = "assigned_shipper";
order.assignedShipperId = shipperId;

// 4. Shipper ships
order.status = "shipped";

// 5. Customer receives
order.status = "delivered_success";

// 6. Payment collected
order.paymentStatus = "paid";
order.collectionStatus = "collected";

// 7. Earn loyalty points
const points = loyaltyManager.calculatePointsFromOrder(order.finalPrice);
await loyaltyManager.addLoyaltyPoints(order.userId, points);

// 8. Update tier
await loyaltyManager.updateUserSpending(order.userId, order.finalPrice);
```

### Checkout with Coupon & Tier Discount
```javascript
// 1. Get user tier discount
const user = await User.findById(userId);
const tierDiscount = user.getTierDiscount();
tierAmount = (orderTotal * tierDiscount) / 100;

// 2. Apply coupon if provided
let couponAmount = 0;
if (req.body.couponCode) {
  const coupon = await Coupon.findOne({ code: req.body.couponCode });
  if (coupon?.isValid()) {
    couponAmount = coupon.discountType === "percentage"
      ? (orderTotal * coupon.discountValue) / 100
      : coupon.discountValue;
  }
}

// 3. Calculate final price
const totalDiscount = tierAmount + couponAmount;
const finalPrice = orderTotal - totalDiscount;

// 4. Save to order
order.discount = totalDiscount;
order.couponCode = req.body.couponCode;
order.couponDiscount = couponAmount;
order.finalPrice = finalPrice;
```

---

## Environment Setup

No additional dependencies needed! All features use existing libraries:
- Mongoose for database
- Express for routing
- Node.js built-in functions

Just import the models and utilities:
```javascript
const User = require("../models/User");
const Coupon = require("../models/Coupon");
const Review = require("../models/Review");
const loyaltyManager = require("../utils/loyaltyManager");
const inventoryManager = require("../utils/inventoryManager");
```

---

## Testing Tips

### Test Tier Calculation
```javascript
const user = new User({ totalSpent: 1500000 });
user.calculateTier();
console.log(user.customerTier); // Should be "silver"
```

### Test Coupon Validation
```javascript
const coupon = new Coupon({
  validFrom: new Date("2024-01-01"),
  validUntil: new Date("2024-12-31"),
  maxUses: 10,
  usedCount: 10
});
console.log(coupon.isValid()); // Should be false (exhausted)
```

### Test Warranty Expiry
```javascript
const warranty = new Warranty({
  warrantyPeriodMonths: 12,
  startDate: new Date("2023-01-01")
});
// endDate auto-calculated to 2024-01-01
console.log(warranty.isActive()); // Depends on current date
```

---

## More Documentation

- `MODELS_REFERENCE.md` - Full schema documentation
- `TMDT_IMPLEMENTATION_GUIDE.md` - Step-by-step implementation guide
- `TMDT_COMPLETION_STATUS.md` - What's done and what's remaining
