# TMDT (Thương Mại Điện Tử) Implementation Guide

## Phase 1: Data Models - COMPLETED

### Models Created/Extended:

1. **User Model** (Extended)
   - Added: loyaltyPoints, customerTier, totalSpent, lastOrderDate, isVerified
   - Added: secondaryAddress, bankInfo, dateOfBirth
   - Methods: calculateTier(), getTierDiscount()

2. **Dish Model** (Extended)
   - Added: isActive, preparationTime
   - Existing: isBestSelling, totalOrdersCompleted

3. **Product Model** (Extended)
   - Added: isActive, warrantyMonths
   - Existing: isHot, isAutoHot, isBestSelling

4. **Coupon Model** (NEW)
   - Fields: code, discountType, discountValue, minOrderAmount, maxUses, validFrom, validUntil
   - Method: isValid()

5. **Review Model** (NEW)
   - Fields: rating, comment, images, verifiedPurchase, helpful
   - Status tracking: pending, approved, rejected

6. **QA Model** (NEW)
   - Fields: question, answer, status (pending/answered)
   - Admin can answer questions

7. **Warranty Model** (NEW)
   - Fields: warrantyPeriodMonths, issueDescription, status
   - Method: isActive()

### Order Model (Enhanced)
- Detailed status workflow: pending_approval → approved → assigned_shipper → shipped → delivered_success
- Added: couponCode, couponDiscount, loyaltyPointsEarned, loyaltyPointsUsed
- Added: approvedBy, assignedShipperId, deliveryAttempts tracking
- Added: collectionStatus for COD/debt tracking

---

## Phase 2: Utilities Created

### loyaltyManager.js
Functions for managing loyalty points and tiers:
- `calculatePointsFromOrder(amount)` - 1 point = 1,000 VND
- `updateUserTier(userId)` - Calculate and update tier
- `addLoyaltyPoints(userId, points)` - Add points
- `subtractLoyaltyPoints(userId, points)` - Subtract points
- `updateUserSpending(userId, amount)` - Update totalSpent and tier
- `getTierBenefits(tier)` - Get discount % for tier

### inventoryManager.js (Enhanced)
New methods added:
- `getActiveDishes()` - Only show isActive: true dishes
- `getActiveProducts()` - Only show isActive: true products
- `isDishVisible(dish)` - Check if should display publicly
- `isProductVisible(product)` - Check if should display publicly

---

## Phase 3: Tier System

### Tier Levels:
| Tier | Requirement | Discount |
|------|-------------|----------|
| Guest | New account | 0% |
| Loyal | 1 order OR 100,000đ | 0% |
| Silver | 500,000đ+ | 5% |
| Gold | 2,000,000đ+ | 7% |
| Platinum | 5,000,000đ+ | 10% |

### Implementation:
- User tier auto-calculates after each order
- Use `user.calculateTier()` in order completion flow
- Use `user.getTierDiscount()` for checkout calculations

---

## Phase 4: What's Ready to Use

### Backend Ready:
- All models defined and can be used immediately
- Loyalty manager utility functions available
- Inventory manager with isActive filtering
- Order workflow supports detailed status tracking
- Coupon, Review, QA, Warranty structures ready

### Next Steps Required:

1. **User Management Admin Panel**
   - Create route: GET /admin/users
   - View all users, filter by tier
   - Edit user info, manually adjust points
   - Reset password, suspend account

2. **Coupon Management**
   - Create routes: GET /admin/coupons (list)
   - POST /admin/coupons (create)
   - PUT /admin/coupons/:id (edit)
   - DELETE /admin/coupons/:id
   - Apply coupon in checkout

3. **Order Approval Workflow**
   - Middleware to check order status
   - Admin view: pending orders
   - Approve/reject orders
   - Assign shipper for delivery orders
   - Track delivery attempts

4. **Loyalty Features for Customers**
   - Profile page: show points, tier, benefits
   - Checkout: use points option
   - Reorder functionality
   - Order tracking

5. **Review & Q&A Display**
   - Product detail: show reviews/ratings
   - Allow logged-in users to leave reviews
   - Show Q&A section
   - Admin moderation dashboard

6. **Database Migrations**
   - Add new fields to existing users
   - Set default values for new fields
   - Create indexes on key fields (tier, totalSpent, isActive)

---

## Usage Examples

### Calculate User Tier After Order:
```javascript
const loyaltyManager = require("../utils/loyaltyManager");

// In order completion handler:
await loyaltyManager.updateUserSpending(userId, finalPrice);
const newTier = await loyaltyManager.updateUserTier(userId);
```

### Check if Item is Visible:
```javascript
const inventoryManager = require("../utils/inventoryManager");

const dishes = await inventoryManager.getActiveDishes({ category: "main" });
const products = await inventoryManager.getActiveProducts();
```

### Apply Coupon:
```javascript
const Coupon = require("../models/Coupon");

const coupon = await Coupon.findOne({ code: req.body.couponCode });
if (coupon && coupon.isValid()) {
  // Apply discount
  const discount = coupon.discountType === "percentage" 
    ? (orderTotal * coupon.discountValue) / 100 
    : coupon.discountValue;
  order.couponCode = coupon.code;
  order.couponDiscount = discount;
}
```

### Earn Loyalty Points:
```javascript
const points = loyaltyManager.calculatePointsFromOrder(finalPrice);
await loyaltyManager.addLoyaltyPoints(userId, points);
```

---

## Scoring Requirements Mapping

### Phase 1: Critical Features (Bắt buộc)
- Inventory management with visibility control ✓ (isActive field added)
- User tier system ✓ (Models + logic created)
- Order workflow with approval ✓ (Status enum updated)

### Phase 2: Important Features (3 điểm)
- Coupon system ✓ (Model created, needs routes)
- User management ❌ (Needs admin panel)
- Customer care (Q&A/Reviews) ✓ (Models created, needs display)
- Revenue statistics ❌ (Needs dashboard)

### Phase 3: Customer Features (5 điểm)
- Registration/Login ✓ (Already working)
- Product browsing ✓ (getActiveProducts ready)
- Loyal customer features ⚠️ (Models ready, UI needed)
- Search & discovery ❌ (Needs advanced filters)

### Phase 4: Infrastructure (2 điểm)
- Hosting ✓ (Vercel)
- SEO ⚠️ (Needs meta tags)
- UI/UX ✓ (Theme applied)
- Performance ⚠️ (Needs optimization)

---

## Current Status Summary

**Total Models/Features Implemented:** 10
- 7 Models created (User+, Dish+, Product+, Coupon, Review, QA, Warranty)
- 2 Utility files enhanced (loyaltyManager, inventoryManager)
- 1 System documentation (SYSTEM_FEATURES.md)

**Ready for Integration:** 80%
- All data structures in place
- Core logic utilities created
- Awaiting: Admin UI, customer UI, routes, integration tests

**Estimated Completion Timeline:**
- Admin Panel: 2-3 days
- Customer Features: 2-3 days
- Testing & Polish: 1-2 days
- Total: ~1 week for full TMDT compliance
