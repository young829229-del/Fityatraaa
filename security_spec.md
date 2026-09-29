# Security Specification & Threat Model

## 1. Data Invariants
- Products: Publicly readable for storefront browsing. Creation, modification, and deletion are restricted to authorized admins. Product IDs must match safe alphanumeric pattern and strings must be strictly bounded.
- Orders: Any customer (guest or authenticated) can submit a Cash on Delivery order with valid schema (`isValidOrder`), status must initiate strictly as `'pending'`, and `totalAmount` must be a positive number. Reading and updating orders is restricted to administrators and the order owner.
- Reviews: Publicly readable. Creation requires valid string boundaries, 1–5 rating score, and cannot exceed maximum character lengths.

## 2. Dirty Dozen Threat Vectors
1. `{"price": -100}` - Negative pricing attempt: Blocked by numerical bounds.
2. `{"id": "a".repeat(2000)}` - Resource poisoning on ID: Blocked by `isValidId` 128-char limit.
3. `{"status": "delivered"}` - Privilege escalation to bypass pending state: Blocked by strict `status == 'pending'` on create.
4. `{"customerName": ""}` - Empty name denial-of-wallet payload: Blocked by `size() >= 2`.
5. `{"phone": "123"}` - Truncated phone spoofing: Blocked by `size() >= 7`.
6. `{"rating": 10}` - Excessive rating overflow: Blocked by `rating >= 1 && rating <= 5`.
7. `{"comment": "x".repeat(10000)}` - Oversized comment payload: Blocked by 2048-char boundary.
8. `{"role": "admin"}` - Injected RBAC role attribute: Blocked by strict key validation.
9. `{"isSoldOut": "yes"}` - Type mismatch attack: Blocked by boolean assertion.
10. Unauthenticated modification of products: Blocked by auth and admin checks.
11. Unauthenticated deletion of customer orders: Blocked by admin assertion.
12. Terminal status tampering on order: Blocked by strict action-based update gates.
