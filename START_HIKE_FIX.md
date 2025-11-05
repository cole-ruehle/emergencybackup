# ✅ **Start Hike Error - FIXED**

## **The Problem**

When clicking "Start Hike", you got this error:
```
[Requesting] Error processing request: Missing binding: Symbol(showLiveLocation)
```

## **Root Cause**

The backend's `/profile/setVisibility` endpoint (using Decal synchronization) requires **ALL four visibility fields** to be sent together:

1. `showLiveLocation` ✅
2. `profileVisibility` ✅
3. `shareStats` ✅
4. `shareHomeLocation` ✅

But we were only sending the one that changed: `{ showLiveLocation: true }`

## **The Fix**

Updated `authStore.js` to **merge** new settings with existing ones before sending:

```javascript
// BEFORE (❌ Only sent changed field)
await api.setVisibility(sessionToken, userId, settings)  
// settings = { showLiveLocation: true }

// AFTER (✅ Send all fields)
const allSettings = {
  ...visibilitySettings.value,  // Get current settings
  ...settings                   // Merge in new setting
}
await api.setVisibility(sessionToken, userId, allSettings)
// allSettings = {
//   showLiveLocation: true,     ← Changed
//   profileVisibility: 'public', ← Existing
//   shareStats: true,            ← Existing
//   shareHomeLocation: false     ← Existing
// }
```

## **How to Verify the Fix**

### **1. Restart Dev Server**

The fix is already applied, just restart:

```bash
# Stop server (Ctrl+C)
npm run dev
```

### **2. Test Start Hike**

1. Login to app
2. Plan a route
3. Scroll to "Live Hiking" section
4. Check "Share my live location" ✓
5. Click "Start Hike"

### **3. Check Console**

Open browser console (F12) and you should see:

```javascript
// ✅ Success!
Hike started: { route: {...}, locationSharing: true }
```

**NOT:**
```javascript
// ❌ Error (this should be gone now)
Error processing request: Missing binding: Symbol(showLiveLocation)
```

### **4. Verify Location Sharing is On**

After clicking "Start Hike":
- Live indicator should show "LIVE" in red
- Timer should be counting up
- If you have other test users, they should see you in "Nearby Hikers"

## **What the Fix Does**

### **Before:**
```
User clicks "Start Hike"
  ↓
authStore.startLiveHiking()
  ↓
updateVisibility({ showLiveLocation: true })  ← Only one field!
  ↓
Backend: "Missing binding" error ❌
```

### **After:**
```
User clicks "Start Hike"
  ↓
authStore.startLiveHiking()
  ↓
updateVisibility({ showLiveLocation: true })
  ↓
Merge with existing settings:
{
  showLiveLocation: true,      ← New value
  profileVisibility: 'public', ← Keep existing
  shareStats: true,            ← Keep existing
  shareHomeLocation: false     ← Keep existing
}
  ↓
Send all four fields to backend ✅
  ↓
Backend: Success!
```

## **Why This Happens**

Your backend uses **Decal's synchronization system** which requires all fields in a synchronized object to be present when updating. This is a common pattern in distributed systems to prevent partial updates.

### **Similar in Other Backends:**
- **GraphQL mutations** - often require all fields
- **REST PATCH** - sometimes requires full object
- **Database ORMs** - may need all columns in update

## **Other Places This Might Affect**

This fix applies to **all visibility updates**:

✅ **Start Live Hiking** - Now fixed!
✅ **Stop Live Hiking** - Also fixed (calls same method)
✅ **Any future visibility toggles** - Will work correctly

## **Testing the Fix**

### **Test Case 1: Start Hike**
```
1. Plan route
2. Click "Start Hike"
Expected: Timer starts, "LIVE" indicator shows
```

### **Test Case 2: Stop Hike**
```
1. After starting hike
2. Click "End Hike"
Expected: Timer stops, "LIVE" indicator goes to "OFFLINE"
```

### **Test Case 3: Toggle Location Mid-Hike**
```
1. During active hike
2. Click "📍 Stop Sharing" button
Expected: Location sharing disabled, nearby hikers disappear
3. Click "📍 Share Location" button
Expected: Location sharing re-enabled
```

## **Backend Requirements**

Make sure your backend's `setVisibility` endpoint expects this format:

```javascript
POST /profile/setVisibility

Body:
{
  "sessionToken": "...",
  "userId": "...",
  "showLiveLocation": true,      // Required
  "profileVisibility": "public",  // Required
  "shareStats": true,             // Required
  "shareHomeLocation": false      // Required
}
```

**All four fields must be present!**

## **If You Still Get Errors**

### **Error: "Missing binding"**

Check that your backend's Profile synchronization includes all four fields:

```typescript
// Backend Profile concept
@sync({
  showLiveLocation: Boolean,     // ✅ Must be defined
  profileVisibility: String,      // ✅ Must be defined
  shareStats: Boolean,            // ✅ Must be defined
  shareHomeLocation: Boolean      // ✅ Must be defined
})
class Profile {
  // ...
}
```

### **Error: "Invalid profile visibility"**

Make sure `profileVisibility` is one of: `"public"`, `"hikers-only"`, `"private"`

### **Error: "Profile not found"**

User profile wasn't created on registration. Check backend logs.

## **Success Indicators**

After the fix, you should see:

✅ No console errors when clicking "Start Hike"
✅ Timer starts counting
✅ "LIVE" indicator shows in red
✅ Nearby hikers component appears (if location sharing enabled)
✅ Can end hike without errors
✅ Activity recorded when hike ends

## **Summary**

**Problem:** Backend required all visibility fields, we only sent one
**Solution:** Merge with existing settings before sending
**Status:** ✅ Fixed in `authStore.js`
**Action:** Restart dev server and test

---

**You're good to go!** Try starting a hike now. 🚀

