# Russian VPS preparation

This branch is an isolated migration preview, not a production replacement. Production DNS still points to Vercel. No customer database has been copied, deleted or changed.

## VPS target

The verified working host is the Ubuntu VPS used for the noVNC session. It has Node.js 22.2.1. The separate SpaceWeb shared-hosting account documented earlier is not the same deployment target and is not used by this branch.

Build the VPS target with:

```sh
npx vite build --config vite.russia.config.ts
```

The output is `.output-russia`, using Nitro's `node-server` preset, with eight prerendered routes. Run the server from `.output-russia/server/index.mjs`; do not publish only `.output-russia/public` because the API routes need the Node runtime.

## Local order storage

The VPS backend uses SQLite through `better-sqlite3`. The native package needs the Ubuntu build tools during installation. Keep the database outside the repository and do not copy it into Git:

- `LB_SQLITE_PATH=/var/lib/laboratoriya-brendov/orders.sqlite`
- `LB_ADMIN_ENABLED=true` only after setting a unique owner password and checking TLS.
- `LB_ADMIN_EMAIL` is the sole owner login.
- `LB_ADMIN_PASSWORD` must be a random secret of at least 32 characters.
- Set the environment file permissions to `0600`; never commit it or send it through email/chat.

The database file is created on first request. It stores customer details and tracking codes in the orders table, history in a separate table, and only hashes of admin session tokens and rate-limit keys. Restrict the database and backup files to the service owner. Session cookies are HttpOnly, Secure and SameSite=Strict. Admin writes require same-origin JSON, version checks and server-side order-state validation.

The email order option saves the request locally but the Russian branch does not relay customer data through Resend. The owner must check the admin panel; the notification field remains marked as failed until a domestic notification method is selected and connected. MAX handoff remains user-initiated.

## Build and preview

`preview.htaccess` and `preview-api.php` remain for an isolated static preview only; their API calls deliberately return 503. Exclude that copy from indexing. The running Node app is the only preview that can exercise the local API.

Do not upload `.env`, the database file, customer records, or private build sources to the public web root.

## Still required before production

- Configure a non-root systemd service and a TLS-terminating reverse proxy bound to localhost; overwrite `X-Forwarded-For` at the trusted proxy.
- Set the owner's email and password privately on the VPS. Do not put secrets in Git.
- Verify the intake, MAX handoff, admin login, order edits, history, recoverable deletion and tracking projection on the Russian host.
- Add protected backups and perform a restore test.
- Plan a separately approved backup and migration of existing order IDs, numbers, tracking codes and history. No production data has been copied.
- Validate requests from Russia on mobile and fixed networks; a cloud-browser load does not establish availability from Russia.
- Review notifications, retention, privacy wording and operator notification requirements against the actual deployed flow.
- Keep the Vercel deployment and DNS rollback available. Do not switch DNS or purge old storage during preparation.
