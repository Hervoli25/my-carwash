#!/bin/bash

# 🚨 CRITICAL SECURITY CLEANUP SCRIPT
# This script removes sensitive files from Git history

echo "🚨 Starting security cleanup..."

# Remove sensitive files from Git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch app/.env.production' \
  --prune-empty --tag-name-filter cat -- --all

# Remove other sensitive files
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch app/SETUP_GUIDE.md' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch app/SETUP-INSTRUCTIONS.md' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch app/CRM_INTEGRATION_EXAMPLE.md' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch app/STRIPE_INTEGRATION.md' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch app/DATABASE_SCHEMA.md' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch app/ADMIN_ACCESS_GUIDE.md' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch app/CRM_API_DOCUMENTATION.md' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch app/CRM_DASHBOARD_IMPLEMENTATION_PROMPT.md' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch app/CRM_INTEGRATION_PROMPT.md' \
  --prune-empty --tag-name-filter cat -- --all

# Remove root level sensitive files
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch CLAUDE.md' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch POINTS_SYSTEM_IMPLEMENTATION_ROADMAP.md' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch crm_integration_points_system.md' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch database_points_system_schema.sql' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch points_system_business_rules.md' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .windsurfrules' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .cursor/rules/design.mdc' \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .superdesign/design_iterations/default_ui_darkmode.css' \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Git history cleaned"
echo "⚠️  NEXT: Force push to GitHub: git push origin --force --all"
echo "⚠️  WARNING: This will rewrite Git history!"
