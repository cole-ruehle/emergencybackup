
# How My Design Evolved: A Personal Journey Through TrailLink

Looking back at this project, I realize how much my understanding of concept design has changed. This document tells the story of how TrailLink evolved from my initial, overly ambitious design in Assignment 2 to what it is now—a much simpler, more focused system that actually works.

---

## Repository Configuration

**Backend Repository Base URL:** `https://github.com/cole-ruehle/concept_backend`

---

## Table of Contents

- [How My Design Evolved: A Personal Journey Through TrailLink](#how-my-design-evolved-a-personal-journey-through-traillink)
  - [Repository Configuration](#repository-configuration)
  - [Table of Contents](#table-of-contents)
  - [Where I Started](#where-i-started)
  - [The Concepts I Abandoned (And Why)](#the-concepts-i-abandoned-and-why)
    - [What I Originally Built](#what-i-originally-built)
    - [The Concepts I Deprecated](#the-concepts-i-deprecated)
    - [What I Have Now](#what-i-have-now)
    - [Why I Made This Dramatic Change](#why-i-made-this-dramatic-change)
  - [What Changed Since Assignment 2](#what-changed-since-assignment-2)
  - [Improvements I Made After Assignment 4B](#improvements-i-made-after-assignment-4b)
  - [My Core Design Philosophy](#my-core-design-philosophy)
  - [The Big Architectural Decisions I Made](#the-big-architectural-decisions-i-made)
  - [Before and After: A Comparison](#before-and-after-a-comparison)
  - [Why I Made These Changes](#why-i-made-these-changes)
  - [My Final Concept Specifications](#my-final-concept-specifications)
    - [1. LLMRoutePlanner](#1-llmrouteplanner)
    - [2. User (Authentication)](#2-user-authentication)
    - [3. Profile](#3-profile)
    - [4. UserHistory](#4-userhistory)
  - [Additional Documentation](#additional-documentation)
  - [How to Update Links](#how-to-update-links)

---

## Where I Started

When I first started this project, I was really struggling with concept design. I realize now that I took on way too much in my original specification. My initial concepts were overly complex and unfocused, which made them incredibly difficult to build, test, and integrate when it came time for Assignment 4.

I had to seek guidance during office hours to strengthen my approach, and that's when I started to understand what a "concept" actually means. The most important breakthrough for me was creating the LLM route planner—it was my first solid attempt at a proper concept, and it ended up bringing together so much of my website's functionality in one place.

---

## The Concepts I Abandoned (And Why)

In November 2025, I made a really big decision: I deleted over 2,480 lines of code and threw out 4 specialized routing concepts that I'd been working on. It felt drastic at the time, but it was the right call. I replaced all of them with a single LLM-powered natural language interface that does everything the old system did, but better.

### What I Originally Built

When I started in October 2025, I had this really complicated architecture with four separate routing concepts:

```
October 2025 (My Initial Design)
    ↓
├── ConstraintMonitor          → Eventually deleted
├── DynamicExitPlanner         → Eventually deleted
├── ExternalRoutingEngine      → Eventually deleted  
└── TransitRoutePlanner        → Eventually deleted
    ↓
November 2025 (After I Simplified Everything)
    ↓
├── LLMRoutePlanner           → This replaced all 4 concepts above
├── User                      → For authentication
├── Profile                   → For public profiles
└── UserHistory               → For tracking activities
```

### The Concepts I Deprecated

Looking back at my deprecation log ([DEPRECATED_CONCEPTS.md]({BASE_URL}/blob/main/DEPRECATED_CONCEPTS.md)), I got rid of these four concepts:

| Concept | Purpose | Replacement | Lines Removed |
|---------|---------|-------------|---------------|
| **ConstraintMonitor** | Monitor transit schedules, weather, trail conditions | Google Maps APIs (built-in) | ~280 |
| **DynamicExitPlanner** | Real-time exit strategies during hikes | LLMRoutePlanner (natural language) | ~750 |
| **ExternalRoutingEngine** | Integration with mapping services | Service layer (GoogleMapsClient) | ~950 |
| **TransitRoutePlanner** | Multi-modal route planning | LLMRoutePlanner (natural language) | ~500 |

If you're curious about what these looked like originally, I saved the early specs:
- [ConstraintMonitor Spec]({BASE_URL}/blob/main/design/concepts/HikingApp/ConstraintMonitor.md)
- [DynamicExitPlanner Spec]({BASE_URL}/blob/main/design/concepts/HikingApp/DynamicExitPlanner.md)
- [ExternalRoutingEngine Spec]({BASE_URL}/blob/main/design/concepts/HikingApp/ExternalRoutingEngine.md)
- [TransitRoutePlanner Spec]({BASE_URL}/blob/main/design/concepts/HikingApp/TransitRoutePlanner.md)

I also have development history showing how I iterated on these:
- [Early Implementation Discussions]({BASE_URL}/tree/main/context/design/concepts/HikingApp/implementation.md) - 21 snapshots of me trying to make this work
- [LikertSurvey Concept Development]({BASE_URL}/tree/main/context/design/concepts/LikertSurvey) - Some early experimentation

### What I Have Now

After all that simplification, I ended up with just four core concepts (see [My Final Concept Specifications](#my-final-concept-specifications) below for details):

1. **LLMRoutePlanner** - This is the one I'm most proud of
   - Handles all routing scenarios through natural language
   - Replaces all 4 of my old specialized concepts
   - [Specification]({BASE_URL}/blob/main/design/concepts/HikingApp/LLMRoutePlanner.md)
   - [Implementation]({BASE_URL}/blob/main/src/concepts/LLMRoutePlanner/LLMRoutePlannerConcept.ts)

2. **User** - For authentication and sessions
   - Register, login, logout, session validation
   - [Specification]({BASE_URL}/blob/main/design/concepts/HikingApp/User.md)
   - [Implementation]({BASE_URL}/blob/main/src/concepts/HikingApp/User.ts)

3. **Profile** - For public user information
   - Display name, bio, preferences
   - I learned to keep this separate from authentication
   - [Specification]({BASE_URL}/blob/main/design/concepts/HikingApp/Profile.md)
   - [Implementation]({BASE_URL}/blob/main/src/concepts/HikingApp/Profile.ts)

4. **UserHistory** - For tracking activities
   - Route history, location sharing, popular destinations
   - [Specification]({BASE_URL}/blob/main/design/concepts/HikingApp/UserHistory.md)
   - [Implementation]({BASE_URL}/blob/main/src/concepts/HikingApp/UserHistory.ts)

### Why I Made This Dramatic Change

Looking back at my original design, I can see so many problems:
- It was way too **complex**: 4 different concepts with rigid action signatures and tons of synchronizations between them
- It was **inflexible**: Every time I wanted to add a new routing feature, I had to create new actions, write new tests, and add more syncs
- It was **over-engineered**: I had multiple concepts trying to do what an LLM could orchestrate naturally
- The **UX was poor**: Users had to learn specific commands instead of just saying what they wanted in natural language

The new design is so much better:
- **Simple**: One natural language interface for everything
- **Flexible**: I can add new features just by updating prompts, not changing code
- **User-friendly**: Users can say "Find trails near Boston" instead of filling out rigid API parameters
- **Maintainable**: 2,480 fewer lines of code to maintain and test

Here's a concrete example of how much simpler this became:

```typescript
// ❌ What I had before: Multiple endpoints with rigid parameters
POST /api/transitRoutePlanner/planRoute
{ startLocation, endLocation, transitModes, maxWalkingDistance }

POST /api/dynamicExitPlanner/planExit
{ currentLocation, plannedRoute, urgency }

// ✅ What I have now: One endpoint, just say what you want
POST /api/llmRoutePlanner/planRoute
{ 
  query: "Find hiking trails near Boston accessible by MBTA",
  userLocation: {lat, lng}
}
```

---

## What Changed Since Assignment 2

- **I learned what a concept actually is:**  
  My initial designs were a mess of features that weren't really "concepts" at all. This led to messy dependencies and confusing code structure. Now I have clear boundaries between concepts like routes, users, profiles, and history.

- **I simplified the user flow:**  
  Early on, I was trying to do too much in one step. My final design separates state transitions and makes each action update the current route incrementally, which is much cleaner.

- **I started using context injection instead of global imports:**  
  Instead of importing or sharing state between modules (which got messy fast), I now bundle user actions as context for the LLM, which returns the updated route or response.

- **I made security explicit with session tokens:**  
  All authentication and user actions now require a session token. My earlier approach was really insecure, and I'm glad I fixed this.

---

## Improvements I Made After Assignment 4B

- **I separated Users from Profiles:**  
  I realized that Users (for authentication) should be distinct from user profiles (for public display). This made access control and data flow so much clearer.

- **I added Live Hiking Mode:**  
  Inspired by examples we looked at in class, I integrated a "Live Hiking" mode with user location sharing. The location updates power both real-time displays and historical trail popularity data.

- **I started tracking everything in User History:**  
  Now all hikes and locations are stored, which lets users see their hiking history and helps the app show popular destinations to others.

- **I switched to the request module:**  
  The backend now uses the request module for handling external API calls, which is safer and cleaner. This enforced better separation of concerns.

---

## My Core Design Philosophy

**The "Central Dogma" I Developed:**  
I came up with this idea that the user always has a "current route" (which might be empty at first). Every important user action—starting a route, modifying it, adding a stop, planning an exit, etc.—works the same way:

- It updates the current route, which is the single source of truth in the UI
- It's issued as a discrete, atomic request to the backend/LLM
- The LLM ingests the existing route and user intent, then responds with a new route object and an explanation

**Here's how the flow works:**

```
   [User Action] 
        ↓ 
   [Update Context]  
        ↓ 
  [LLM Query + Google Maps API] 
        ↓ 
[New Route/Steps & Comment] 
        ↓ 
        [Display in UI]
```

---

## The Big Architectural Decisions I Made

- **Keeping concepts granular:**  
  I made sure each major entity (User, Profile, Route, History, LiveSession) is modeled independently. This avoids the blurred boundaries I had in Assignment 2.

- **No more "spaghetti imports":**  
  My earlier attempts had imports everywhere, making everything depend on everything else. Now all information needed for each concept is explicitly injected.

- **Making security a priority:**  
  All backend interactions require session tokens. This closes the security holes my initial prototype had.

- **Decoupling frontend and backend:**  
  Communication always happens through clear, versioned API calls (see my [API service module](src/api/api.js)).

---

## Before and After: A Comparison

Looking at where I started versus where I ended up, the differences are pretty stark:

| Area                | Assignment 2           | Final Design                |
|---------------------|-----------------------|-----------------------------|
| Concept Clarity     | Unclear ownership, concepts mixed together | Strong separation of User, Profile, History, Route |
| User Flow           | Monolithic, nonlinear, hard to extend | "Central dogma": All actions update route state |
| Visual/Interaction  | Unpredictable, little state management | Deterministic UI, route is source of truth |
| Security            | Ad-hoc, weak authentication | Strict session token usage throughout |
| Extensibility       | Difficult to modularize | Easy: Add concepts without cross-imports |
| LLM Usage           | Scattered, ill-defined context | Context injection for every interaction |

---

## Why I Made These Changes

Making all these changes really helped resolve the scalability, security, and usability issues I was running into with my earlier versions. By simplifying the user flow and strictly modeling each concept, I was able to iterate on things independently, make the backend more secure, and keep the frontend maintainable. 

This also sets up TrailLink well for future extensions—like richer profiles or more live modes—because every concept and interaction is clearly defined and modular. I learned that a well-designed concept doesn't need to be tightly coupled to backend or frontend implementation details; it can stand independently, which gives you way more flexibility.

---

## My Final Concept Specifications

Here are the four concepts I ended up with. Each one follows the standard format we learned in class: purpose, principle, state, actions, and implementation notes.

### 1. LLMRoutePlanner

**What it does:** This enables natural language-based multi-modal route planning (transit + hiking) through LLM orchestration. This is the concept I'm most proud of.

**Key features:**
- Natural language query processing (like "Find trails near Boston accessible by MBTA")
- Route creation and modification through a single interface
- Emergency exit routing
- Context-aware suggestions

**Where to find more:**
- [Full Specification]({BASE_URL}/blob/main/design/concepts/HikingApp/LLMRoutePlanner.md)
- [Implementation]({BASE_URL}/blob/main/src/concepts/LLMRoutePlanner/LLMRoutePlannerConcept.ts)
- [API Documentation]({BASE_URL}/blob/main/API_SPECIFICATION.md#llm-route-planner)

**Main action:**
- `planRoute(query, userLocation, preferences?, currentRoute?)` → RouteResponse

### 2. User (Authentication)

**What it does:** This lets users maintain authenticated state across multiple requests without repeatedly providing credentials.

**Key features:**
- User registration with password hashing
- Session-based authentication with secure tokens
- Password management
- Automatic session expiration

**Where to find more:**
- [Full Specification]({BASE_URL}/blob/main/design/concepts/HikingApp/User.md)
- [Implementation]({BASE_URL}/blob/main/src/concepts/HikingApp/User.ts)
- [API Documentation]({BASE_URL}/blob/main/API_SPECIFICATION.md#user-authentication)

**Main actions:**
- `register(username, password, email)` → userId
- `login(username, password)` → sessionToken
- `authenticate(sessionToken)` → userId
- `logout(sessionToken)` → success

### 3. Profile

**What it does:** This provides public-facing user profiles that are separate from authentication concerns. Keeping this separate from User was an important design decision I made.

**Key features:**
- Display names, bios, and preferences
- Profile picture support
- Hiking statistics and achievements
- Privacy-focused (separate from User concept)

**Where to find more:**
- [Full Specification]({BASE_URL}/blob/main/design/concepts/HikingApp/Profile.md)
- [Implementation]({BASE_URL}/blob/main/src/concepts/HikingApp/Profile.ts)
- [API Documentation]({BASE_URL}/blob/main/API_SPECIFICATION.md#profile-management)

**Main actions:**
- `createProfile(userId, displayName, bio?)` → profileId
- `getProfile(userId)` → ProfileData
- `updateProfile(userId, updates)` → success
- `searchProfiles(query)` → ProfileData[]

### 4. UserHistory

**What it does:** This tracks user hiking activities, location history, and enables discovery of popular destinations.

**Key features:**
- Hike completion tracking
- Real-time location sharing
- Historical trail popularity data
- Personal hiking statistics

**Where to find more:**
- [Full Specification]({BASE_URL}/blob/main/design/concepts/HikingApp/UserHistory.md)
- [Implementation]({BASE_URL}/blob/main/src/concepts/HikingApp/UserHistory.ts)
- [API Documentation]({BASE_URL}/blob/main/API_SPECIFICATION.md#user-history)

**Main actions:**
- `recordHike(userId, route, completedAt)` → hikeId
- `updateLocation(userId, location, timestamp)` → success
- `getHikingHistory(userId, limit?)` → HikeData[]
- `getPopularDestinations(region?)` → DestinationData[]

---

## Additional Documentation

If you want to see more implementation details, API specifications, and testing documentation, check out:

- [API Specification]({BASE_URL}/blob/main/API_SPECIFICATION.md) - Complete REST API documentation
- [Implementation Summary]({BASE_URL}/blob/main/IMPLEMENTATION_SUMMARY.md) - Technical implementation details
- [Synchronizations]({BASE_URL}/blob/main/design/concepts/HikingApp/synchronizations.md) - Concept synchronization logic
- [Testing Documentation]({BASE_URL}/blob/main/design/concepts/HikingApp/testing.md) - Test coverage and strategies
- [README]({BASE_URL}/blob/main/README.md) - Setup and deployment instructions

---

## How to Update Links

If you're moving this document to a different repository, here's what to do:

1. Update the **Repository Configuration** section at the top of this document
2. Replace the `{BASE_URL}` placeholder with your actual GitHub repository URL
3. All the links will automatically point back to the correct files in the backend repository

**Example:**
```markdown
<!-- Change from: -->
**Backend Repository Base URL:** `https://github.com/YOUR_USERNAME/concept_backend`

<!-- To: -->
**Backend Repository Base URL:** `https://github.com/cole-school/traillink-backend`
```

Then use find-and-replace: `{BASE_URL}` → `https://github.com/cole-school/traillink-backend`