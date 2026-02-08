# 🏸 Setup Checklist

Follow these steps to get your Badminton Rating Platform running:

## ✅ Step 1: Install Dependencies

```bash
cd badminton-rating
npm install
```

## ✅ Step 2: Configure Clerk Authentication

### 2.1 Create Clerk Account
1. Go to https://dashboard.clerk.com
2. Sign up or log in
3. Click "Add application"
4. Name it "Badminton Rating Platform"
5. Choose authentication methods (Email + Password recommended)

### 2.2 Get API Keys
1. In your Clerk dashboard, go to "API Keys"
2. Copy the following:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

### 2.3 Update .env File
Replace these lines in your `.env` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_actual_publishable_key_here
CLERK_SECRET_KEY=your_actual_secret_key_here
```

### 2.4 Configure Redirect URLs in Clerk
1. In Clerk dashboard, go to "Paths"
2. Set the following:
   - **Sign-in page**: `/sign-in`
   - **Sign-up page**: `/sign-up`
   - **After sign-in**: `/complete-profile`
   - **After sign-up**: `/complete-profile`

## ✅ Step 3: Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to Neon database
npx prisma db push
```

You should see output like:
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
Your database is now in sync with your Prisma schema.
```

## ✅ Step 4: Run the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## ✅ Step 5: Test Authentication

1. Click "Sign Up"
2. Create an account with email/password
3. You should be redirected to `/complete-profile` (we'll build this in Phase 2)

## 🔍 Verify Everything Works

### Check Database Connection
```bash
npx prisma studio
```

This opens a visual database browser at http://localhost:5555

### Check Clerk Authentication
1. Try signing up
2. Check Clerk dashboard → Users to see your new user

### Check Rating Algorithm
The rating system is in `src/lib/rating/`:
- `constants.ts` - Min/max ratings, K-factors
- `initial-rating.ts` - Self-assessment → initial rating
- `match-adjustment.ts` - Match results → rating changes

## 🚨 Common Issues

### Issue: "Cannot find module '@clerk/nextjs'"
**Solution**: Run `npm install` again

### Issue: "Environment variable DATABASE_URL not found"
**Solution**: Make sure `.env` file exists with correct database URL

### Issue: Clerk authentication not working
**Solution**: 
1. Double-check your API keys in `.env`
2. Make sure redirect URLs are configured in Clerk dashboard
3. Restart dev server (`npm run dev`)

### Issue: Prisma client errors
**Solution**: Run `npx prisma generate` again

## ✨ You're Ready!

Once all steps show ✅, you're ready for **Phase 2: Profile Creation**.

---

**Current Status**: Phase 1 Complete ✅
**Next**: Build profile completion flow with self-rating questionnaire
