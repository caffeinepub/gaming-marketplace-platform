# Specification

## Summary
**Goal:** Fix custom username display so users who paid for custom usernames see their chosen name instead of AI-generated names in the profile area and storefront.

**Planned changes:**
- Update backend getUserProfile endpoint to return custom username field when present
- Update Layout component profile area to display custom username when available, falling back to AI-generated username only if no custom username exists
- Update useProfile query hook to fetch and cache custom username field
- Update Storefront component to show custom username instead of AI-generated username for users who paid for custom usernames

**User-visible outcome:** Users who paid £0.10 for custom usernames will see their chosen custom username displayed in the profile area and storefront page instead of the AI-generated name.
