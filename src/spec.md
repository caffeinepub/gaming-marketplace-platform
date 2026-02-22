# Specification

## Summary
**Goal:** Fix admin panel authorization for whitelisted admins and display usernames instead of principal IDs in all admin submission lists.

**Planned changes:**
- Fix admin authorization logic to properly recognize 'venomgladiator25' and 'turbohunter64' as whitelisted admins
- Update QueueSkipSubmissionsList to display usernames instead of principal IDs
- Update UsernameChangeSubmissionsList to display usernames instead of principal IDs
- Update CustomUsernameSubmissionsList to display usernames instead of principal IDs
- Create or update backend endpoints to include username data in submission responses
- Verify useProfile hook correctly fetches and prioritizes custom usernames over AI-generated usernames

**User-visible outcome:** Whitelisted admins can successfully access the admin panel without errors, and all submission lists display user-friendly usernames instead of principal IDs.
