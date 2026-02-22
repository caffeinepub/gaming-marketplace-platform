# Specification

## Summary
**Goal:** Expand phone number support to accept worldwide formats and require all users to add a phone number on login.

**Planned changes:**
- Remove UK-specific 11-digit validation and accept any numeric input without '+' prefix in phone number field
- Update backend validation to accept worldwide phone numbers (numeric only, any length)
- Add "Haven't Added Phone Number" button to PhoneNumberSetup dialog to allow users to proceed with phone entry
- Require all users (new and existing) to provide phone number on login, blocking access until phone number is saved

**User-visible outcome:** Users can enter phone numbers in any worldwide format (numeric only), and all users will be prompted to add their phone number when logging in if they haven't already done so.
