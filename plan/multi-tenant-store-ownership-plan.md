# Multi-Tenant Store Ownership Plan

## Objective

Evolve the app into a shared platform where each seller has their own store/niche, while keeping one codebase.

This is a multi-tenant storefront model (not a marketplace feed).

## Strategy

- Do foundation work now (ownership and data boundaries).
- Finish feature polish in parallel.
- Move branding and niche-specific behavior after boundaries are stable.

## Phase 1: Foundation (Do Now)

Status: pending

1. Define tenancy model
   - Add `store` as first-class entity.
   - Ownership: `store.ownerUserId` (Clerk user ID).
   - URL decision: `/s/{storeSlug}` (recommended initial path-based tenant routing).

2. Add store scope to core entities
   - `product.store` (required reference or `storeId` string).
   - `order.store` (required).
   - `category.store` (recommended if categories differ by seller).
   - `customer.store` (if customer records are store-scoped in your business model).

3. Query hardening
   - Every read/write query includes store filter.
   - No unscoped list queries in public routes or APIs.

4. Auth + authorization boundary
   - Seller/admin actions require user to own (or be member of) target store.
   - Prevent cross-store updates in APIs/actions.

5. Data migration prep
   - Create default store for existing owner.
   - Backfill existing products/orders/categories/customers with that store.

## Phase 2: Build Features Safely (Parallel Work)

Status: pending

1. New features must accept `storeId`/`storeSlug` in route/context.
2. New queries must be tenant-scoped by default.
3. Admin pages should only show data for the active store.

## Phase 3: Genericization (After Core Features Stabilize)

Status: pending

1. Add `siteSettings` per store
   - `storeName`, `tagline`, `currencyCode`, `currencySymbol`, `locale`.
   - Optional AI assistant label and starter prompts.

2. Remove furniture-specific hardcoding
   - Header/metadata/copy from settings.
   - AI prompts from store settings + schema definitions.
   - Filters from store-configured attributes, not fixed constants.

3. Product model flexibility
   - Keep baseline fields (`name`, `price`, `images`, `stock`) fixed.
   - Add extensible attributes (`attributes[]`) for niche-specific metadata.

## Risks If Delayed

- Expensive rework across queries, APIs, and admin tools.
- High chance of cross-store data leaks if scoping is added late.
- More migration complexity once data volume grows.

## Recommended Execution Rule

- Start Phase 1 now.
- Continue normal feature development, but enforce store-scoped boundaries on all new code.
- Start Phase 3 only after feature set is mostly complete.

## Checkpoint Decision

Before coding Phase 1, confirm:

1. Tenant URL style: `/s/{storeSlug}` or subdomain.
2. Whether categories are global or per-store.
3. Whether a user can own multiple stores.
