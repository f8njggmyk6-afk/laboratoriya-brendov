# Personal data rollout — 2026-10-26

Status: policy and form UI prepared; production rollout held pending Russian hosting and an operational review. Do not claim full compliance or Russian storage while the current pipeline remains in use.

## Verified current flow
- POST /api/contact reaches Vercel, then Supabase project pvgqsngydvxvluteyfmn, region eu-west-3 (France), before manual MAX handoff.
- Name and brief are optional for a selected-service order; a custom request requires a brief. Server stores name/email/brief, service snapshot, amounts, identifiers, history and statuses.
- Browser sessionStorage holds selected services, draft, prepared text and tracking code; localStorage holds language.
- Server rate limiter stores SHA-256 of a key containing IP; this must not be described as anonymous data.
- Resend is used by the email notification path; Gmail is the business correspondence channel. MAX transfer is user-initiated copy/paste/send.
- Client tracking exposes request information to holders of the tracking code; retain bearer-code confidentiality notices.
- No Metrica or advertising trackers are currently connected.
- Admin deletion is soft deletion, not erasure. Do not promise automatic destruction through that action.

## Required before describing a Russian personal-data setup as complete
1. Obtain an account and approved budget for a Russian host. Place both intake/backend processing and primary database in Russia, not only a proxy before the present foreign POST endpoint. Candidate official references: https://timeweb.cloud/docs/nashi-data-centry and https://yandex.cloud/ru/security/data-privacy . The host choice and tariff remain unapproved.
2. Plan migration of orders, items, status history, rate limiting, authentication/session management, backups and server secrets. Verify RLS/access controls, TLS, restoration and admin/tracking functionality. No production purge or DNS switch without verified backup and rollback path.
3. Review third-party access/notifications. Remove personal data from foreign mail/webhook/logging paths unless a separately assessed lawful transfer process is in place. Review retention for logs, backups and exports.
4. Replace the CURRENT infrastructure description in PrivacyPage only after verifying the actual new deployment and data flows. Do not replace France with Russia merely by changing text.
5. Collect the operator information required for the Roskomnadzor notification from the owner privately and prepare the notification. Check the registry before filing a duplicate; filing has not been performed. Assess separate cross-border notification if any transfers remain.
6. Approve a retention schedule per category and implement operational erasure/anonymisation, including audit snapshots/backups. Document handling for access, correction, restriction and deletion requests with statutory deadlines.
7. Reassess legal basis for any new processing purpose, Metrica and advertising. This revision relies on the precontract/contract basis for necessary request data; it does not obtain marketing consent. Obtain separate consent before any purpose that requires it, and record the applicable text/version/action if introduced.
8. Build and verify mobile layout, links and a complete order/admin/tracking path on the Russian setup before production activation.

## Validation of this UI change
- npm run build
- node scripts/check-messenger-order.mjs
- node scripts/check-checkout-scroll.mjs
- git diff --check

No new real customer records were created in these checks. No production orders were deleted. Full-name/INN footer change from commit 26f265a remains unchanged.
