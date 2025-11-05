# TrailLink v2.0 - Quick Start Guide

## 🚀 Running the App

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## 🔐 First Time Setup

1. **App loads** → Login modal appears after 1 second
2. **Click "Sign Up"** → Create your account
3. **Auto-logged in** → You're ready to go!

## 📍 Planning Your First Route

1. **Fill in the form:**
   - Starting Point: "Boston, MA"
   - Home Base: "Cambridge, MA"
   - Destination: "Middlesex Fells"
   - Leave other settings as default

2. **Click "Plan Route"**
   - Route planning requires authentication (you're logged in automatically)
   - Wait for LLM to generate route
   - Route appears on map with segments

## 🥾 Starting a Live Hike

1. **After route is planned** → LiveHikingMode component appears
2. **Check the box** → "Share my live location during this hike" (optional)
3. **Click "Start Hike"**
   - Timer begins counting (HH:MM:SS)
   - Live indicator turns red and pulses
   - If location sharing enabled → NearbyHikers component appears

## 👥 Finding Nearby Hikers

**Automatic when:**
- You're in an active hike
- Location sharing is enabled
- Component auto-refreshes every 30 seconds
- Shows hikers within 5km radius

**Hiker cards show:**
- Avatar (first letter of name)
- Display name
- Experience level (Beginner/Intermediate/Advanced/Expert)
- Distance to hiker

## 🌐 Exploring Community

**Always visible (no login required for public data)**

**Recent Activities:**
- Shows recent hikes within 50km of your location
- Activity types: completed hikes, saved routes, etc.
- Click "Load More" for older activities

**Popular Routes:**
- Toggle time windows: Today / This Week / This Month / This Year
- Shows trending routes with hike counts
- Ranked by popularity

## 🚨 Emergency Exit

**During an active hike:**
1. Click "🚨 Emergency Exit" button
2. App automatically plans fastest route home
3. Uses current location + home address from profile

## ⏸️ Ending a Hike

1. **Click "End Hike"** button
2. Timer stops
3. Location sharing automatically disabled
4. (TODO: Hike stats recorded to backend)

## 🔄 Logging Out

1. **Click hamburger menu** (☰) in top right
2. **Click "Sign Out"**
3. Session cleared, routes cleared
4. Login modal reappears

## 📱 Mobile Support

**Fully responsive!**
- All components work on mobile
- Touch-friendly buttons
- Responsive layouts
- Hamburger menu for navigation

## 🛠️ Backend Requirements

**Must be running on `http://localhost:8000`**

**Required Endpoints:**
- `POST /api/user/register` - Create account
- `POST /api/user/login` - Login
- `POST /api/user/authenticate` - Validate session
- `POST /api/llmRoutePlanner/planRoute` - Plan routes (requires sessionToken)
- `POST /api/profile/setVisibility` - Toggle location sharing
- `POST /api/profile/getNearbyActiveHikers` - Find nearby hikers
- `POST /api/userHistory/getPublicFeed` - Community activities
- `POST /api/userHistory/getPopularRoutes` - Trending routes

## ⚡ Quick Tips

### **Session Persistence**
- Stay logged in for 7 days
- Auto-login on page refresh
- No need to re-enter credentials

### **Location Sharing**
- Defaults to OFF for privacy
- Explicit opt-in required
- Clear "LIVE" indicator when active
- Can toggle mid-hike

### **Rate Limits**
- Route planning: 10 requests per hour
- Be mindful when testing
- (TODO: Add rate limit indicator)

### **Privacy**
- Location only shared when explicitly enabled
- Can stop sharing anytime
- Emergency exit always available
- Profile visibility controlled in settings (TODO: UI)

## 🐛 Troubleshooting

### **"Authentication required" error**
- **Fix**: Login modal should appear automatically
- Manually: Click hamburger menu → Sign In

### **Route planning fails**
- **Check**: Backend is running on port 8000
- **Check**: You're logged in (top right shows username)
- **Check**: Haven't hit rate limit (10/hour)

### **No nearby hikers showing**
- **Check**: You've started a hike
- **Check**: Location sharing is enabled
- **Check**: There are other hikers within 5km (may be empty in dev)

### **Community feed empty**
- **Normal**: May be no public activities yet
- **Check**: Backend is returning data
- **Try**: Change location or time window

### **Login modal keeps appearing**
- **Fix**: Clear localStorage and register new account
- **Or**: Check backend user/login endpoint is working

## 📝 Testing Accounts

**Create test accounts with:**
```
Username: testuser1
Password: password123
Email: test1@example.com
```

```
Username: testuser2
Password: password123
Email: test2@example.com
```

**Then:**
- Login as user1 → Start hike with location sharing
- Login as user2 → Start hike with location sharing
- Should see each other in nearby hikers (if within 5km)

## 🎨 UI Components

### **Key Components:**
- **AuthModal** - Login/Register popup
- **LiveHikingMode** - Start/End hike controls
- **NearbyHikers** - Show active hikers nearby
- **CommunityFeed** - Public activities and popular routes
- **RouteInputs** - Plan routes
- **ActionButtons** - Quick modifications
- **GoogleMap** - Route visualization

### **All Require Auth:**
- ✅ RouteInputs (can't plan without login)
- ✅ ActionButtons (can't modify without login)
- ✅ LiveHikingMode (only shown when authenticated)

### **Location Sharing Required:**
- ✅ NearbyHikers (only shown when sharing)

### **Always Visible:**
- ✅ CommunityFeed (public data)
- ✅ GoogleMap (if route exists)

## 📚 Further Reading

- **Implementation Summary**: See `IMPLEMENTATION_SUMMARY.md`
- **API Specification**: See your provided spec document
- **User Flow**: See `USER_FLOW.md`
- **Visual Design**: See `VISUAL_DESIGN_STUDY.md`

---

## 🎉 You're Ready!

Start the dev server and explore the new features:
- Authentication system
- Live hiking mode
- Social discovery (nearby hikers)
- Community feed

**Enjoy your hikes!** 🥾🏔️

---

**Need Help?**
- Check `IMPLEMENTATION_SUMMARY.md` for technical details
- Review API spec for backend requirements
- Check browser console for errors

