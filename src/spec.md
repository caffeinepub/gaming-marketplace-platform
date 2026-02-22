# Specification

## Summary
**Goal:** Fix admin panel authorization so whitelisted users ('venomgladiator25' and 'turbohunter64') can access the admin panel without encountering authorization errors.

**Planned changes:**
- Update frontend admin authorization check in Storefront component to properly verify whitelisted usernames against authenticated user's stored username
- Verify backend isAdminUsername endpoint correctly returns true for 'venomgladiator25' and 'turbohunter64'
- Ensure whitelist persistence across canister upgrades

**User-visible outcome:** Whitelisted users can click the admin button and immediately access the admin panel instead of seeing a black screen with "no authorised access" error.
