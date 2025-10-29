# TrailLink - LLM-Powered Hiking Route Planning

A Vue.js application that uses Google Maps API and an LLM backend to plan transit-accessible hiking routes for urban hikers. The app combines public transportation with hiking trails to create accessible outdoor experiences.

## 🎯 Overview

TrailLink helps urban hikers discover and plan hiking routes that are accessible via public transportation. The app uses:

1. **Google Maps API** for route planning, directions, and map visualization
2. **LLM Backend** to understand natural language queries and orchestrate complex route modifications
3. **Clean, Professional UI** inspired by Squarespace and Audi design principles

### Key Features
- Plan hiking routes accessible by public transit
- Natural language route modifications ("Add a scenic stop", "Exit now")
- Real-time Google Maps integration
- Clean, trustworthy interface design
- Context-aware route suggestions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Google Maps API key (required)
- Backend server running on `http://localhost:8000`

### Installation

   ```bash
# Install dependencies
   npm install

# Add your Google Maps API key to index.html
# Replace YOUR_API_KEY with your actual key

# Start development server
   npm run dev
   ```

### Google Maps API Setup (Required)

**You must obtain a Google Maps API key to use this application.**

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable these APIs:
   - Maps JavaScript API
   - Directions API
   - Places API
   - Geocoding API
   - Elevation API
3. Replace `YOUR_API_KEY` in `index.html` with your actual key
4. Restrict the API key to your domain for security

**Note:** The app will not function without a valid Google Maps API key.

## 📚 Documentation

- **[User Flow](USER_FLOW.md)** - Complete user journey and interaction patterns
- **[Visual Design Study](VISUAL_DESIGN_STUDY.md)** - Design philosophy and aesthetic choices
- **[App Demo Video (YouTube)](https://youtu.be/Ajy91kw-1qQ)** — Video demonstration of the application  
  *(Hosted on YouTube because the file was too large for GitHub)*

## 🏗️ Architecture

### State Management (`src/stores/appStore.js`)

The app uses Pinia for state management with the following key data:

```javascript
{
  // User inputs
  origin: "text or lat/lng",
  home: "text or lat/lng", 
  destination: "Middlesex Fells",
  preferences: {
    duration: 3, // hours
    transportModes: ['transit', 'walking'],
    accessibility: false
  },
  
  // Current route data
  currentRoute: {
    routeId: "r_abc123",
    routeName: "Boston to Middlesex Fells",
    segments: [...], // Route segments with mode, duration, etc.
    waypoints: [...], // Transit stops, trailheads
    suggestions: [...] // LLM-generated suggestions
  },
  
  // User location and context
  userLocation: { lat: 42.3601, lng: -71.0589 },
  loading: false,
  error: null
}
```

### API Service (`src/api/api.js`)

Communicates with the LLM backend:

```javascript
// Send route planning request
const result = await api.planRoute(query, userLocation, preferences, currentRoute)

// Expected response format:
{
  "routeId": "r_abc123",
  "routeName": "Boston to Middlesex Fells",
  "segments": [
    {
      "mode": "transit",
      "instructions": "Take Red Line to Alewife",
      "duration": 25,
      "distance": 8.2
    },
    {
      "mode": "hiking", 
      "instructions": "Hike Skyline Trail",
      "duration": 120,
      "distance": 4.5
    }
  ],
  "waypoints": [...],
  "suggestions": ["Consider Wright's Tower for views"]
}
```

### Components

- **`RouteInputs.vue`** - Form for setting origin, destination, preferences
- **`ActionButtons.vue`** - Quick action buttons (Add Scenic Stop, Exit Now, etc.)
- **`GoogleMap.vue`** - Google Maps display with route rendering
- **`LoadingSpinner.vue`** - Simple loading indicator

## 🎮 How to Use

### Basic Route Planning
1. Enter your starting location (or use current location)
2. Set your home location for return trips
3. Enter your hiking destination
4. Configure preferences (duration, transport modes)
5. Click "Plan Route" to generate your route

### Quick Actions
The app supports natural language modifications:
- **"Add a scenic stop"** - Adds a scenic viewpoint to your route
- **"Exit now"** - Finds the fastest way back to your home location
- **"Add food stop"** - Adds a restaurant or food location
- **"Find restrooms"** - Adds a restroom stop to your route

### Map Interaction
- View your complete route with transit and hiking segments
- See waypoints and stops along the way
- Get real-time directions and timing

## 🔧 Backend Integration

### Required Backend Endpoints

```javascript
POST /api/plan-route
Body: { 
  query: "Plan a route to Middlesex Fells",
  userLocation: { lat: 42.3601, lng: -71.0589 },
  preferences: { duration: 3, transportModes: ['transit', 'walking'] },
  currentRoute: { /* existing route context */ }
}
Response: { routeId, routeName, segments, waypoints, suggestions }

GET /api/health
Response: 200 OK
```

### Backend Requirements

The backend must:
1. Accept natural language queries for route planning
2. Use Google Maps API for route calculation
3. Use LLM (like Gemini) to understand and process requests
4. Return structured route data with segments and waypoints
5. Handle route modifications based on current route context

## 🎨 Design Philosophy

The app features a clean, professional design inspired by Squarespace and Audi:

- **Muted color palette** - Professional grays with single blue accent
- **Inter font** - Readable, trustworthy typography
- **8px grid system** - Consistent, rhythmic spacing
- **Minimal interface** - Few buttons, clear hierarchy
- **No AI design tropes** - Avoids rounded corners, heavy shadows, bright gradients
- **Generous white space** - Breathing room for content

See the [Visual Design Study](VISUAL_DESIGN_STUDY.md) for detailed design rationale.

## 📱 Features

### Route Planning
- Plan transit-accessible hiking routes
- Set origin, home, and destination locations
- Configure hiking duration and transport preferences
- Use current location for automatic starting point

### Interactive Map
- Google Maps integration with route visualization
- Color-coded segments (transit, hiking, walking)
- Waypoint markers and route polylines
- Real-time location tracking

### Natural Language Modifications
- "Add a scenic stop" - Adds viewpoints to your route
- "Exit now" - Finds fastest way back to home
- "Add food stop" - Adds restaurants or food locations
- "Find restrooms" - Adds restroom stops
- Context-aware suggestions based on current route

## 🔍 Development

### Project Structure

```
src/
├── api/
│   └── api.js              # Backend communication
├── components/
│   ├── ActionButtons.vue   # Quick action buttons
│   ├── GoogleMap.vue       # Google Maps display
│   ├── LoadingSpinner.vue  # Loading indicator
│   └── RouteInputs.vue     # Input form
├── stores/
│   └── appStore.js         # Pinia state management
├── utils/
│   ├── errorHandler.js     # Error handling utilities
│   ├── formatters.js       # Data formatting functions
│   └── leaflet-config.js   # Map configuration (legacy)
├── App.vue                 # Main app component
└── main.js                 # App entry point
```

### Key Files

- **`src/App.vue`** - Main application layout with route display
- **`src/stores/appStore.js`** - Pinia store for state management
- **`src/api/api.js`** - Backend API communication
- **`src/components/GoogleMap.vue`** - Google Maps integration
- **`src/components/RouteInputs.vue`** - User input form
- **`src/components/ActionButtons.vue`** - Quick action buttons

## 🚨 Error Handling

- Backend connection status indicator
- Error messages for failed API calls
- Graceful fallbacks for missing data
- Loading states for all async operations
- User-friendly error messages

## 🔒 Security Notes

- Google Maps API key should be restricted to your domain
- Backend handles all Google API calls (keys not exposed to frontend)
- Input validation on both frontend and backend
- CORS configuration for local development

## 📋 Getting Started

1. **Get a Google Maps API key** from [Google Cloud Console](https://console.cloud.google.com/)
2. **Add your API key** to `index.html` (replace `YOUR_API_KEY`)
3. **Start your backend** on `http://localhost:8000`
4. **Run the frontend** with `npm run dev`
5. **Test the app** by planning a route to a hiking destination

## 🤝 Backend Integration

This frontend works with an LLM-powered backend that:

1. Accepts natural language queries via `POST /api/plan-route`
2. Uses Google Maps API for route calculation
3. Uses LLM (like Gemini) to understand and process requests
4. Returns structured route data with segments and waypoints
5. Handles route modifications based on current route context

The frontend handles all UI interactions and state management, while the backend handles the complex LLM orchestration and Google Maps API calls.