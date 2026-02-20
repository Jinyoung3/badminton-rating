# 🏸 Badminton Rating Platform

A full-stack Next.js application for managing badminton player ratings, events, and match history using the **Glicko-2 rating system**.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | Neon (Serverless PostgreSQL) |
| ORM | Prisma |
| Auth | Clerk |
| Styling | Tailwind CSS |
| Rating Algorithm | Glicko-2 (custom implementation) |

---

## 📁 Project Structure

```
badminton-rating/
├── prisma/
│   └── schema.prisma              # DB schema (User, Match, Event, Org, etc.)
├── src/
│   ├── actions/                   # Next.js Server Actions
│   │   ├── corrections.ts         # Score correction requests
│   │   ├── event.ts               # Event CRUD + join/leave
│   │   ├── leaderboard.ts         # Global & org leaderboards
│   │   ├── match.ts               # Record challenge/event matches
│   │   ├── matches.ts             # Match queries & statistics
│   │   ├── organization.ts        # Org CRUD & search
│   │   ├── player.ts              # Player search & profiles
│   │   └── user.ts                # Profile creation & updates
│   ├── app/
│   │   ├── (dashboard)/           # Protected dashboard routes
│   │   │   ├── dashboard/         # Home stats + recent matches
│   │   │   ├── event/             # Events list, detail, create
│   │   │   ├── leaderboard/       # Global & org rankings
│   │   │   ├── matches/           # Match history + detail
│   │   │   ├── player/            # Player search + profiles
│   │   │   ├── profile/           # My profile + edit
│   │   │   └── record/            # Record challenge/practice
│   │   ├── complete-profile/      # Onboarding flow
│   │   ├── sign-in/               # Clerk sign-in page
│   │   ├── sign-up/               # Clerk sign-up page
│   │   └── bypass/                # Dev bypass for quick setup
│   ├── components/                # React client components
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── utils.ts               # Shared helpers
│   │   └── rating/
│   │       ├── calculator.ts      # Main exports entry point
│   │       ├── constants.ts       # Glicko-2 constants & config
│   │       ├── glicko2.ts         # Core Glicko-2 engine
│   │       ├── initial-rating.ts  # Self-assessment → initial rating
│   │       └── match-adjustment.ts # Match outcome → rating change
│   └── middleware.ts              # Clerk auth middleware
```

---

## ⚙️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example and fill in your keys:

```bash
cp .env.example .env
```

```env
# Neon PostgreSQL
DATABASE_URL="your_neon_database_url"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/complete-profile
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/complete-profile
```

### 3. Set Up the Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Neon
npx prisma db push

# (Optional) Visual DB browser
npx prisma studio
```

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentication Flow

1. User signs up via Clerk → redirected to `/complete-profile`
2. User fills out basic info + 8-question self-rating questionnaire
3. Initial Glicko-2 rating is calculated and stored
4. `profileCompleted = true` → access to `/dashboard` granted
5. Middleware blocks all dashboard routes until profile is complete

---

## 🧮 Rating System (Glicko-2)

All rating logic lives in `src/lib/rating/` and is fully modular.

### Initial Rating

Calculated from the 8-question self-assessment (each scored 1–10):

```
Sum range: 8 (all 1s) → 80 (all 10s)
Maps to:   0           → 3000 (mu)
```

New players start with `phi = 350` (high uncertainty) and `sigma = 0.06`.

### Match Rating Updates

**Singles:** Standard Glicko-2 `rate1v1()` — player rated directly against opponent.

**Doubles:** Each player is rated against the **opponent team's average rating**:
```
team2_avg = { mu: avg(p3.mu, p4.mu), phi: sqrt_avg(p3.phi², p4.phi²), ... }
new_p1 = glicko.rate(p1, [{ score: WIN/LOSS, opponentRating: team2_avg }])
```

### Constants (`src/lib/rating/constants.ts`)

| Constant | Value | Description |
|---|---|---|
| `DEFAULT_MU` | 1500 | Starting rating |
| `DEFAULT_PHI` | 350 | Starting uncertainty |
| `DEFAULT_SIGMA` | 0.06 | Starting volatility |
| `TAU` | 0.5 | System volatility constraint |
| `MIN_RATING` | 0 | Floor (applied to mu) |
| `MAX_RATING` | 3000 | Soft ceiling |
| `PRACTICE_AFFECTS_RATING` | false | Practice matches don't update ratings |

To change the algorithm, edit the files in `src/lib/rating/` — no other changes needed.

---

## 🗄️ Database Schema

### Core Models

**User** — Player profile with Glicko-2 fields
```
clerkId, email, name, userNumber (auto-increment, unique)
sex, location, preferredGameType
rating (display), ratingMu, ratingPhi, ratingSigma
winCount, lossCount, profileCompleted
organizationId (FK)
```

**Match** — Singles or doubles match
```
type: "event" | "challenge" | "practice"
gameType: "singles" | "doubles"
player1Id, player2Id, player3Id?, player4Id?
games: JSON  → [{ team1: 21, team2: 19 }, ...]
winner: "team1" | "team2"
eventId? (FK)
```

**Event** — Tournament or session
```
name, description?, location, date
organizationId (FK), creatorId (FK)
eventCode? (legacy, no longer used for joining)
```

**Organization** — Club or college
```
name, type: "Club" | "College", location
```

**EventParticipant** — Join table (event ↔ user)
```
eventId, userId, isAbsent (default: false)
```

**ScoreCorrectionRequest** — Dispute system
```
matchId, eventId?, requesterId
proposedGames: JSON, reason, status: "pending" | "approved" | "rejected"
```

**SelfRating** — Stores the 8 questionnaire answers (1–10 each)

### User Display Format

Users are shown as `Name#UserNumber` (e.g., `John Smith#42`), implemented in `src/lib/utils.ts`:

```ts
formatUserDisplayName(name: string, userNumber: number): string
```

---

## 🏆 Features

### Dashboard
- Current rating, wins, losses, win rate
- Recent match feed with WIN/LOSS indicators
- Quick action cards (record match, find events, create event, find players)

### Match Recording
- **Challenge Match** — affects ratings
- **Practice Match** — recorded but ratings unchanged
- **Event Match** — recorded by event creator only
- Supports singles (1v1) and doubles (2v2)
- Game-by-game scores with auto winner calculation

### Score Correction System
- Match participants can request score corrections with proposed new scores
- Opponent receives an in-app notification (bell icon)
- Opponent can accept (updates match + re-applies ratings) or reject
- Event creators see all pending corrections for their event

### Events
- Create events tied to your organization
- Players join/leave events from the events listing
- Creator can mark participants absent and record matches
- Match history per event

### Leaderboard
- Global leaderboard (all players)
- Per-organization leaderboard
- Switchable via dropdown

### Player Search
- Filter by name, location, rating range, preferred game type
- Public player profile with singles/doubles records, self-rating bars, recent matches

---

## 🛠️ Key Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npx prisma studio    # Open visual DB browser
npx prisma db push   # Sync schema to database
npx prisma generate  # Regenerate Prisma client
```

---

## 🚨 Score Correction Flow

```
Participant notices wrong score
  → clicks "Request Correction" on /matches/[id]
  → fills in proposed games + reason
  → opponent gets 🔔 notification badge

Opponent opens notification
  → reviews proposed score on /matches/[id]
  → clicks Accept → match.games updated, winner recalculated
  → clicks Reject → request marked rejected, original score kept
```

---

## 🔧 Modifying the Rating Algorithm

Everything is isolated — swap out the engine without touching the rest of the app:

| File | What to change |
|---|---|
| `constants.ts` | K-factors, min/max ratings, TAU, practice settings |
| `initial-rating.ts` | How self-assessment maps to starting Glicko-2 values |
| `match-adjustment.ts` | How match outcomes update singles/doubles ratings |
| `glicko2.ts` | The core Glicko-2 math (advanced) |

---

## 🚀 Deployment (Vercel)

```bash
npm i -g vercel
vercel
```

Add all environment variables from `.env` to the Vercel project dashboard before deploying.

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| `Cannot find module '@clerk/nextjs'` | `npm install` |
| `DATABASE_URL not found` | Check `.env` file exists |
| Prisma client errors | `npx prisma generate` |
| DB out of sync | `npx prisma db push` |
| Clerk auth not working | Verify keys in `.env`, restart dev server |
| Old match links broken | DB was reset — old IDs no longer exist |
