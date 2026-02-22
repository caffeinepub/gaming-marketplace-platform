# Specification

## Summary
**Goal:** Replace manual username creation with AI-generated GamerTags and add terms acceptance modal.

**Planned changes:**
- Add terms acceptance modal after queue completion/skip with required "Accept" button
- Implement AI-generated GamerTag-style usernames (e.g., ShadowWarrior42, EpicSniper89)
- Add backend endpoint for GamerTag generation with validation and profanity filtering
- Enable username regeneration for £0.01 per change with payment submission flow
- Add admin configuration field for username change price
- Create admin panel section to review username change payment submissions
- Remove existing manual username creation modal (UsernameSetup.tsx)

**User-visible outcome:** After queue completion or skip, users accept terms, receive an AI-generated GamerTag automatically, and can regenerate it for £0.01 per change through the same payment methods (PayPal, UK gift cards, crypto).
