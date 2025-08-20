# CRM Integration Button Implementation Prompt

## Project Context
**Ekhaya Car Wash** - Next.js 14 application with existing external CRM system that has its own authentication (Admin, Director, HR Manager levels).

## Objective
Add a simple CRM access button to the existing application sidebar that opens the external CRM system for managing car wash database operations.

## Current Project Structure
```
app/
├── components/
│   ├── dashboard/
│   │   └── dashboard-sidebar.tsx    # Main sidebar component
│   └── ui/                         # UI components
├── app/
│   ├── dashboard/
│   │   └── page.tsx               # Main dashboard page
│   └── layout.tsx                 # Root layout
└── lib/
    └── auth.ts                    # Authentication utilities
```

## Requirements

### 1. **Locate and Modify Dashboard Sidebar**
**File to modify**: `app/components/dashboard/dashboard-sidebar.tsx`

Add CRM button with:
- **Button Text**: "CRM System" or "Database Management"
- **Icon**: Database, BarChart, or Settings icon from lucide-react
- **Position**: Add after existing dashboard navigation items
- **Styling**: Match existing sidebar button patterns

### 2. **Access Control Implementation**
Use existing NextAuth session to control visibility:
- **Admin Users**: Show CRM button
- **Staff Users**: Hide CRM button (since CRM has own auth levels)
- **Regular Users**: No CRM access

### 3. **Implementation Approach**

**Recommended: External Link in New Tab**
```tsx
// Add to dashboard-sidebar.tsx
import { Database } from 'lucide-react';
import { useSession } from 'next-auth/react';

const { data: session } = useSession();

// Add this button in the sidebar navigation section
{session?.user?.role === 'ADMIN' && (
  <button
    onClick={() => window.open(process.env.NEXT_PUBLIC_CRM_URL, '_blank')}
    className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
  >
    <Database className="w-5 h-5" />
    <span>CRM System</span>
  </button>
)}
```

### 4. **Environment Configuration**
**File to modify**: `.env.local`

Add CRM URL:
```env
# External CRM System
NEXT_PUBLIC_CRM_URL=https://your-crm-system-url.com
```

### 5. **Files to Modify**

**Primary File:**
- `app/components/dashboard/dashboard-sidebar.tsx` - Add CRM button

**Secondary Files (if needed):**
- `.env.local` - Add CRM URL environment variable
- `app/dashboard/page.tsx` - Verify admin access context

### 6. **Detailed Implementation Steps**

1. **Open dashboard-sidebar.tsx**
2. **Import required dependencies**:
   ```tsx
   import { Database } from 'lucide-react';
   import { useSession } from 'next-auth/react';
   ```
3. **Add session check** near other hooks
4. **Insert CRM button** in the navigation section
5. **Test with admin and non-admin users**

### 7. **Complete Code Example**

```tsx
// Add to existing dashboard-sidebar.tsx component
const { data: session } = useSession();

// In the navigation/menu section:
<nav className="space-y-2">
  {/* Existing navigation items */}
  
  {/* CRM System Access - Admin Only */}
  {session?.user?.role === 'ADMIN' && (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
        System Management
      </h3>
      <button
        onClick={() => {
          window.open(
            process.env.NEXT_PUBLIC_CRM_URL || 'https://your-crm-url.com',
            '_blank',
            'noopener,noreferrer'
          );
        }}
        className="flex items-center space-x-3 w-full p-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors group"
      >
        <Database className="w-5 h-5 group-hover:text-blue-600" />
        <span className="font-medium">CRM System</span>
        <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </button>
    </div>
  )}
</nav>
```

### 8. **Testing Checklist**
- [ ] CRM button appears for admin users only
- [ ] Button hidden for non-admin users
- [ ] Link opens external CRM in new tab
- [ ] Styling matches existing sidebar items
- [ ] External link icon appears correctly
- [ ] Environment variable loads properly

### 9. **Security Considerations**
- Only admin users can see the CRM button
- External link opens with `noopener,noreferrer` for security
- CRM system handles its own authentication (Admin/Director/HR levels)
- No sensitive data passed through URL parameters

### 10. **Mobile Responsiveness**
Ensure the CRM button works on mobile by:
- Using responsive classes in existing sidebar
- Testing button tap functionality on mobile devices
- Verifying external link behavior on mobile browsers

## Expected Outcome
A simple, secure CRM access button that:
- ✅ Integrates seamlessly with existing dashboard sidebar
- ✅ Shows only for admin users via role-based access control
- ✅ Opens external CRM system in new tab/window
- ✅ Maintains consistent design with existing UI elements
- ✅ Provides secure access to external CRM with proper authentication handoff

## Implementation Time
**Estimated**: 10-15 minutes for implementation + 5 minutes testing

## Quick Start
1. Locate `app/components/dashboard/dashboard-sidebar.tsx`
2. Add the CRM button code from section 7
3. Add CRM URL to `.env.local`
4. Test with admin account
5. Verify button is hidden for non-admin users

The implementation leverages your existing authentication system and simply provides a gateway to your external CRM without recreating any CRM functionality.