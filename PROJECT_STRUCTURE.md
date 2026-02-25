# Project Structure

```
travel-planner/
│
├── 📁 server/                          # Backend (Node.js + Express)
│   ├── 📁 controllers/
│   │   ├── authController.js          # Authentication logic
│   │   └── planController.js          # Travel planning logic
│   │
│   ├── 📁 middleware/
│   │   └── authMiddleware.js          # JWT authentication middleware
│   │
│   ├── 📁 models/
│   │   ├── History.js                 # Travel history schema
│   │   ├── OTP.js                     # OTP verification schema
│   │   └── User.js                    # User schema
│   │
│   ├── 📁 routes/
│   │   ├── authRoutes.js              # Auth endpoints
│   │   └── planRoutes.js              # Planning endpoints
│   │
│   ├── 📁 utils/
│   │   └── emailService.js            # Email/OTP service
│   │
│   ├── .env                           # ⚙️ Server environment variables
│   ├── server.js                      # Main server file
│   ├── vercel.json                    # Vercel deployment config
│   ├── package.json                   # Dependencies
│   └── package-lock.json
│
├── 📁 travellplanner/                  # Frontend (React + Vite)
│   ├── 📁 src/
│   │   ├── 📁 component/
│   │   │   ├── Auth.jsx               # Login/Register modal
│   │   │   ├── ConfirmModal.jsx       # Confirmation dialogs
│   │   │   ├── DayCard.jsx            # Daily itinerary card
│   │   │   ├── HistorySidebar.jsx     # Travel history sidebar
│   │   │   ├── Home.jsx               # Main page component
│   │   │   ├── HotelCard.jsx          # Hotel recommendation card
│   │   │   ├── Navbar.jsx             # Navigation bar
│   │   │   ├── ResultsSection.jsx     # Trip results display
│   │   │   ├── SearchCard.jsx         # Search input (mobile-optimized)
│   │   │   ├── SuccessPopup.jsx       # Success notifications
│   │   │   ├── SuggestionPills.jsx    # Destination suggestions
│   │   │   └── TermsAndConditions.jsx # T&C modal
│   │   │
│   │   ├── config.js                  # ⚙️ API configuration
│   │   ├── index.css                  # Global styles (optimized)
│   │   ├── main.jsx                   # React entry point
│   │   └── App.jsx                    # Root component
│   │
│   ├── 📁 public/                      # Static assets
│   ├── 📁 dist/                        # Build output (generated)
│   │
│   ├── .env                           # ⚙️ Frontend environment variables
│   ├── .gitignore                     # Git ignore rules
│   ├── index.html                     # HTML template
│   ├── vite.config.js                 # Vite build configuration
│   ├── tailwind.config.js             # Tailwind CSS config
│   ├── postcss.config.js              # PostCSS config
│   ├── eslint.config.js               # ESLint config
│   ├── vercel.json                    # Vercel deployment config
│   ├── package.json                   # Dependencies
│   ├── package-lock.json
│   └── README.md                      # Original README
│
├── 📄 README.md                        # 📚 Main project documentation
├── 📄 SETUP.md                         # 🚀 Setup instructions
├── 📄 QUICK_REFERENCE.md               # ⚡ Quick reference card
├── 📄 CHANGES_SUMMARY.md               # 📝 Changes log
├── 📄 PROJECT_STRUCTURE.md             # 📁 This file
│
└── .gitignore                          # Root git ignore

```

## 📊 Key Directories Explained

### Backend (`server/`)
- **controllers/** - Business logic for auth and planning
- **middleware/** - JWT authentication
- **models/** - MongoDB schemas (User, History, OTP)
- **routes/** - API endpoint definitions
- **utils/** - Helper functions (email service)
- **.env** - All server configuration

### Frontend (`travellplanner/`)
- **src/component/** - React components
- **src/config.js** - Centralized API configuration
- **src/index.css** - Performance-optimized styles
- **public/** - Static assets (images, icons)
- **dist/** - Production build output
- **.env** - All frontend configuration

## 🔑 Important Files

### Configuration Files
```
server/.env                    # Server environment variables
travellplanner/.env            # Frontend environment variables
travellplanner/vite.config.js  # Build optimization
travellplanner/vercel.json     # Deployment settings
server/vercel.json             # Backend deployment
```

### Entry Points
```
server/server.js               # Backend entry
travellplanner/src/main.jsx    # Frontend entry
travellplanner/index.html      # HTML template
```

### Documentation
```
README.md                      # Project overview
SETUP.md                       # Setup guide
QUICK_REFERENCE.md             # Quick reference
CHANGES_SUMMARY.md             # What changed
PROJECT_STRUCTURE.md           # This file
```

## 📦 Dependencies

### Backend
- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - JWT authentication
- nodemailer - Email service
- cors - CORS middleware
- dotenv - Environment variables
- @google/generative-ai - Gemini AI

### Frontend
- react - UI library
- react-dom - React DOM
- react-router-dom - Routing
- vite - Build tool
- tailwindcss - CSS framework
- vite-plugin-compression - Gzip/Brotli compression

## 🎯 Component Hierarchy

```
App
└── Home
    ├── Navbar
    ├── SearchCard (mobile-optimized)
    ├── SuggestionPills
    ├── ResultsSection
    │   ├── HotelCard
    │   └── DayCard (multiple)
    ├── HistorySidebar (lazy loaded)
    ├── Auth (lazy loaded)
    ├── TermsAndConditions (lazy loaded)
    ├── ConfirmModal (lazy loaded)
    └── SuccessPopup
```

## 🔄 Data Flow

```
User Input (SearchCard)
    ↓
Home Component
    ↓
API Call (config.apiUrl)
    ↓
Backend (server.js)
    ↓
Controller (planController.js)
    ↓
Gemini AI API
    ↓
Response Processing
    ↓
Save to MongoDB (if logged in)
    ↓
Display Results (ResultsSection)
```

## 📱 Mobile Optimizations

### SearchCard Component
- Fixed bottom position
- Compact horizontal layout
- Modal date picker
- Touch-optimized

### CSS Optimizations
- Hidden decorative elements on mobile
- Disabled hover effects
- Reduced animations
- CSS containment

## 🚀 Build Output

### Development
```
npm run dev
→ Runs on http://localhost:5173
→ Hot module replacement enabled
```

### Production
```
npm run build
→ Creates travellplanner/dist/
→ Optimized and compressed
→ Ready for deployment
```

## 📊 File Sizes (Approximate)

```
Backend:
- server.js: ~2KB
- Total backend code: ~15KB

Frontend:
- Main bundle: ~60KB (gzipped)
- React vendor: ~40KB (gzipped)
- Router: ~15KB (gzipped)
- CSS: ~20KB (gzipped)
- Total: ~135KB (gzipped)
```

## 🎨 Styling Architecture

```
index.css
├── CSS Variables (colors, fonts, spacing)
├── Reset & Base styles
├── Animations (optimized)
├── Layout (app-layout, main-scroll-area)
├── Components
│   ├── Navbar
│   ├── SearchCard
│   ├── Results
│   ├── Sidebar
│   └── Modals
└── Responsive (@media queries)
```

## 🔐 Authentication Flow

```
1. User Registration
   → Send OTP (emailService.js)
   → Verify OTP
   → Create User (User.js model)
   → Generate JWT
   → Return token

2. User Login
   → Verify credentials
   → Generate JWT
   → Return token

3. Protected Routes
   → authMiddleware.js validates JWT
   → Allows/denies access
```

## 📈 Performance Features

- ✅ Code splitting (React.lazy)
- ✅ Lazy loading (components)
- ✅ Gzip/Brotli compression
- ✅ CSS containment
- ✅ Optimized animations
- ✅ Reduced bundle size
- ✅ Critical CSS inline
- ✅ Loading skeleton

## 🎯 API Endpoints

```
Backend (server/):

Auth Routes:
POST /api/auth/register      # Register new user
POST /api/auth/login         # Login user
POST /api/auth/send-otp      # Send OTP email

Plan Routes:
POST /api/plan               # Generate travel plan
GET  /api/history            # Get user history
POST /api/history/save       # Save travel plan
PATCH /api/history/:id       # Update history item
DELETE /api/history/:id      # Delete history item
GET  /api/health             # Health check
```

---

**Last Updated:** After environment consolidation
**Total Files:** ~50 (excluding node_modules)
**Total Size:** ~150KB (production build, gzipped)
