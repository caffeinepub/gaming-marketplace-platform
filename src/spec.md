# Specification

## Summary
**Goal:** Replace phone number authentication with a 6-character ID system where users receive auto-generated IDs and can optionally create custom IDs.

**Planned changes:**
- Remove all phone number collection, validation, and storage from authentication flow
- Remove PhoneNumberSetup component and phone number admin whitelist functionality
- Implement automatic 6-character alphanumeric ID generation for new users
- Create ID claim/creation dialog that appears on first login for new users
- Allow users to accept auto-generated ID or create custom 6-character ID for free
- Update user profile storage to use 6-character IDs as primary identifier (replacing PUR-XXXXXX format)
- Update all frontend displays (profile, header, admin panels) to show 6-character IDs
- Migrate existing users to new 6-character ID format
- Keep Internet Identity authentication unchanged as the primary login method

**User-visible outcome:** Users log in with Internet Identity and are automatically assigned a unique 6-character ID (e.g., A3B2C1). New users see a dialog to either accept their auto-generated ID or create a custom 6-character ID for free. Phone numbers are no longer collected or required.
