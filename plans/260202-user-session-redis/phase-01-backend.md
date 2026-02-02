# Phase 01: Setup & Backend Services
Status: ✅ Complete

## Objective
Connect Backend to Redis and expose an API to fetch user session details.

## Implementation Steps
1. [x] Install `ioredis` and `@types/ioredis` in BE.
2. [x] Create `src/dbs/redis.ts` with connection logic (provided in prompt).
3. [x] Add environment variables for Redis (if needed).
4. [x] In `CustomerController` & `CustomerService`:
    - Add logic to query Redis keys:
        - `user_active_token:{userId}` -> Get JWT.
        - `session:{jwt}` -> Get Session JSON.
    - Create method `getSessionByUserId`.
5. [x] Add route `GET /api/customers/:id/session` in `customer.route.ts`.

## Tech Notes
- Use `ioredis` for promise-based interactions.
- Ensure error handling if Redis is down or key doesn't exist.
