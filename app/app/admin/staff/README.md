# Staff Management (Admin Only)

- Create staff/admin accounts using either:
  - Work Number + Last Name (auto-username: `{workNumber}.{lastname}`)
  - Custom username
- Optional: set password; if empty, a strong temporary password is generated.
- All routes are hidden from public (requires admin login and noindex headers).
- Staff sign in through `/admin/login`.

API:
- `POST /api/admin/admin-users` → create staff/admin user
- `GET /api/admin/admin-users` → list users
- `PATCH /api/admin/admin-users/:id` → update user (name, email, role, isActive, allowedIPs, password)

Security:
- Passwords hashed with bcrypt
- Rate limiting + lockouts on repeated login failures
- Optional IP allowlisting per AdminUser
- Optional 2FA (TOTP) for Admins is supported in auth layer

