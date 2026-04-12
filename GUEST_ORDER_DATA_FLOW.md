# Guest Order Revenue Tracking - Complete Data Flow

## Overview
This document explains the complete flow of guest order data from creation to revenue reporting.

---

## 1. Guest Order Creation Flow

### Step 1: Reception Staff Creates Order
**Route**: `POST /reception/orders/create`
**Controller**: `receptionController.js` → `createGuestReservation()`

```javascript
// Staff submits order form
const order = new Order({
  userId: receptionId,              // Owner = reception staff
  orderFor: "reception_behalf",      // Mark as guest order (KEY)
  guestName: guestName,              // Customer name
  guestPhone: guestPhone,            // Customer phone
  guestEmail: guestEmail,            // Customer email
  createdByStaff: receptionId,       // Who created it (KEY)
  orderType: "dine-in",              // Dine-in only
  items: orderItems,                 // Menu items
  totalPrice: totalPrice,
  finalPrice: finalPrice,
  depositAmount: depositAmount,      // Upfront payment required
  status: "pending",
  paymentStatus: "unpaid",
  // ... other fields
})
await order.save()
```

**Key Fields Set**:
- ✅ `orderFor: "reception_behalf"` - Identifies as guest order
- ✅ `createdByStaff: receptionId` - Tracks who created it
- ✅ `guestName, guestPhone, guestEmail` - Customer info
- ✅ All items and pricing information

---

## 2. Payment Processing Flow

### Step 2: Customer Pays (or Staff Pays on Behalf)
**Route**: `POST /user/payment/order/:orderId/confirm`
**Controller**: `routes/user.js`

```javascript
// Find the order that was created
const order = await Order.findById(req.params.orderId)

// Determine revenue type based on order type
let revenueType = "delivery";
if (order.orderType === "dine-in") {
  // THIS IS THE KEY LOGIC:
  // If it's a guest order (created by staff), mark as "guest_order"
  // Otherwise, mark as "reception" (regular customer)
  revenueType = order.orderFor === "reception_behalf" ? "guest_order" : "reception";
}

// Create payment record
const payment = new Payment({
  orderId: order._id,
  userId: order.userId,
  amount: order.totalPrice,
  discount: order.discount,
  finalAmount: order.finalPrice,
  paymentMethod: paymentMethod,      // bank, cash, transfer
  status: "completed",
  revenueType: revenueType,           // KEY: Set to "guest_order" here
  branchId: order.branchId,
  // Guest order specific fields
  isGuestOrder: order.orderFor === "reception_behalf",
  guestName: order.guestName,
  guestPhone: order.guestPhone,
  guestEmail: order.guestEmail,
  depositAmount: order.depositAmount,
  createdByStaff: order.createdByStaff,  // Track staff member
  transactionId: `TXN${Date.now()}...`,
  paidAt: new Date(),
})
await payment.save()

// Update order
order.status = "paid"
order.paymentStatus = "paid"
await order.save()
```

**Key Result**:
- ✅ Payment.revenueType = "guest_order"
- ✅ Payment.createdByStaff = staff member ID
- ✅ Payment linked to order via orderId

---

## 3. Revenue Dashboard Calculation Flow

### Step 3: Admin Accesses Revenue Dashboard
**Route**: `GET /admin/revenue?year=2026&month=4`
**Controller**: `revenueController.js` → `getRevenue()`

```javascript
// Fetch all completed payments in date range
const payments = await Payment.find({
  status: "completed",
  createdAt: { $gte: startDate, $lte: endDate },
})
  .populate("createdByStaff", "name email")
  .populate("userId", "name email")
  // ... other populates

// FILTER: Guest Order Payments Only
const guestOrderPayments = payments.filter((p) => p.revenueType === "guest_order");

// CALCULATE: Total Revenue from Guest Orders
const guestOrderTotal = guestOrderPayments.reduce(
  (sum, p) => sum + (p.finalAmount || p.amount || 0),
  0
);

// BREAKDOWN: Per-Staff Revenue
const guestStaffMap = {};
guestOrderPayments.forEach((payment) => {
  const staffId = payment.createdByStaff?._id.toString() || "unknown";
  const staffName = payment.createdByStaff?.name || "Unknown";
  
  if (!guestStaffMap[staffId]) {
    guestStaffMap[staffId] = {
      name: staffName,
      email: payment.createdByStaff?.email || "",
      total: 0,
      count: 0,
    };
  }
  
  guestStaffMap[staffId].total += p.finalAmount || p.amount || 0;
  guestStaffMap[staffId].count += 1;  // One more order
});

const guestOrderStaffBreakdown = Object.values(guestStaffMap)
  .sort((a, b) => b.total - a.total);  // Sort by revenue

// MONTHLY TREND: Guest Orders by Month
let monthlyGuestOrder = Array(12).fill(0);
guestOrderPayments.forEach((payment) => {
  const month = new Date(payment.createdAt).getMonth();
  monthlyGuestOrder[month] += payment.finalAmount || payment.amount || 0;
});

// TOTAL: Include Guest Orders in System Total
const systemTotal = deliveryTotal + receptionTotal + guestOrderTotal + walkinTotal + uncatTotal;
```

**Calculations Performed**:
- ✅ Filter payments by `revenueType === "guest_order"`
- ✅ Sum total guest order revenue
- ✅ Group by staff member (createdByStaff)
- ✅ Count orders per staff
- ✅ Calculate per-staff percentages
- ✅ Build monthly trend data

---

## 4. Dashboard Rendering Flow

### Step 4: View Displays Results
**View**: `views/admin/revenue/index.ejs`

```ejs
<!-- NEW SECTION: Guest Order Revenue -->
<div class="admin-card" style="...">
  <h2>Doanh Thu Dat Ho Khach (Tiep Tan / Nhan Vien)</h2>
  <span><%= guestOrderTotal.toLocaleString('vi-VN') %>d</span>
  
  <!-- Staff Breakdown Table -->
  <table>
    <% guestOrderStaffBreakdown.forEach((staff) => { %>
      <tr>
        <td><%= staff.name %></td>
        <td><%= staff.email %></td>
        <td><%= staff.count %> Don</td>  <!-- Order count -->
        <td><%= staff.total.toLocaleString('vi-VN') %>d</td>  <!-- Revenue -->
        <td>
          <!-- Percentage bar -->
          <% var pct = (staff.total / guestOrderTotal * 100).toFixed(1); %>
          <div style="width: <%= pct %>%; ..."></div>
        </td>
      </tr>
    <% }); %>
  </table>
</div>

<!-- MONTHLY CHART -->
<!-- Chart now includes 3 colors:
     - Blue: Delivery Revenue
     - Green: Reception Revenue
     - Purple: Guest Order Revenue
-->
<div style="display:flex;align-items:flex-end;...">
  <% for (var i = 0; i < 12; i++) { %>
    <div style="...">
      <!-- Purple bar for guest orders -->
      <div style="background:#7c3aed;height:<%= monthlyGuestOrder[i]/maxVal*190 %>px;"></div>
      <!-- Green bar for reception -->
      <div style="background:#2e7d32;height:<%= monthlyReception[i]/maxVal*190 %>px;"></div>
      <!-- Blue bar for delivery -->
      <div style="background:#1976d2;height:<%= monthlyDelivery[i]/maxVal*190 %>px;"></div>
      <span>T<%= i + 1 %></span>
    </div>
  <% } %>
</div>
```

**Displayed Information**:
- ✅ Total guest order revenue prominently
- ✅ Per-staff breakdown with names and emails
- ✅ Order count per staff member
- ✅ Revenue per staff member
- ✅ Percentage contribution to total
- ✅ Visual progress bars
- ✅ Monthly trend chart with guest order data

---

## 5. Data Examples

### Example Scenario

**Setup**:
- Reception Staff: "Tran Van A" (ID: 123)
- Month: April 2026
- Customer 1: Guest order for "Nguyen Van X"
  - Items: 2 portions pho = 200,000d
  - Staff creates at 10:30 AM
  - Customer pays 200,000d at 11:00 AM
- Customer 2: Guest order for "Ly Thi Y"
  - Items: 3 portions rice + 2 soups = 300,000d
  - Staff creates at 2:00 PM
  - Customer pays 300,000d at 2:30 PM

**Database Records Created**:

Order 1:
```javascript
{
  _id: ObjectId("...1"),
  userId: ObjectId("123"),          // Reception staff
  orderFor: "reception_behalf",      // Guest order
  createdByStaff: ObjectId("123"),   // Tran Van A
  guestName: "Nguyen Van X",
  guestPhone: "09xxxxxxxx",
  orderType: "dine-in",
  totalPrice: 200000,
  finalPrice: 200000,
  status: "paid",
  createdAt: "2026-04-15T10:30:00Z"
}
```

Order 2:
```javascript
{
  _id: ObjectId("...2"),
  userId: ObjectId("123"),          // Reception staff
  orderFor: "reception_behalf",      // Guest order
  createdByStaff: ObjectId("123"),   // Tran Van A
  guestName: "Ly Thi Y",
  guestPhone: "09xxxxxxxx",
  orderType: "dine-in",
  totalPrice: 300000,
  finalPrice: 300000,
  status: "paid",
  createdAt: "2026-04-15T14:00:00Z"
}
```

Payment 1:
```javascript
{
  _id: ObjectId("...p1"),
  orderId: ObjectId("...1"),
  userId: ObjectId("123"),
  amount: 200000,
  finalAmount: 200000,
  revenueType: "guest_order",        // KEY: Guest order type
  createdByStaff: ObjectId("123"),   // Tran Van A
  isGuestOrder: true,
  guestName: "Nguyen Van X",
  paymentMethod: "cash",
  status: "completed",
  paidAt: "2026-04-15T11:00:00Z"
}
```

Payment 2:
```javascript
{
  _id: ObjectId("...p2"),
  orderId: ObjectId("...2"),
  userId: ObjectId("123"),
  amount: 300000,
  finalAmount: 300000,
  revenueType: "guest_order",        // KEY: Guest order type
  createdByStaff: ObjectId("123"),   // Tran Van A
  isGuestOrder: true,
  guestName: "Ly Thi Y",
  paymentMethod: "cash",
  status: "completed",
  paidAt: "2026-04-15T14:30:00Z"
}
```

**Dashboard Display**:
```
Doanh Thu Dat Ho Khach (Tiep Tan / Nhan Vien): 500,000d

Nhan Vien Tao Don | Email | So Don | Doanh Thu | Ti Le
Tran Van A        | ...   | 2 Don | 500,000d  | 100%
[████████████████████] 100%
```

**Monthly Chart**:
```
April:
  Purple bar (Guest Orders): 500,000d
  Green bar (Reception): 0d
  Blue bar (Delivery): 0d
```

---

## 6. Key Fields Summary

### Order Model Fields (For Guest Orders)
| Field | Value | Purpose |
|-------|-------|---------|
| `orderFor` | "reception_behalf" | Identifies as guest order |
| `createdByStaff` | Staff ObjectId | Tracks who created it |
| `guestName` | String | Customer name |
| `guestPhone` | String | Customer phone |
| `guestEmail` | String | Customer email |
| `depositAmount` | Number | Upfront deposit |

### Payment Model Fields (For Guest Orders)
| Field | Value | Purpose |
|-------|-------|---------|
| `revenueType` | "guest_order" | Revenue classification |
| `createdByStaff` | Staff ObjectId | Staff performance tracking |
| `isGuestOrder` | true | Flag for filtering |
| `guestName` | String | Customer name in payment |
| `guestPhone` | String | Customer phone in payment |
| `guestEmail` | String | Customer email in payment |

---

## 7. Query Logic Reference

### Get All Guest Order Revenue
```javascript
const guestPayments = await Payment.find({
  revenueType: "guest_order",
  status: "completed",
  createdAt: { $gte: startDate, $lte: endDate }
});
const total = guestPayments.reduce((sum, p) => sum + p.finalAmount, 0);
```

### Get Staff Rankings by Guest Order Revenue
```javascript
const staffStats = await Payment.aggregate([
  {
    $match: {
      revenueType: "guest_order",
      status: "completed",
      createdAt: { $gte: startDate, $lte: endDate }
    }
  },
  {
    $group: {
      _id: "$createdByStaff",
      total: { $sum: "$finalAmount" },
      count: { $sum: 1 }
    }
  },
  { $sort: { total: -1 } }
]);
```

### Get Monthly Guest Order Revenue Trend
```javascript
const monthly = await Payment.aggregate([
  {
    $match: {
      revenueType: "guest_order",
      status: "completed",
      createdAt: { $gte: yearStart, $lte: yearEnd }
    }
  },
  {
    $group: {
      _id: { $month: "$createdAt" },
      total: { $sum: "$finalAmount" }
    }
  },
  { $sort: { _id: 1 } }
]);
```

---

## Troubleshooting Guide

**Guest orders not showing in revenue?**
1. Check Order record has `orderFor: "reception_behalf"`
2. Check Order record has `createdByStaff` populated
3. Check Payment record created with `revenueType: "guest_order"`
4. Verify `Payment.status === "completed"`
5. Ensure date range includes the payment date

**Staff member not appearing in breakdown?**
1. Check `Payment.createdByStaff` is populated correctly
2. Verify staff member exists in User collection
3. Check `Payment.revenueType === "guest_order"`
4. Ensure at least one payment exists for that staff

**Revenue totals not matching?**
1. Check for unmapped revenueTypes (should be in uncatTotal)
2. Verify discount calculations
3. Check for cancelled orders (should have `status: "cancelled"`)
4. Ensure all completed payments have finalAmount set
