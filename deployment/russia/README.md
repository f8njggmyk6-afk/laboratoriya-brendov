# Russian hosting preparation

This is an unfinished migration, not a replacement production deployment.

## Account verified 2026-10-26
- SpaceWeb login: laborator5; tariff Бесплатный, 0 RUB, 1 GB, one database.
- Panel displays test status and a blocking date of 2031-10-25. Do not describe this account as guaranteed free forever.
- Technical address: laborator5.temp.swtest.ru.
- Web root from panel: /home/l/laborator5/public_html.
- Panel initially reports Apache 2.2 + PHP 7.1. Configure a supported PHP version before implementing the replacement API.
- Existing production DNS still points to Vercel. No customer database has been copied or deleted.

## Static frontend
Run `npx vite build --config vite.russia.config.ts`. The deployable frontend is `.output-russia/public` only. Do not upload `.output-russia/server`, credentials, project sources or `.env` files.

Prerendering of 8 routes passed. The runtime still needs a compatible local backend for `/api/contact`, `/api/tracking`, `/api/admin/auth`, `/api/admin/orders` and `/api/fx`. A build is not proof of a functioning checkout.

`preview.htaccess` and `preview-api.php` are deliberately for an isolated test copy: API calls fail with 503 instead of losing orders or relaying personal data to Vercel. Exclude the test copy from indexing. Never point the production domain to this copy until the entire intake/admin/tracking flow has passed.

## Still required
- Verify upload access and SSL on the account, and runtime/database capabilities.
- Implement and test a Russian-hosted backend with equivalent authentication, access control, server-authoritative prices, idempotency, request size/rate limits, tracking projections, optimistic locking, history and recoverable deletion.
- Plan an explicit backed-up migration preserving existing IDs, order numbers, tracking codes and history. Do not overwrite active orders or purge the previous storage during preparation.
- Validate requests from Russia on mobile and fixed networks. A successful cloud-browser load does not establish availability on Russian networks.
- Update the actual data-flow description in the privacy policy, confirm the operator notification requirements and transfer/retention arrangements, then consider DNS cutover with rollback.
