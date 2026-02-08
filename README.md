# 🏸 Badminton Rating Platform

A Next.js application for managing badminton player ratings, events, and matches.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Neon database account (already configured)
- A Clerk account for authentication

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Clerk Authentication

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application
3. Copy your API keys
4. Update `.env` file with your Clerk keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
badminton-rating/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── sign-in/          # Sign in page
│   │   ├── sign-up/          # Sign up page
│   │   ├── complete-profile/ # Profile completion (next phase)
│   │   └── dashboard/        # Main dashboard (next phase)
│   ├── lib/
│   │   ├── rating/           # ⚠️ MODULAR RATING ALGORITHM
│   │   │   ├── calculator.ts      # Main entry point
│   │   │   ├── initial-rating.ts  # Self-assessment → rating
│   │   │   ├── match-adjustment.ts # Match outcome → rating change
│   │   │   └── constants.ts       # System constants
│   │   ├── prisma.ts         # Database client
│   │   └── utils.ts          # Helper functions
│   └── components/           # React components (next phase)
└── middleware.ts             # Clerk authentication middleware
```

## 🔧 Modifying the Rating Algorithm

The rating system is designed to be **easily replaceable**. All rating logic is isolated in `src/lib/rating/`.

### To Change Initial Rating Calculation:
Edit `src/lib/rating/initial-rating.ts`

Current logic: Linear mapping from self-assessment (8-80) to rating (0-9000)

### To Change Match Rating Adjustments:
Edit `src/lib/rating/match-adjustment.ts`

Current logic: ELO-like system with K-factor

### To Change System Constants:
Edit `src/lib/rating/constants.ts`

Modify K-factor, min/max ratings, etc.

## 🗄️ Database Schema

### Key Models:
- **User**: Player profiles with ratings
- **SelfRating**: 8-question self-assessment
- **Organization**: Clubs and colleges
- **Event**: Tournaments with 4-digit join codes
- **Match**: Singles/doubles matches (event, challenge, or practice)
- **ScoreCorrectionRequest**: For disputing event match scores

### User Display Format:
Users are displayed as "Name#UserNumber" (e.g., "John Smith#20")

## 🎯 Features Roadmap

### ✅ Phase 1: Foundation (Current)
- Project setup
- Database schema
- Clerk authentication
- Rating algorithm (modular)

### 🚧 Phase 2: Core Features (Next)
- Profile creation with self-rating questionnaire
- Organization management
- Dashboard

### 📋 Phase 3-5: Coming Soon
- Events and match recording
- Leaderboards
- Player search
- Score correction system

## 🔐 Authentication Flow

1. User signs up with Clerk
2. Redirected to `/complete-profile`
3. Must complete profile before accessing app
4. Profile includes:
   - Name, sex, location
   - Organization (can create or join)
   - Preferred game type (singles/doubles)
   - 8-question self-rating (1-10 scale each)

## 📝 Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL`: Neon PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key
- `CLERK_SECRET_KEY`: Clerk secret key

## 🚀 Deployment

This project is configured for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Make sure to:
1. Add environment variables in Vercel dashboard
2. Connect your GitHub repository
3. Set up automatic deployments

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test database connection
npx prisma db pull
```

### Clerk Authentication Not Working
- Check that environment variables are set correctly
- Verify Clerk redirect URLs in dashboard match your app URLs
- Clear browser cache and cookies

### Prisma Client Out of Sync
```bash
# Regenerate Prisma client
npx prisma generate
```

## 📚 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Neon (Serverless Postgres)
- **ORM**: Prisma
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 🤝 Contributing

This is a custom application. Modify freely to fit your needs!

---

**Next Steps**: Once Clerk is configured, we'll build Phase 2 (Profile Creation & Organizations)
