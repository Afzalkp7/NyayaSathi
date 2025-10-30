# Testing Role-Based Login Routing

## Changes Made

### 1. Updated Login Logic (`frontend/src/pages/LoginPage.tsx`)

- Simplified role detection to use `data.user.role` directly from backend
- **Admin users** (`role === 'admin'`) → redirected to `/admin/dashboard`
- **Regular users** (`role === 'user'`) → redirected to `/` (HomePage)
- **Guest users** (`role === 'guest'`) → redirected to `/` (HomePage)
- Fixed API endpoint to use `/api/auth/login` (works with Vite proxy)

### 2. Created Admin User Script (`backend/scripts/createAdminUser.js`)

- Automated script to create admin users
- Default credentials: `admin@nyayasathi.com` / `admin123`
- Checks for existing admin and updates role if needed

### 3. Updated Documentation (`.github/copilot-instructions.md`)

- Added role-based navigation pattern
- Documented admin user creation workflow

## Testing Steps

### Step 1: Create an Admin User

```bash
cd backend
node scripts/createAdminUser.js
```

You should see:

```
✅ Admin user created successfully!
   Email: admin@nyayasathi.com
   Password: admin123
   ⚠️  CHANGE THE PASSWORD AFTER FIRST LOGIN!
```

### Step 2: Start the Application

Terminal 1 (Backend):

```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):

```bash
cd frontend
npm run dev
```

### Step 3: Test Admin Login

1. Navigate to `http://localhost:5173/login`
2. Enter credentials:
   - Email: `admin@nyayasathi.com`
   - Password: `admin123`
3. Click "Sign in"
4. **Expected**: You should be redirected to `/admin/dashboard`

### Step 4: Test Regular User Login

1. Create a regular user account via signup
2. Login with that account
3. **Expected**: You should be redirected to `/` (HomePage)

### Step 5: Test Guest Login

1. On login page, click "Continue as Guest"
2. **Expected**: You should be redirected to `/` (HomePage)

## Troubleshooting

### Issue: "Invalid credentials" error

- Ensure MongoDB is running and connected
- Check that admin user was created successfully
- Verify credentials are correct

### Issue: Redirected to wrong page

- Check browser console for errors
- Verify `data.user.role` value in network tab
- Ensure backend is returning correct role field

### Issue: Token not persisting

- Clear localStorage: `localStorage.clear()`
- Check AuthContext is properly wrapping App
- Verify token is being saved in localStorage

## Backend Role Structure

The backend returns user data in this format:

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "Admin",
    "email": "admin@nyayasathi.com",
    "role": "admin" // Can be "admin", "user", or "guest"
  }
}
```

The frontend checks `data.user.role` and routes accordingly:

- `"admin"` → `/admin/dashboard`
- `"user"` or `"guest"` → `/`
