# 🧪 Phase 2 Testing Guide

## ✅ What Was Built in Phase 2

### 1. Profile Completion Flow
- Complete profile page with form validation
- 8-question self-rating questionnaire with sliders
- Initial rating calculation based on self-assessment
- Organization creation and selection

### 2. Dashboard
- Main navigation with links (Dashboard, Record, Event, Player)
- User stats display (rating, wins, losses, win rate)
- Quick action cards
- Profile info in navigation bar with user display name format ("Name#20")

### 3. Authentication Guards
- Redirect to `/complete-profile` if profile not completed
- Redirect to `/dashboard` if already has profile
- Root page (`/`) redirects appropriately based on auth status

---

## 🧪 Testing Checklist

### Test 1: New User Flow

1. **Sign Up**
   ```
   Go to: http://localhost:3000
   → Should redirect to /sign-in
   → Click "Sign up"
   → Create account with email/password
   ```

2. **Profile Completion**
   ```
   After signup, should automatically redirect to /complete-profile
   
   Fill in the form:
   ✓ Full Name: "John Smith"
   ✓ Sex: "Male"
   ✓ Location: "San Francisco, CA"
   ✓ Preferred Game Type: "Singles"
   ✓ Organization: Select existing OR create new
   ✓ Self-Rating: Adjust sliders (try different values)
   
   Click "Complete Profile"
   ```

3. **Dashboard Access**
   ```
   → Should redirect to /dashboard
   → Verify navigation works (Dashboard, Record, Event, Player)
   → Check user display name format: "John Smith#1" (or #2, #3, etc.)
   → Verify rating is calculated (0-9000 based on sliders)
   → Stats should show: Rating, 0 Wins, 0 Losses, 0.0% Win Rate
   ```

---

### Test 2: Organization Creation

1. **Create New Organization**
   ```
   During profile completion:
   → Click "+ Create New" next to Organization dropdown
   → Fill in:
      - Name: "SF Badminton Club"
      - Type: "Club"
      - Location: "San Francisco, CA"
   → Click "Create Organization"
   → Should appear in dropdown and be auto-selected
   ```

2. **Select Existing Organization**
   ```
   → Dropdown should show:
      "SF Badminton Club (Club) - San Francisco, CA (1 member)"
   ```

---

### Test 3: Rating Calculation

1. **All 1's Rating**
   ```
   Set all 8 sliders to 1
   → Expected rating: 0
   ```

2. **All 10's Rating**
   ```
   Set all 8 sliders to 10
   → Expected rating: 9000
   ```

3. **All 5's Rating**
   ```
   Set all 8 sliders to 5
   → Expected rating: ~4500 (middle)
   ```

4. **Mixed Ratings**
   ```
   Try various combinations
   → Rating should scale proportionally
   ```

---

### Test 4: Navigation & Guards

1. **Profile Guard**
   ```
   Create a second user account
   Before completing profile:
   → Try visiting /dashboard directly
   → Should redirect to /complete-profile
   ```

2. **Profile Already Complete**
   ```
   With first user (profile completed):
   → Try visiting /complete-profile
   → Should redirect to /dashboard
   ```

3. **Root Page Redirect**
   ```
   Visit http://localhost:3000
   → If not logged in: redirect to /sign-in
   → If logged in but no profile: redirect to /complete-profile
   → If logged in with profile: redirect to /dashboard
   ```

4. **Navigation Links**
   ```
   From dashboard, test all nav links:
   ✓ Dashboard → /dashboard (shows stats)
   ✓ Record → /record (placeholder)
   ✓ Event → /event (placeholder)
   ✓ Player → /player (placeholder)
   ✓ Profile icon → Clerk user menu (sign out option)
   ```

---

### Test 5: User Display Names

1. **Create Multiple Users with Same Name**
   ```
   User 1: "John Smith" → Should display "John Smith#1"
   User 2: "John Smith" → Should display "John Smith#2"
   User 3: "Jane Doe" → Should display "Jane Doe#3"
   ```

2. **Check Display in Navigation**
   ```
   In top-right of dashboard nav:
   → Should show: "John Smith#1"
   → Below: "Rating: 4500 • SF Badminton Club"
   ```

---

### Test 6: Database Verification

**Open Prisma Studio:**
```bash
npx prisma studio
```

**Verify Tables:**

1. **User Table**
   - ✓ clerkId populated
   - ✓ userNumber is unique and auto-incremented
   - ✓ rating calculated from self-rating
   - ✓ profileCompleted = true
   - ✓ organizationId linked

2. **SelfRating Table**
   - ✓ All 8 questions have values 1-10
   - ✓ userId matches User.id

3. **Organization Table**
   - ✓ New organization created
   - ✓ name, type, location populated

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found" errors
**Solution:**
```bash
npm install
npx prisma generate
```

### Issue: Database out of sync
**Solution:**
```bash
npx prisma db push
```

### Issue: Clerk authentication not working
**Solution:**
- Check `.env` has correct Clerk keys
- Restart dev server: `npm run dev`

### Issue: Rating shows 0 for all sliders at 5
**Solution:**
- This is correct! Check the calculation:
  - All 5's = 40 total (8 questions × 5)
  - Maps to middle of 0-9000 range = ~4500
  - Check `src/lib/rating/initial-rating.ts`

### Issue: Organization dropdown empty
**Solution:**
- Create a new organization first
- Or check Prisma Studio if organizations exist

---

## ✅ Expected Results Summary

After Phase 2 testing, you should have:

✅ Working authentication with Clerk
✅ Profile completion with self-rating questionnaire
✅ Initial rating calculated (0-9000 range)
✅ Organization creation and selection
✅ Dashboard with navigation
✅ User display format: "Name#UserNumber"
✅ Profile guard (can't access app without completed profile)
✅ Stats displayed (rating, wins, losses, win rate)

---

## 📊 Rating Algorithm Verification

The rating calculation is in `src/lib/rating/`:

**To verify it's working:**
1. Check `initial-rating.ts` calculation
2. Try different slider combinations
3. Rating should be:
   - All 1's → 0
   - All 10's → 9000
   - Linear interpolation for mixed values

**To modify the algorithm:**
- Edit `src/lib/rating/initial-rating.ts`
- Change the calculation logic
- Restart server to apply changes

---

## 🚀 Ready for Phase 3?

Once all tests pass:
✅ Users can sign up and complete profiles
✅ Organizations can be created
✅ Ratings are calculated correctly
✅ Navigation works properly
✅ User display names show correctly

**Reply "Phase 3 ready"** and we'll build:
- Event creation with 4-digit codes
- Event joining
- Event participant management
- Organization leaderboards
