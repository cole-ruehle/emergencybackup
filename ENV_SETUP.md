# 🔑 Environment Variables Setup

**Required for:** Google Maps integration

---

## **Quick Setup (30 seconds)**

### **1. Create `.env.local` file**

In your project root, create a file named `.env.local`:

```bash
cd "/Users/Cole-School/Desktop/MIT/Classes 2025/emergencybackup"
touch .env.local
```

### **2. Add your Google Maps API Key**

Open `.env.local` and add:

```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

Replace `YOUR_ACTUAL_API_KEY_HERE` with your actual Google Maps API key.

### **3. Restart dev server**

```bash
# Stop current server (Ctrl+C)
# Start again
npm run dev
```

**Done!** ✅

---

## **Getting a Google Maps API Key**

If you don't have a Google Maps API key yet:

### **Step 1: Go to Google Cloud Console**
Visit: https://console.cloud.google.com/

### **Step 2: Create/Select a Project**
1. Click project dropdown (top left)
2. Click "New Project"
3. Name it: "TrailLink" (or anything you want)
4. Click "Create"

### **Step 3: Enable Required APIs**

Click "APIs & Services" → "Enable APIs and Services"

Enable these APIs:
- ✅ **Maps JavaScript API** (required for map display)
- ✅ **Directions API** (required for route planning)
- ✅ **Places API** (required for location search)
- ✅ **Geocoding API** (required for address conversion)
- ⭐ **Elevation API** (optional - for elevation profiles)

### **Step 4: Create API Key**

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy your API key
4. Click "Restrict Key" (recommended for security)

### **Step 5: Restrict Your API Key (IMPORTANT!)**

For security, restrict your API key:

**Application Restrictions:**
- Select "HTTP referrers"
- Add: `http://localhost:5173/*` (for development)
- Add: `https://yourdomain.com/*` (for production)

**API Restrictions:**
- Select "Restrict key"
- Choose only the APIs you enabled above

Click "Save"

---

## **Complete `.env.local` Template**

Here's a complete template with all available options:

```env
# ============================================================================
# REQUIRED: Google Maps API Key
# ============================================================================
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz

# ============================================================================
# OPTIONAL: Backend Configuration
# ============================================================================
# Override default backend URL (default: http://localhost:8000/api)
# VITE_API_BASE_URL=http://localhost:8000/api

# Use production backend
# VITE_API_BASE_URL=https://api.traillink.com/api

# ============================================================================
# OPTIONAL: Development Settings
# ============================================================================
# Enable debug logging in console
# VITE_DEBUG=true

# Mock backend responses (test without backend)
# VITE_MOCK_BACKEND=false

# Default map center (if geolocation fails)
# VITE_DEFAULT_LAT=42.3601
# VITE_DEFAULT_LNG=-71.0589

# ============================================================================
# OPTIONAL: Feature Flags
# ============================================================================
# Enable/disable features for testing
# VITE_ENABLE_LIVE_HIKING=true
# VITE_ENABLE_NEARBY_HIKERS=true
# VITE_ENABLE_COMMUNITY_FEED=true
```

---

## **Verify It's Working**

### **1. Check Console**

Open browser console (F12) and look for:
```
Google Maps API loaded
```

### **2. Test the Map**

1. Login to your app
2. Plan a route
3. Map should display route

### **3. Check for Errors**

If you see errors like:
```
Failed to load Google Maps API
InvalidKeyMapError
```

**Fix:**
- Double-check your API key in `.env.local`
- Make sure APIs are enabled in Google Cloud Console
- Restart dev server after changing `.env.local`

---

## **Environment Variable Usage in Code**

If you want to add more environment variables:

### **In Vue Components:**
```javascript
// Access environment variables
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const backendUrl = import.meta.env.VITE_API_BASE_URL
const isDebug = import.meta.env.VITE_DEBUG === 'true'

console.log('API Key exists:', !!apiKey)
```

### **In JavaScript Files:**
```javascript
// Same syntax works in .js files
const config = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  backendUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
}
```

### **Rules:**
- ✅ Prefix with `VITE_` to expose to frontend
- ✅ Use `import.meta.env` (not `process.env`)
- ✅ Restart dev server after changes
- ❌ Never commit `.env.local` (it's gitignored)
- ✅ Commit `.env.example` (template without secrets)

---

## **Git Configuration**

### **Already Gitignored (Default):**
```gitignore
# Vite automatically ignores these:
.env.local
.env.*.local
```

### **Should Commit:**
```gitignore
.env.example  ✅ (template with no secrets)
```

### **Never Commit:**
```gitignore
.env.local    ❌ (contains your actual API key)
.env          ❌ (might contain secrets)
```

---

## **Production Deployment**

When deploying to production (Vercel, Netlify, etc.):

### **Don't use `.env.local`**

Instead, set environment variables in your hosting platform:

**Vercel:**
1. Go to project settings
2. Environment Variables
3. Add: `VITE_GOOGLE_MAPS_API_KEY` = your production key
4. Deploy

**Netlify:**
1. Site settings → Environment
2. Add: `VITE_GOOGLE_MAPS_API_KEY` = your production key
3. Deploy

**Other platforms:**
- Look for "Environment Variables" or "Config Vars"
- Add `VITE_GOOGLE_MAPS_API_KEY`
- Redeploy

---

## **Troubleshooting**

### **Problem: "Google Maps API not loaded"**

**Solutions:**
1. Check `.env.local` exists in project root
2. Check variable name is exactly: `VITE_GOOGLE_MAPS_API_KEY`
3. Restart dev server: `Ctrl+C` then `npm run dev`
4. Check no quotes around API key in `.env.local`

### **Problem: "This page can't load Google Maps correctly"**

**Solutions:**
1. Check API key is valid in Google Cloud Console
2. Check APIs are enabled (see Step 3 above)
3. Check billing is enabled (Google requires it)
4. Check API restrictions aren't blocking localhost

### **Problem: "API key not found"**

**Solutions:**
1. File must be named `.env.local` (not `.env`)
2. Must be in project root (not in `src/`)
3. Must prefix with `VITE_` (not `VUE_APP_` or `REACT_APP_`)
4. Restart dev server after creating file

### **Problem: "RefererNotAllowedMapError"**

**Solution:**
- Add `http://localhost:5173/*` to API restrictions
- Or remove restrictions during development

---

## **Cost Warning** ⚠️

Google Maps API has a **$200/month free tier**, which is usually enough for development.

**To avoid charges:**
1. Set up billing alerts in Google Cloud Console
2. Set daily quotas on APIs
3. Never share your API key publicly
4. Use API restrictions

**Typical costs for TrailLink:**
- Development: ~$0/month (within free tier)
- Light usage: ~$0-10/month
- Heavy usage: $10-50/month

---

## **Security Best Practices** 🔒

### **✅ DO:**
- Use `.env.local` for development
- Use API restrictions (HTTP referrer)
- Set up billing alerts
- Use environment variables in hosting platforms
- Commit `.env.example` (without secrets)

### **❌ DON'T:**
- Never commit `.env.local` or `.env`
- Never share API keys in code
- Never push API keys to GitHub
- Never use API keys in client-side code without restrictions

---

## **Quick Reference**

**File to create:** `.env.local`

**Required variable:**
```env
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

**Where to get key:** https://console.cloud.google.com/

**After creating file:**
```bash
npm run dev
```

**That's it!** ✅

---

**Need Help?**
- Check Google Cloud Console for API errors
- Look at browser console (F12) for error messages
- Make sure billing is enabled on Google Cloud
- Restart dev server after any `.env.local` changes

