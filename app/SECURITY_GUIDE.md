# 🔒 SECURITY SETUP & BEST PRACTICES

## 🚨 IMMEDIATE SECURITY ACTIONS REQUIRED

### 1. Environment Variables Security

**NEVER commit actual environment variables to version control!**

#### For Production (.env.production):
```bash
# Generate secure random strings
NEXTAUTH_SECRET=$(openssl rand -base64 32)
CRM_API_KEY=$(openssl rand -hex 32)

# Create production environment file (do NOT commit)
cp .env.production.template .env.production
# Edit .env.production and replace all placeholder values
```

#### Environment Variables Checklist:
- [ ] `DATABASE_URL` - Use strong database passwords
- [ ] `NEXTAUTH_SECRET` - Generate new random string (32+ characters)
- [ ] `CRM_API_KEY` - Generate new random API key
- [ ] `EMAIL_PASS` - Use App Passwords, not regular passwords
- [ ] All URLs point to your actual domains

### 2. Admin Password Security

#### Create Admin Account:
```bash
# Set admin password environment variable
export ADMIN_PASSWORD="your-super-secure-password-here"
export ADMIN_EMAIL="admin@your-domain.com"

# Run admin creation script
npm run create-admin
```

#### Password Requirements:
- Minimum 16 characters
- Include uppercase, lowercase, numbers, and symbols
- Unique password not used elsewhere
- Use a password manager

### 3. Database Security

#### Connection Security:
- Always use SSL connections (`?sslmode=require`)
- Use connection pooling for production
- Limit database user privileges
- Enable database audit logging

#### Credential Rotation:
- Rotate database passwords every 90 days
- Use strong, unique passwords for each environment
- Monitor database access logs

### 4. API Security

#### API Key Management:
```bash
# Generate secure API keys
CRM_API_KEY=$(openssl rand -hex 32)

# Set in environment, never hardcode
export CRM_API_KEY="your-generated-key"
```

#### Security Headers:
- Enable CORS restrictions
- Use HTTPS only in production
- Implement rate limiting
- Add API authentication logs

### 5. Session Security

#### NextAuth Configuration:
```javascript
session: {
  strategy: 'jwt',
  maxAge: 2 * 60 * 60, // 2 hours for admin sessions
  updateAge: 5 * 60,   // Update every 5 minutes
}
```

#### Security Features:
- JWT tokens with short expiration
- Automatic session updates
- Secure session storage
- CSRF protection enabled

### 6. Two-Factor Authentication (2FA)

#### Enable for All Admin Accounts:
- Use authenticator apps (Google Authenticator, Authy)
- Backup codes for recovery
- Force 2FA for privileged accounts
- Regular 2FA audit

### 7. IP Whitelisting

#### Admin Access Restriction:
```sql
-- Update admin user to restrict IP access
UPDATE "AdminUser" 
SET "allowedIPs" = ARRAY['192.168.1.100', '10.0.0.50']
WHERE username = 'admin';
```

### 8. Monitoring & Alerting

#### Security Monitoring:
- Failed login attempt alerts
- New admin account creation alerts
- Database connection monitoring
- API key usage monitoring

#### Audit Logging:
- All admin actions logged
- IP address tracking
- User agent logging
- Change history maintained

## 🛡️ PRODUCTION SECURITY CHECKLIST

### Before Deployment:
- [ ] Remove all hardcoded credentials
- [ ] Generate new secure random secrets
- [ ] Test with production-like data
- [ ] Enable HTTPS only
- [ ] Configure proper CORS
- [ ] Set up monitoring alerts
- [ ] Review audit logs setup
- [ ] Test backup/recovery procedures

### After Deployment:
- [ ] Change all default passwords
- [ ] Enable 2FA for all admin accounts
- [ ] Set up IP whitelisting
- [ ] Test security features
- [ ] Monitor security logs
- [ ] Schedule regular security reviews

### Regular Maintenance:
- [ ] Rotate credentials every 90 days
- [ ] Review access logs weekly
- [ ] Update dependencies monthly
- [ ] Security audit quarterly
- [ ] Test backup recovery quarterly

## 🚫 NEVER DO THIS

- ❌ Commit .env files to version control
- ❌ Use default passwords in production
- ❌ Hardcode secrets in source code
- ❌ Share admin credentials
- ❌ Disable security features
- ❌ Use HTTP in production
- ❌ Skip security updates
- ❌ Ignore security alerts

## 📞 Security Incident Response

If you suspect a security breach:

1. **Immediately** revoke all API keys and secrets
2. Force password reset for all admin accounts
3. Review audit logs for unauthorized access
4. Check database for unauthorized changes
5. Update all credentials and secrets
6. Monitor systems closely for 48 hours
7. Document the incident and response

## 🔄 Credential Rotation Schedule

| Credential Type | Rotation Frequency | Method |
|----------------|-------------------|---------|
| Database Passwords | Every 90 days | Generate new, update env vars |
| NextAuth Secret | Every 180 days | Generate new random string |
| API Keys | Every 90 days | Generate new, update integrations |
| Admin Passwords | Every 90 days | Force password reset |
| SSL Certificates | Before expiration | Auto-renewal recommended |

---

**Remember: Security is not a one-time setup but an ongoing process!**