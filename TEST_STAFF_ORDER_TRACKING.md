# Testing Guide: Staff Order Tracking & Revenue Fix

## Overview
This guide provides step-by-step instructions to verify that:
1. Guest orders created by staff are properly tracked with staff information
2. Payment information is saved with guest order details
3. Revenue management dashboard works correctly with all payment methods

---

## Test 1: Create a Guest Order as Receptionist

### Prerequisites
- You have access to the reception dashboard
- At least one branch exists in the system
- At least one dish is marked as available

### Steps

1. **Login as Receptionist**
   - Navigate to login page
   - Use reception staff credentials
   - Confirm you see the reception dashboard

2. **Create Guest Order**
   - Click on "Đặt Đơn Hàng Hộ Khách" or navigate to `/reception/orders/create`
   - Fill in guest information:
     - Tên khách: "Nguyễn Văn A"
     - Số điện thoại: "0912345678"
     - Email: "guest@example.com"
   - Select booking date/time (must be 2+ hours from now)
   - Select at least 2 dishes with quantities
   - Add special requests (optional)
   - Click "Tạo Đơn"

3. **Verify Order Created**
   - System redirects to confirmation page
   - Order shows in reception orders list
   - Order status is "pending"
   - Deposit amount (100,000đ) is included in total

### Expected Results
✅ Order created successfully
✅ Order shows guest information
✅ Order type is marked as "Đặt hộ khách" (guest order)
✅ Staff name appears as order creator

---

## Test 2: Complete Payment for Guest Order

### Prerequisites
- Guest order created from Test 1 exists
- Order status is still "pending"

### Steps

1. **Navigate to Payment**
   - Go to `/user/payment/order/{orderId}`
   - Verify order details show correctly
   - Verify final price includes 100k deposit

2. **Complete Payment**
   - Select payment method (transfer/bank)
   - Click "Thanh Toán"
   - Confirm payment success message

3. **Verify Payment Record**
   - Check database or admin panel
   - Confirm Payment record created with:
     - `isGuestOrder: true`
     - `guestName: "Nguyễn Văn A"`
     - `guestPhone: "0912345678"`
     - `guestEmail: "guest@example.com"`
     - `depositAmount: 100000`
     - `createdByStaff: {ObjectId of receptionist}`

### Expected Results
✅ Payment processed successfully
✅ Order status changes to "paid"
✅ Payment record includes all guest information
✅ createdByStaff field populated correctly

---

## Test 3: View Guest Order in Admin Panel

### Prerequisites
- Guest order from Test 1 exists and is paid (from Test 2)

### Steps

1. **Access Admin Orders**
   - Login as admin
   - Navigate to `/admin/orders`

2. **Find Guest Order in List**
   - Look for order marked with "Đặt Hộ Khách" badge
   - Verify guest name displays
   - Verify staff creator name shows (e.g., "Boi: [Staff Name]")

3. **Click Order Detail**
   - Click on the order's detail link
   - Verify order detail page loads

4. **Check Guest Information Section**
   - Look for "Đơn Đặt Hộ Khách" section on right panel
   - Verify displays:
     - Guest name
     - Guest phone
     - Guest email
     - Booking time
     - Deposit amount (100,000đ)
     - **Người tạo** (Creator): Staff name and role

### Expected Results
✅ Guest order list shows staff creator
✅ Order detail displays complete guest information
✅ "Người tạo" section shows staff name and role
✅ All guest details accurately saved and displayed

---

## Test 4: Revenue Management with Payment Method Breakdown

### Prerequisites
- At least 3-5 paid orders exist in the system
- Orders should have different payment methods (transfer, bank, cash)
- Orders can be from different types (delivery, reception)

### Steps

1. **Access Revenue Dashboard**
   - Login as admin
   - Navigate to `/admin/revenue`

2. **View Revenue Statistics**
   - Check "Thống Kê Doanh Thu" page loads without errors
   - Verify displays:
     - Total system revenue
     - Daily average revenue
     - Total transactions count
     - Average transaction value

3. **Check Payment Method Breakdown**
   - Scroll to "Payment Method Breakdown" or similar section
   - Verify ALL payment methods appear (not just bank/cash)
   - Example: transfer, bank, cash, card, wallet, etc.
   - Verify amounts for each method are accumulated correctly

4. **Verify Revenue by Type**
   - Check "Delivery Revenue" section
   - Check "Reception Revenue" section
   - Verify totals match the orders you created
   - Verify shipper/staff breakdown shows correct names and totals

5. **View Monthly Chart**
   - If viewing yearly data, verify monthly breakdown chart
   - Verify both delivery and reception data displayed
   - No console errors should appear

### Expected Results
✅ Revenue page loads without errors
✅ All payment methods appear in breakdown (not hardcoded)
✅ Revenue calculations are accurate
✅ No errors in console
✅ Charts and statistics display correctly

---

## Test 5: Revenue with Guest Orders

### Prerequisites
- Guest order from Test 1-3 is paid
- Other regular orders exist

### Steps

1. **Check Revenue Statistics**
   - Go to `/admin/revenue`
   - Verify guest order revenue is included in total

2. **Verify Receptionist Revenue**
   - Look for "Reception Revenue" breakdown
   - Find the receptionist who created guest orders
   - Verify their accumulated revenue includes guest order amount

3. **Check by Branch**
   - Look for "Branch Revenue" or similar
   - Verify guest order revenue counted toward correct branch

### Expected Results
✅ Guest order revenue properly categorized
✅ Staff revenue tracking accurate
✅ Branch revenue includes guest orders
✅ All breakdowns calculate correctly

---

## Test 6: Order List Filtering and Search

### Prerequisites
- Multiple guest orders created
- At least one regular order

### Steps

1. **Filter by Order Type**
   - Go to `/admin/orders`
   - Use "Loại đơn" filter
   - Select "Tại quán" (dine-in) if guest orders are dine-in
   - Verify guest orders appear

2. **Search by Guest Name**
   - Use search box
   - Type guest name
   - Verify guest order appears in results with correct staff name

3. **Filter by Status**
   - Apply different status filters
   - Verify guest orders appear/hide correctly

### Expected Results
✅ Search finds guest orders by name
✅ Filters work correctly
✅ Staff creator name displays in list
✅ No errors in search/filter

---

## Test 7: Database Verification

### Prerequisites
- You have database access
- Guest order created and paid from earlier tests

### Steps

1. **Check Order Document**
   ```
   db.orders.findOne({orderFor: "reception_behalf"})
   ```
   - Verify `createdByStaff` field exists
   - Verify it references correct staff ObjectId
   - Verify `guestName`, `guestPhone`, `guestEmail` populated

2. **Check Payment Document**
   ```
   db.payments.findOne({isGuestOrder: true})
   ```
   - Verify `isGuestOrder: true`
   - Verify `createdByStaff` populated
   - Verify `guestName`, `guestPhone`, `guestEmail` populated
   - Verify `depositAmount` is 100000

3. **Check Revenue Calculation**
   ```
   db.payments.aggregate([
     {$group: {_id: "$paymentMethod", total: {$sum: "$finalAmount"}}}
   ])
   ```
   - Verify all payment methods appear in results
   - Not limited to just "bank" and "cash"

### Expected Results
✅ Order document has createdByStaff field
✅ Payment document captures guest information
✅ Payment method breakdown works dynamically
✅ No schema errors

---

## Troubleshooting

### Issue: createdByStaff not showing in order detail
**Solution:**
- Check that `createdByStaff` was populated in controller
- Clear browser cache
- Refresh the page
- Check admin order detail view loads the field

### Issue: Payment method breakdown only shows bank/cash
**Solution:**
- Verify revenue controller was updated correctly
- Check that payment records have correct `paymentMethod` values
- Clear application cache
- Restart server if needed

### Issue: Revenue page shows error
**Solution:**
- Check browser console for specific error
- Verify Payment collection exists
- Check that aggregation pipeline is correct
- Verify Date format in Payment records

### Issue: Guest orders not appearing in lists
**Solution:**
- Verify order created with `orderFor: "reception_behalf"`
- Check that createdByStaff was populated
- Verify query includes populate("createdByStaff")
- Check browser console for errors

---

## Performance Notes

- Order list loading: Should be <500ms with proper indexes
- Revenue calculation: May take 1-2 seconds for large datasets
- Payment method breakdown: Dynamically created, minimal overhead
- No N+1 queries with proper population

---

## Rollback Procedure

If issues arise, you can rollback by:

1. **Restore Order Model** - Remove `createdByStaff` field
2. **Restore Controllers** - Remove population of `createdByStaff`
3. **Restore Views** - Remove `createdByStaff` display sections
4. **Restore Revenue** - Use original payment method breakdown code

Previous versions kept in git history.

---

## Sign-Off Checklist

- [ ] Guest order creation works
- [ ] Payment processing saves staff info
- [ ] Admin order list shows staff creator
- [ ] Admin order detail displays guest info
- [ ] Revenue dashboard loads without errors
- [ ] Payment method breakdown works for all methods
- [ ] Database records created correctly
- [ ] No console errors
- [ ] All calculations accurate
- [ ] No performance issues
