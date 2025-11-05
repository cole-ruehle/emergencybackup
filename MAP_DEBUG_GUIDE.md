# 🗺️ Map Route Display Debug Guide

## Issue: Routes not showing line segments on Google Maps

---

## **Quick Fix Steps**

### **1. Check Browser Console**

Open browser console (Press `F12` or `Cmd+Option+J`)

After planning a route, look for these log messages:

```
🗺️ Rendering route: {...}
Route segments: [...]
Route waypoints: [...]
📍 Drawing segments...
```

### **2. What to Look For**

#### **Good Output (Lines Should Display):**
```javascript
Route segments: [
  {
    mode: "transit",
    instructions: "Take Red Line...",
    waypoints: [
      { lat: 42.36, lng: -71.05 },
      { lat: 42.37, lng: -71.06 },
      ...
    ]
  }
]
```

#### **Problem Output (No Lines):**
```javascript
Route segments: [
  {
    mode: "transit",
    instructions: "Take Red Line...",
    // ❌ No waypoints array!
  }
]
```

---

## **What I Just Fixed**

### **Added Fallback Rendering:**

The map component now has **3 levels of fallback**:

1. **Best Case**: Draw detailed polylines from segment waypoints
2. **Fallback 1**: If no segment waypoints, draw simple line: origin → waypoints → destination
3. **Fallback 2**: If no segments at all, draw basic line from origin to destination

So even if your backend doesn't provide detailed waypoints, **you'll still see a line on the map**!

---

## **How to Debug**

### **Step 1: Plan a Route**
1. Login to app
2. Fill in route form
3. Click "Plan Route"

### **Step 2: Open Console & Check Logs**

Look for this output:

```javascript
🗺️ Rendering route: { route_id: "...", origin: {...}, destination: {...} }

Route segments: [
  { mode: "transit", instructions: "...", ... }
]

Route waypoints: [ { lat: 42.36, lng: -71.05 }, ... ]

📍 Drawing segments...
Segment 0: { mode: "transit", ... }
```

### **Step 3: Identify the Issue**

#### **Case A: Segments Have No Waypoints**
```javascript
⚠️ Segment 0 has no waypoints array - skipping polyline
⚠️ No segment waypoints found - drawing simple line from origin to destination
✅ Fallback line drawn
Total polylines drawn: 1
```

**Solution**: This is now handled automatically! You should see a blue line from start to finish.

#### **Case B: No Segments at All**
```javascript
⚠️ No segments in route - drawing simple line
✅ Simple line drawn
Total polylines drawn: 1
```

**Solution**: Also handled! You should see a line.

#### **Case C: Backend Not Returning Expected Format**
```javascript
🗺️ Rendering route: undefined
```

**Problem**: Route data isn't making it to the map component.

**Solution**: Check the backend response format.

---

## **Backend Expected Format**

Your backend should return routes in this format:

```javascript
{
  "route": {
    "route_id": "route-abc123",
    "name": "Route Name",
    
    // Required for markers
    "origin": {
      "lat": 42.3601,
      "lng": -71.0589
    },
    "destination": {
      "lat": 42.2114,
      "lng": -71.1089
    },
    
    // Optional: Intermediate waypoints
    "waypoints": [
      {
        "lat": 42.3000,
        "lng": -71.0700,
        "name": "Transfer Point"
      }
    ],
    
    // Required for line segments
    "segments": [
      {
        "mode": "transit",
        "instructions": "Take Red Line to Alewife",
        "distance": 5.2,
        "duration": 15,
        
        // CRITICAL: Array of lat/lng points for the path
        "waypoints": [
          { "lat": 42.3601, "lng": -71.0589 },
          { "lat": 42.3650, "lng": -71.0600 },
          { "lat": 42.3700, "lng": -71.0650 },
          // ... more points for smooth curve
        ]
      }
    ]
  }
}
```

### **Key Points:**

1. **`origin` and `destination`** must have `lat` and `lng`
2. **`segments`** is an array of route segments
3. **Each segment should have a `waypoints` array** with coordinates
4. If segments don't have waypoints, the fallback will draw a straight line

---

## **Testing Without Backend**

To test the map component independently, you can manually set a route:

### **Open Browser Console and Run:**

```javascript
// Get the app store
const appStore = window.__VUE_APP__.config.globalProperties.$pinia.state.value.app

// Set a test route
appStore.currentRoute = {
  route_id: "test-route",
  name: "Test Route",
  origin: { lat: 42.3601, lng: -71.0589 },
  destination: { lat: 42.2114, lng: -71.1089 },
  waypoints: [
    { lat: 42.3000, lng: -71.0700, name: "Midpoint" }
  ],
  segments: [
    {
      mode: "transit",
      instructions: "Test segment",
      waypoints: [
        { lat: 42.3601, lng: -71.0589 },
        { lat: 42.3500, lng: -71.0650 },
        { lat: 42.3400, lng: -71.0700 }
      ]
    },
    {
      mode: "hiking",
      instructions: "Hike segment",
      waypoints: [
        { lat: 42.3400, lng: -71.0700 },
        { lat: 42.3000, lng: -71.0850 },
        { lat: 42.2114, lng: -71.1089 }
      ]
    }
  ]
}
```

This should draw a route with 2 colored segments!

---

## **Common Issues & Fixes**

### **Issue 1: "Route loads but no line appears"**

**Check Console For:**
```javascript
Total polylines drawn: 0  // ❌ Bad
```

**Fix:**
- Backend needs to return `segments` with `waypoints` arrays
- OR use the fallback (now automatic)

### **Issue 2: "Markers appear but no line"**

**Means:**
- Route origin/destination are correct
- But segment waypoints are missing

**What Happens Now:**
- Fallback draws a simple line from origin to destination
- You should see a blue line connecting the markers

### **Issue 3: "Nothing appears at all"**

**Check:**
1. Google Maps API loaded? Look for "Google Maps API loaded" in console
2. Route data exists? Look for "Rendering route" message
3. Any JavaScript errors? Check console for red errors

---

## **Next Steps**

### **If You See Fallback Line (Blue straight line):**

Your frontend is working! The backend just needs to provide detailed waypoints:

**Backend should:**
1. Call Google Directions API for each segment
2. Extract the `polyline` or `steps` from the response
3. Decode polyline into lat/lng coordinates
4. Return as `waypoints` array in each segment

**Example backend code (pseudo):**
```python
# In your route planner
directions_response = google_directions_api.get_directions(origin, destination)

for step in directions_response.routes[0].legs[0].steps:
    segment = {
        "mode": step.travel_mode.lower(),
        "instructions": step.html_instructions,
        "duration": step.duration.value / 60,
        "distance": step.distance.value / 1000,
        "waypoints": decode_polyline(step.polyline.points)  # Decode to lat/lng
    }
    segments.append(segment)
```

### **If You See Colored Segments:**

Perfect! Everything is working correctly.

### **If You See Nothing:**

1. Check backend is returning route data
2. Check browser console for errors
3. Verify Google Maps API key is set correctly

---

## **Helpful Console Commands**

### **Check if route data exists:**
```javascript
console.log(window.__VUE_APP__.config.globalProperties.$pinia.state.value.app.currentRoute)
```

### **Force map to render:**
```javascript
// After setting a test route (see above)
window.dispatchEvent(new Event('resize'))
```

### **Check Google Maps loaded:**
```javascript
console.log('Google Maps loaded:', !!window.google)
```

---

## **Summary**

✅ **What's Fixed:**
- Added comprehensive logging
- Added fallback to draw simple lines if detailed waypoints missing
- Added defensive checks to prevent errors

✅ **What You Should See Now:**
- At minimum: A line from origin to destination
- Ideally: Colored segments following the actual route

✅ **What to Check:**
1. Open browser console (F12)
2. Plan a route
3. Look for the log messages
4. You should see at least one polyline drawn

---

**Still having issues?**

Share the console output when you plan a route and I can help debug further!

