# Travel Planner - AI-Powered Trip Planning

## 🌐 Live URL
**https://travel-plane-maker.vercel.app**

## 📁 Project Structure

```
├── server/              # Backend (Node.js + Express)
│   ├── .env            # Server environment variables
│   └── server.js       # Main server file
│
└── travellplanner/     # Frontend (React + Vite)
    ├── .env            # Frontend environment variables
    └── src/            # React components
```

**📚 Detailed Structure:**
- See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed breakdown
- See [TREE_STRUCTURE.txt](TREE_STRUCTURE.txt) for visual tree diagram

## ⚙️ Environment Configuration

### Server (.env in server/)
```env
# Server
PORT=3001

# Database
MONGO_URI=your_mongodb_uri

# Authentication
JWT_SECRET=your_secret_key

# Email (for OTP)
EMAIL_USER=your_email
EMAIL_PASS=your_email_password

# AI APIs
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key

# CORS
FRONTEND_URL_DEV=http://localhost:5173
FRONTEND_URL=https://travel-plane-maker.vercel.app
```

### Frontend (.env in travellplanner/)
```env
# For local development - uncomment these:
# VITE_API_URL=http://localhost:3001/api
# VITE_APP_URL=http://localhost:5173

# For production - use these (default):
VITE_API_URL=https://travel-plane-maker.vercel.app/api
VITE_APP_URL=https://travel-plane-maker.vercel.app
```

## 🚀 Quick Start

### Backend
```bash
cd server
npm install
npm start
```

### Frontend
```bash
cd travellplanner
npm install
npm run dev      # Development
npm run build    # Production build
npm run preview  # Preview production build
```

## 📱 Features

- ✅ AI-powered trip planning
- ✅ User authentication with OTP
- ✅ Travel history management
- ✅ Mobile-optimized interface
- ✅ High performance (Lighthouse 85+)

## 🎯 Performance

- **Lighthouse Score:** 85-95
- **LCP:** < 2.5s
- **FCP:** < 1.8s
- **Bundle Size:** ~115KB gzipped

## 🔧 Development vs Production

### Development Mode
Edit `travellplanner/.env`:
```env
# Uncomment these lines:
VITE_API_URL=http://localhost:3001/api
VITE_APP_URL=http://localhost:5173

# Comment these lines:
# VITE_API_URL=https://travel-plane-maker.vercel.app/api
# VITE_APP_URL=https://travel-plane-maker.vercel.app
```

### Production Mode
Edit `travellplanner/.env`:
```env
# Comment these lines:
# VITE_API_URL=http://localhost:3001/api
# VITE_APP_URL=http://localhost:5173

# Uncomment these lines:
VITE_API_URL=https://travel-plane-maker.vercel.app/api
VITE_APP_URL=https://travel-plane-maker.vercel.app
```

## 🚀 Deployment

### Deploy to Vercel

**Backend:**
```bash
cd server
vercel --prod
```

**Frontend:**
```bash
cd travellplanner
npm run build
vercel --prod
```

### Environment Variables in Vercel

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

**Backend:**
- All variables from `server/.env`

**Frontend:**
- `VITE_API_URL`
- `VITE_APP_URL`

## 🧪 Testing

### Run Lighthouse
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select Mobile + Performance
4. Click "Analyze page load"

### Expected Scores
- Performance: 85-95
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

## 🔐 Security

- ✅ HTTPS enforced
- ✅ CORS properly configured
- ✅ Environment variables secured
- ✅ JWT authentication
- ✅ OTP verification

## 📱 Mobile Features

- Fixed bottom input (ChatGPT/Gemini style)
- Modal date picker
- Touch-optimized
- Fast loading on 3G

## 🐛 Troubleshooting

### API calls fail
Check that:
1. Backend is running
2. `.env` files are configured correctly
3. CORS allows your frontend URL

### Environment variables not working
1. Check `.env` file exists
2. Restart dev server
3. For production: rebuild and redeploy

## 📚 Tech Stack

**Frontend:**
- React 19
- Vite
- React Router
- Tailwind CSS

**Backend:**
- Node.js
- Express
- MongoDB
- JWT
- Nodemailer

**AI:**
- Google Gemini API
- OpenAI API (optional)

## 📄 License

MIT

---

**Need Help?** Check the `.env` files for configuration instructions.
