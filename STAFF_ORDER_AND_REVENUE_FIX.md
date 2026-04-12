# Staff Order Tracking & Revenue Management Fix

## Summary of Changes

This update implements the following improvements:

### 1. **Track Staff Who Create Orders on Behalf of Guests**

#### Models Updated:
- **Order Model** (`/models/Order.js`):
  - Added `createdByStaff` field to store the staff member (receptionist) who created the order
  - Type: ObjectId reference to User model with default null

#### Controllers Updated:
- **Reception Controller** (`/controllers/receptionController.js`):
  - When creating guest orders via `createOrder()`, now saves the `createdByStaff` with the receptionId
  - This allows tracking which receptionist created each guest order

- **Order Controller** (`/controllers/orderController.js`):
  - Updated `getOrders()` method to populate `createdByStaff` field
  - Updated `getOrderDetail()` method to populate `createdByStaff` field
  - Both fallback and primary queries now include the new field

#### Routes Updated:
- **User Routes** (`/routes/user.js`):
  - Updated `/payment/order/:orderId/confirm` to save guest order information to Payment model:
    - `isGuestOrder`: Boolean flag indicating if this is a guest order
    - `guestName`, `guestPhone`, `guestEmail`: Guest contact information
    - `depositAmount`: Amount deposited (100k for guest orders)
    - `createdByStaff`: Reference to the staff member who created the order

#### Views Updated:
- **Admin Order Detail View** (`/views/admin/orders/detail.ejs`):
  - Enhanced "Người tạo" (Creator) section to display:
    - Staff member's name
    - Staff member's role (Lễ tân/Nhân viên)
  - Shows `createdByStaff` when available, falls back to `staffId`

### 2. **Fixed Revenue Management Feature**

#### Issue Identified:
- Revenue controller was using hardcoded `{ bank: 0, cash: 0 }` object for payment method breakdown
- This prevented other payment methods from being tracked

#### Fix Applied:
- **Revenue Controller** (`/controllers/revenueController.js`):
  - Changed payment method breakdown to use dynamic object initialization
  - Now creates map entries for any payment method found in the data
  - Properly accumulates revenue by payment method

**Old Code:**
```javascript
const paymentMethods = { bank: 0, cash: 0 };
payments.forEach((p) => {
  const m = p.paymentMethod || "cash";
  if (paymentMethods.hasOwnProperty(m)) paymentMethods[m] += p.finalAmount || p.amount || 0;
  else paymentMethods.cash += p.finalAmount || p.amount || 0;
});
```

**New Code:**
```javascript
const paymentMethods = {};
payments.forEach((p) => {
  const m = p.paymentMethod || "cash";
  if (!paymentMethods[m]) paymentMethods[m] = 0;
  paymentMethods[m] += p.finalAmount || p.amount || 0;
});
```

## Flow Explanation

### Guest Order Creation Flow:
1. Receptionist creates an order via `/reception/orders/create`
2. Order saved with `createdByStaff` = receptionId
3. Order marked with `orderFor: "reception_behalf"`
4. Guest information saved (name, phone, email)
5. Customer proceeds to payment
6. Payment confirmation creates Payment record with all guest information and `createdByStaff` reference

### Order Management Display:
1. Admin views order at `/admin/orders/{id}`
2. Order detail page shows:
   - Guest information (name, phone, email, booking time, deposit)
   - **Người tạo (Creator)**: Shows name and role of staff who created order
   - Timeline with all order events

### Revenue Management:
1. Revenue statistics page accumulates payment data by:
   - Revenue type (delivery, reception, walkin_assist, guest_order)
   - Branch
   - Payment method (now supports any method, not just bank/cash)
   - Staff member (shipper/receptionist)
2. Properly calculates:
   - Daily average
   - Transaction count
   - Average transaction value
   - Payment method breakdown (all methods supported)

## Testing Recommendations

1. **Test Guest Order Creation**:
   - Login as reception staff
   - Create a guest order at `/reception/orders/create`
   - Verify order shows with created staff information

2. **Test Payment Processing**:
   - Complete payment for a guest order
   - Check Payment record has `createdByStaff` and guest information

3. **Test Revenue Management**:
   - Navigate to `/admin/revenue`
   - Verify payment method breakdown shows correctly
   - Check that all payment methods are tracked (transfer, bank, cash, etc.)
   - Verify revenue calculations are accurate

4. **Test Admin Order View**:
   - View guest order at `/admin/orders/{id}`
   - Verify "Người tạo" section shows staff name and role
   - Verify guest information is displayed correctly

## Files Modified

1. `/models/Order.js` - Added createdByStaff field
2. `/controllers/orderController.js` - Updated populate queries
3. `/controllers/receptionController.js` - Save createdByStaff on order creation
4. `/controllers/revenueController.js` - Fixed payment method breakdown
5. `/routes/user.js` - Save guest info in Payment record
6. `/views/admin/orders/detail.ejs` - Display createdByStaff information
