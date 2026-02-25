# Quick Setup Guide

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB account (or local MongoDB)
- Google Gemini API key (free at https://aistudio.google.com/app/apikey)
- Email account for OTP (Gmail recommended)

## 🚀 Setup Steps

### 1. Clone & Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../travellplanner
npm install
```

### 2. Configure Backend

Edit `server/.env`:

```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL_DEV=http://localhost:5173
FRONTEND_URL=https://travel-plane-maker.vercel.app
```

**Get Email App Password (Gmail):**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Use this password in `EMAIL_PASS`

### 3. Configure Frontend

Edit `travellplanner/.env`:

**For Development:**
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_URL=http://localhost:5173
```

**For Production:**
```env
VITE_API_URL=https://travel-plane-maker.vercel.app/api
VITE_APP_URL=https://travel-plane-maker.vercel.app
```

### 4. Run Development

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd travellplanner
npm run dev
```

Visit: http://localhost:5173

### 5. Test Features

1. ✅ Search for a destination
2. ✅ Register new account
3. ✅ Verify OTP email received
4. ✅ Login
5. ✅ Save travel plans
6. ✅ View history

## 🚀 Deploy to Production

### 1. Deploy Backend

```bash
cd server
vercel --prod
```

Copy the deployed URL (e.g., `https://your-backend.vercel.app`)

### 2. Update Frontend Config

Edit `travellplanner/.env`:
```env
VITE_API_URL=https://your-backend.vercel.app/api
VITE_APP_URL=https://travel-plane-maker.vercel.app
```

### 3. Deploy Frontend

```bash
cd travellplanner
npm run build
vercel --prod
```

### 4. Set Vercel Environment Variables

**Backend (Vercel Dashboard):**
- Add all variables from `server/.env`

**Frontend (Vercel Dashboard):**
- `VITE_API_URL`
- `VITE_APP_URL`

## ✅ Verification

### Check Backend
```bash
curl https://your-backend.vercel.app/api/health
# Should return: {"status":"ok","database":"connected"}
```

### Check Frontend
1. Visit your deployed URL
2. Open DevTools → Console
3. Should see no errors
4. Test search functionality

## 🐛 Common Issues

### Issue: MongoDB connection fails
**Solution:** Check `MONGO_URI` format:
```
mongodb+srv://username:password@cluster.mongodb.net/database
```

### Issue: OTP email not received
**Solution:** 
1. Check `EMAIL_USER` and `EMAIL_PASS`
2. Enable "Less secure app access" or use App Password
3. Check spam folder

### Issue: CORS error
**Solution:** 
1. Check `FRONTEND_URL` in server `.env`
2. Verify backend CORS configuration
3. Ensure frontend URL matches exactly

### Issue: API calls go to localhost in production
**Solution:**
1. Edit `travellplanner/.env`
2. Use production URLs
3. Rebuild: `npm run build`
4. Redeploy: `vercel --prod`

## 📱 Mobile Testing

1. Build production: `npm run build`
2. Preview: `npm run preview`
3. Open on mobile device using local IP
4. Test input is compact at bottom
5. Test date picker modal

## 🎯 Performance Check

Run Lighthouse:
1. Open Chrome DevTools (F12)
2. Lighthouse tab
3. Mobile + Performance
4. Analyze

Target scores:
- Performance: 85+
- LCP: < 2.5s
- FCP: < 1.8s

## 🎉 Done!

Your travel planner is now ready!

**Local:** http://localhost:5173
**Production:** https://travel-plane-maker.vercel.app

---

**Need Help?** Check README.md for more details.
