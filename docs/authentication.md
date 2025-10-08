# Authentication Overview

The application provides lightweight authentication so that members can access
their personal dashboards while administrators manage organisation-wide data.

## Credential Management

- Members are stored with `email`, `name`, and role flags (`is_admin` etc.).
- Passwords are hashed on the client with SHA-256 before being saved to
  storage. In production you should move hashing to a hardened backend (e.g.
  `bcrypt` with salts).
- Password strength checks enforce 6–100 characters and require both letters
  and numbers.
- Email addresses are validated with a basic RFC-compliant regex.

## Authentication Flow

1. User submits email and password through the login form.
2. The system looks up the member record matching the email.
3. The provided password is hashed and compared with the stored hash.
4. On success, a session token is generated and persisted to `localStorage`.
5. Role, user id, name, and last login timestamp are updated.
6. The dashboard renders based on the member’s role.

## Session Management

- Sessions are stored in `localStorage` under the key `shift_app_auth_session`.
- Session tokens are 32-byte random identifiers generated via the Web Crypto
  API.
- Sessions expire after 24 hours (`isSessionValid`). Expired sessions trigger an
  automatic logout and prompt the user to re-authenticate.
- Logging out clears session data, cached member selection, and resets the UI.

## Role-Based Access

- **Admin:** full access to members, locations, shifts, attendance, salary
  reports, and configuration.
- **Member:** restricted to their own shifts, attendance records, and payroll
  summaries.

UI components use the current role to hide restricted tabs, disable management
actions, and protect server calls.

## Security Considerations

- Always run the production deployment behind HTTPS to protect credentials.
- Rotate `JWT_SECRET` (or equivalent) regularly when you enable the backend JWT
  issuance path.
- Consider migrating all authentication logic to the backend to avoid exposing
  hashed passwords to the client bundle.
- Add account lockout or rate limiting in the backend to mitigate brute-force
  attempts.
