# Specification

## Summary
**Goal:** Fix the "user not found" error when users add phone numbers to existing accounts.

**Planned changes:**
- Update backend savePhoneNumber endpoint to check for existing user profiles before creating new records
- Add validation to ensure phone numbers are unique across all users
- Display clear error messages in the PhoneNumberSetup component for different failure scenarios
- Verify admin panel phone number functionality handles existing users correctly

**User-visible outcome:** Users can successfully add phone numbers to their existing accounts without encountering "user not found" errors, and receive clear feedback if phone numbers are already in use or other issues occur.
