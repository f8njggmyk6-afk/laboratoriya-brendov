# Unified checkout channels

One form collects name and brief for the selected catalog services. MAX is selected by default. Email is required only for the email channel. No WhatsApp or Telegram option is shown until configured.

The server persists the order with an idempotency key and computes all amounts from the catalog. MAX preparation returns the saved order number, plain tracking code and a complete message, without sending owner/client emails or claiming messenger delivery. A MAX order is identifiable in the admin brief by the channel prefix; its email may be empty. Admin editing accepts this.

The next screen uses the official `https://max.ru/:share?text=…` mechanism. MAX requires the customer to choose the recipient chat and press Send. It cannot be silently addressed to a personal profile. The site explicitly names the recipient, links the configured profile as a fallback and provides selectable text/copy as a backup. Opening MAX is never treated as delivery. Server-to-owner bot notifications remain a separate, unconfigured feature.

Drafts and the prepared message are retained in session storage so returning from MAX does not require rewriting the brief. Explicitly starting another catalog/custom selection bypasses the prepared screen. Tracking codes are displayed as plain text and included in the message without a tracking URL.

SQL change: `docs/messenger-orders.sql` permits an empty email for messenger orders; existing email orders and RLS remain unchanged. The API still validates mandatory email for the email channel.

Validation: check-messenger-order.mjs covers persistence before handoff, blank-email MAX orders, canonical totals, no email transport, plain tracking code and storage failures. Existing pricing/admin/tracking checks must also pass.


Checkout simplification: a selected catalog service can be submitted without a name or brief. Optional notes are collapsed under «Добавить пожелания — необязательно». Selecting a channel scrolls to the send controls. Without valid selected services, a brief is required; email submission still requires a reply address. Server validation uses canonical selected services and stores a neutral name and brief when omitted.


Manual MAX handoff: checkout now prepares the saved order first, with an expanded complete message and a prominent copy-all button. The next step offers the verified personal MAX profile first and email second. Customer copies, opens the profile, pastes and sends. The recipient chooser share link is no longer used. Tracking receipt retains its separate code-copy convenience.
