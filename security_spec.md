# Smooth Ride Rentals — Firestore Security Specification (Phase 0)

## Data Invariants
1. **Default Deny**: All unspecified Firestore paths deny read and write operations.
2. **PII Isolation**: `/users/{userId}` contains private user PII (`email`, `name`, `photoUrl`). Only the authenticated owner (`request.auth.uid == userId`) or a verified administrator may read it. Non-owners cannot `get` or `list` user documents.
3. **Zero Privilege Escalation**: On creation of `/users/{userId}`, `role` MUST be `'customer'`. Users cannot self-assign `'admin'` and cannot modify `role`, `uid`, `email`, or `createdAt` on update.
4. **Verified Identity**: All authenticated writes require `request.auth.token.email_verified == true`.
5. **Temporal Integrity**: `createdAt` on create and `updatedAt` on create/update must strictly equal `request.time`.
6. **Admin Collection Lockout**: `/admins/{adminId}` forbids all client-side writes (`create`, `update`, `delete`).

## Dirty Dozen Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Read**: `GET /users/uid_123` without auth token.
2. **Cross-User PII Read**: Authenticated `uid_A` attempts `GET /users/uid_B`.
3. **Blanket Collection Scrape**: Non-admin user attempts `LIST /users`.
4. **Self-Assigned Admin on Create**: `uid_A` creates `/users/uid_A` with `{ role: "admin" }`.
5. **Role Escalation on Update**: `uid_A` updates `/users/uid_A` changing `role` from `"customer"` to `"admin"`.
6. **Shadow Field Injection**: `uid_A` creates or updates `/users/uid_A` with ghost field `{ isVerified: true }`.
7. **Identity Spoofing on Create**: `uid_A` creates `/users/uid_A` with `{ uid: "uid_B" }`.
8. **Unverified Email Admin Spoof**: Token has `email: "isha9896761229@gmail.com"` with `email_verified: false`.
9. **Path ID Poisoning**: Creating `/users/` with a 200-char invalid ID containing special characters.
10. **String Overflow / Denial of Wallet**: Updating `name` with a 500-character string exceeding `maxLength: 120`.
11. **Backdated Timestamp**: Creating `/users/uid_A` with client-supplied `createdAt` != `request.time`.
12. **Admin Registry Tampering**: Any client attempting `CREATE /admins/uid_A`.
