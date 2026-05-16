# Final Hackathon Polish & IBM Bob API Integration

This project requires using the real IBM Bob API to satisfy hackathon guidelines. We will transition from `DEMO_MODE` to a live API integration and run final verification checks.

## User Review Required
> [!IMPORTANT]
> The live IBM Bob API uses your credits (you mentioned having ~40 left). Are you ready for me to disable demo mode and use the real key for testing, or should we keep demo mode on until the exact moment of your presentation?

## Proposed Changes

### Backend & API Integration (`backend-specialist`)
- [MODIFY] `src/lib/watsonx.ts`: Ensure the live API fetch logic correctly formats requests for the IBM Bob endpoint using the `bob_prod_...` key.
- [MODIFY] `.env.local`: Toggle `DEMO_MODE=false` when ready.

### Security & Auditing (`security-auditor`)
- Run `security_scan.py` to ensure the IBM Bob key is properly secured in environment variables and not leaked in the client-side bundle.

### Verification (`test-engineer`)
- Run a live end-to-end test of the Why Engine using real API credits to verify latency and accuracy.

## Verification Plan
1. Send 1 real query through the API to confirm the IBM Bob key is valid.
2. Verify no `.env` files are tracked in git.
