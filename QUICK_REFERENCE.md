# Quick Reference Card

## 📍 URLs

- **Local:** http://localhost:5173
- **Production:** https://travel-plane-maker.vercel.app
- **API Local:** http://localhost:3001/api
- **API Production:** https://travel-plane-maker.vercel.app/api

## 📁 Environment Files

```
server/.env              → All server config
travellplanner/.env      → All frontend config
```

## 🔧 Switch Development/Production

Edit `travellplanner/.env`:

**Development Mode:**
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_URL=http://localhost:5173
```

**Production Mode:**
```env
VITE_API_URL=https://travel-plane-maker.vercel.app/api
VITE_APP_URL=https://travel-plane-maker.vercel.app
```

## 🚀 Commands

### Development
```bash
# Backend
cd server && npm start

# Frontend
cd travellplanner && npm run dev
```

### Production Build
```bash
cd travellplanner
npm run build
npm run preview
```

### Deploy
```bash
# Backend
cd server && vercel --prod

# Frontend
cd travellplanner && vercel --prod
```

## 🔑 Required Environment Variables

### Server (.env)
- `PORT` - Server port (3001)
- `MONGO_URI` - MongoDB connection
- `JWT_SECRET` - Secret key
- `EMAIL_USER` - Email for OTP
- `EMAIL_PASS` - Email password
- `GEMINI_API_KEY` - AI API key
- `FRONTEND_URL_DEV` - Dev frontend URL
- `FRONTEND_URL` - Prod frontend URL

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_APP_URL` - Frontend URL

## 🧪 Testing

### Lighthouse
1. F12 → Lighthouse
2. Mobile + Performance
3. Analyze

**Target:** 85+ score

### API Health Check
```bash
curl http://localhost:3001/api/health
curl https://travel-plane-maker.vercel.app/api/health
```

## 🐛 Quick Fixes

### API calls fail
```javascript
// Check in browser console:
console.log(import.meta.env.VITE_API_URL)
```

### CORS error
Check `server/.env` has correct `FRONTEND_URL`

### Build fails
```bash
rm -rf node_modules
npm install
npm run build
```

## 📚 Documentation

- **README.md** - Project overview
- **SETUP.md** - Setup instructions
- **CHANGES_SUMMARY.md** - What changed
- **QUICK_REFERENCE.md** - This file

## 🎯 Performance Targets

- **Lighthouse:** 85-95
- **LCP:** < 2.5s
- **FCP:** < 1.8s
- **Bundle:** ~115KB gzipped

## 📱 Mobile Features

- Fixed bottom input
- Modal date picker
- Touch-optimized
- Fast on 3G

## ✅ Checklist

### Before Development
- [ ] Install dependencies
- [ ] Configure .env files
- [ ] Start backend
- [ ] Start frontend
- [ ] Test features

### Before Deployment
- [ ] Update .env to production mode
- [ ] Build: `npm run build`
- [ ] Test: `npm run preview`
- [ ] Deploy backend first
- [ ] Deploy frontend
- [ ] Set Vercel env variables
- [ ] Test production

## 🎉 That's It!

Everything you need on one page.

---

**Need more details?** Check README.md or SETUP.md
