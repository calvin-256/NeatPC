# NeatPC — 40 Commit Roadmap

This plan outlines the roadmap to finish building NeatPC from its current state. The backend core (Retailer Adapters, Price Sync, Deal Scoring, and Basic Auth) is mostly established. We now need to build the AI brain, the frontend flows, and user features.

## Phase 1: AI Integration & Chat Backend (Commits 1-5)
1. `feat: integrate Gemini AI client (src/lib/ai/gemini.ts) for product recommendations`
2. `feat: AI prompt engineering for quiz results and structured JSON output`
3. `feat: ChatSession and ChatMessage database persistence logic`
4. `feat: POST /api/chat endpoint with Next.js AI SDK streaming support`
5. `feat: context-aware AI context injection (feeding product prices into prompts)`

## Phase 2: Frontend — Global UI & Layout (Commits 6-10)
6. `feat: implement global responsive navbar with Auth state (Sign In / User Avatar)`
7. `feat: build generic reusable UI components (Button, Input, Modal, Badge, Card)`
8. `feat: toast notifications system and global error boundary UI`
9. `feat: dark/light mode toggle and theme configuration via CSS variables`
10. `feat: Framer motion page transitions and micro-animations for interactive elements`

## Phase 3: Frontend — The Quiz Flow (Commits 11-15)
11. `feat: Home page hero section and "Start Quiz" entry point`
12. `feat: interactive multi-step quiz UI (budget, profession, form factor preferences)`
13. `feat: quiz state management using Zustand or React Context`
14. `feat: loading skeletons and animations during AI analysis phase`
15. `feat: results page layout to display personalized AI recommendations`

## Phase 4: Product Discovery & Search (Commits 16-20)
16. `feat: unified product search API with pagination, sorting, and filtering`
17. `feat: search page UI with dynamic sidebar filters (brand, category, price range)`
18. `feat: product card component with price, retailer logo, and deal score gauge`
19. `feat: "Where to Buy" list showing live prices from all retailers`
20. `feat: save product action (Wishlist) hook and UI toggle`

## Phase 5: Product Details Page (Commits 21-25)
21. `feat: dynamic [slug] product details page layout`
22. `feat: spec sheet UI (expanding JSON specs into a readable table)`
23. `feat: price history chart component using Recharts (30-day trends)`
24. `feat: related products recommendation carousel on product page`
25. `feat: social sharing metadata (OpenGraph tags) for product pages`

## Phase 6: User Dashboard (Commits 26-30)
26. `feat: user dashboard layout and navigation sidebar`
27. `feat: "Saved Deals" tab with grid of saved products and latest prices`
28. `feat: "Price Alerts" tab UI to view, add, and manage active alerts`
29. `feat: "Chat History" tab to view past AI recommendations and quiz results`
30. `feat: user profile and settings management UI (delete account, update name)`

## Phase 7: Email & Notifications (Commits 31-35)
31. `feat: setup Nodemailer / Resend for transactional emails`
32. `feat: email notification templates for triggered price alerts`
33. `feat: background cron job robust error handling for sync/alerts`
34. `feat: welcome email on user sign-up`
35. `feat: weekly "Top Deals" newsletter generation based on user preferences`

## Phase 8: Polish, Analytics & Launch Prep (Commits 36-40)
36. `feat: setup analytics and feedback tracking hooks (Thumbs up/down on AI)`
37. `chore: final accessibility (a11y) audit and ARIA tag fixes`
38. `chore: performance audit (image optimization, dynamic imports, bundle size)`
39. `chore: comprehensive SEO metadata and dynamic sitemap.xml generation`
40. `chore: final production build optimizations and deployment prep`
