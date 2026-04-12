# Deployment Checklist: Staff Order Tracking & Revenue Management

## Pre-Deployment Verification

### Code Review
- [ ] All files modified are listed below
- [ ] No unintended changes to other files
- [ ] Code follows existing patterns and conventions
- [ ] No console.log debug statements left in code
- [ ] Comments added for complex logic

### Files Modified (8 total)
- [ ] `/models/Order.js` - Added createdByStaff field
- [ ] `/controllers/orderController.js` - Updated populate queries (3 places)
- [ ] `/controllers/receptionController.js` - Sets createdByStaff on order creation
- [ ] `/controllers/revenueController.js` - Fixed payment method breakdown
- [ ] `/routes/user.js` - Saves guest info in Payment record
- [ ] `/views/admin/orders/index.ejs` - Shows createdByStaff in list
- [ ] `/views/admin/orders/detail.ejs` - Shows createdByStaff in detail
- [ ] Documentation files (not deployed, for reference)

### No Files Should Be Modified
- [ ] `/models/User.js` - Not modified ✓
- [ ] `/models/Payment.js` - Not modified ✓
- [ ] `/models/Branch.js` - Not modified ✓
- [ ] Other model files - Not modified ✓

---

## Database Checks

### Pre-Migration
- [ ] Backup existing database
- [ ] Verify database connection working
- [ ] No active user sessions (optional, for zero-downtime deploy)

### Schema Verification
- [ ] Order model can accept null `createdByStaff` (default value)
- [ ] No migration needed (field is new, optional)
- [ ] Existing orders unaffected (backward compatible)

### Data Integrity
- [ ] No data loss in Order collection
- [ ] No data loss in Payment collection
- [ ] User references still valid

---

## Application Tests

### Unit Tests
- [ ] Order creation with createdByStaff set correctly
- [ ] Order retrieval includes createdByStaff in populate
- [ ] Payment record includes guest information
- [ ] Revenue calculation handles all payment methods

### Integration Tests
- [ ] Guest order creation end-to-end works
- [ ] Payment process completes successfully
- [ ] Admin order detail page loads correctly
- [ ] Revenue dashboard calculates correctly

### Manual Testing
- [ ] Create a guest order as receptionist
- [ ] Verify createdByStaff shows in order list
- [ ] Verify staff name shows in order detail
- [ ] Complete payment and verify Payment record
- [ ] Check revenue dashboard loads without errors
- [ ] Test payment method breakdown with various methods

---

## Staging Environment

### Deployment Steps
1. [ ] Pull latest code from repository
2. [ ] Install any new dependencies (none in this case)
3. [ ] Clear application cache if needed
4. [ ] Restart application server
5. [ ] Verify application starts without errors

### Smoke Tests
- [ ] Homepage loads
- [ ] Login works
- [ ] Admin dashboard accessible
- [ ] Guest order creation page loads
- [ ] Revenue dashboard loads
- [ ] No console errors

### Data Verification
- [ ] Create test guest order
- [ ] Verify createdByStaff saved in database
- [ ] Complete payment
- [ ] Verify Payment record includes guest info
- [ ] View order in admin (should show staff creator)

---

## Production Deployment

### Pre-Deployment Checklist
- [ ] All tests pass in staging
- [ ] Database backup completed
- [ ] Rollback procedure documented
- [ ] Communication sent to team
- [ ] Deployment window scheduled
- [ ] Monitor access available

### Deployment Process
1. [ ] Stop application (if needed)
2. [ ] Backup database
3. [ ] Deploy code
4. [ ] Start application
5. [ ] Verify application health
6. [ ] Run smoke tests
7. [ ] Monitor error logs
8. [ ] Communicate success to team

### Post-Deployment Validation (First 30 minutes)
- [ ] Application accessible
- [ ] No error logs showing new errors
- [ ] Create test guest order (if allowed)
- [ ] Verify order shows with staff creator
- [ ] Check revenue dashboard loads
- [ ] Monitor performance metrics
- [ ] Check user feedback (error reports, issues)

---

## Monitoring & Logging

### Logs to Monitor
- [ ] Application error logs (no 500 errors)
- [ ] Database logs (no connection errors)
- [ ] Payment processing logs (all payments successful)
- [ ] Order creation logs (no failures)

### Metrics to Track
- [ ] Page load times
- [ ] API response times
- [ ] Error rate
- [ ] User session count
- [ ] Revenue calculation performance

### Alerts to Set
- [ ] Application crash
- [ ] High error rate (>5%)
- [ ] Database connection failure
- [ ] Payment processing delays
- [ ] Revenue calculation errors

---

## Rollback Plan

### If Needed (Quick Rollback)
1. [ ] Revert code to previous version
2. [ ] Restart application
3. [ ] Verify previous functionality works
4. [ ] Notify team
5. [ ] Schedule post-mortem

### What NOT to Rollback
- [ ] Do NOT delete new database fields (keep createdByStaff in db)
- [ ] Do NOT delete Payment records (preserve transaction history)
- [ ] Just revert code, database remains unchanged

### Rollback Verification
- [ ] Views without createdByStaff display correctly (fallback logic)
- [ ] Existing orders still visible
- [ ] Revenue dashboard still works
- [ ] No data corruption

---

## Post-Deployment (24 hours)

### Day 1 Verification
- [ ] No spike in error logs
- [ ] Performance metrics normal
- [ ] User reports: none negative
- [ ] Test guest order tracking still working
- [ ] Revenue dashboard accurate

### Data Quality Checks
- [ ] Sample orders have proper createdByStaff values
- [ ] Payment records include guest information
- [ ] Revenue calculations match expectations
- [ ] No orphaned references

### Communication
- [ ] Update documentation if needed
- [ ] Notify team of completion
- [ ] Schedule training if required
- [ ] Archive old documentation versions

---

## Success Criteria

### Functional
- ✅ Guest orders saved with createdByStaff field
- ✅ Staff creator displayed in order lists
- ✅ Payment information includes guest details
- ✅ Revenue dashboard works with all payment methods
- ✅ No errors in functionality

### Performance
- ✅ Page load times unchanged
- ✅ Query performance not degraded
- ✅ No memory leaks introduced
- ✅ Database performance stable

### Data Integrity
- ✅ All existing data preserved
- ✅ No data corruption
- ✅ Referential integrity maintained
- ✅ Payment history intact

### User Experience
- ✅ No loss of functionality
- ✅ New features work as expected
- ✅ No confusion from interface changes
- ✅ Admin dashboard clearer

---

## Sign-Off

### QA Approval
- [ ] Tester Name: ___________________
- [ ] Date: ___________________
- [ ] Status: ☐ Approved ☐ Conditional ☐ Rejected

### Product Owner Approval
- [ ] PO Name: ___________________
- [ ] Date: ___________________
- [ ] Status: ☐ Approved ☐ Conditional ☐ Rejected

### Operations Approval
- [ ] Ops Manager: ___________________
- [ ] Date: ___________________
- [ ] Status: ☐ Approved ☐ Conditional ☐ Rejected

---

## Deployment Notes

### Known Limitations
- None identified

### Assumptions
- Database accepting new fields
- Email/logging services available
- No concurrent schema migrations

### Dependencies
- None new (no additional npm packages)
- Mongoose version compatible
- Node.js version supported

---

## Contact Information

### Support During Deployment
- Tech Lead: ___________________
- Database Admin: ___________________
- DevOps: ___________________

### Issue Reporting
- Create issue ticket if problems arise
- Include error logs and steps to reproduce
- Tag with "deployment" label

---

## Timeline

### Estimated Duration
- Deployment: 5-10 minutes
- Verification: 10-15 minutes
- Monitoring: 30+ minutes
- Total: ~1 hour

### Rollback Time (if needed)
- Code rollback: 2-5 minutes
- Application restart: 1-2 minutes
- Verification: 5-10 minutes
- Total: ~15 minutes

---

**Deployment Status: Ready for Deployment**

**Last Updated:** 2026-04-09
**Version:** 1.0
