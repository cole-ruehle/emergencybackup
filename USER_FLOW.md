# Route Planner — Real User Flow Notes

Hey, here’s how the flow actually feels based on my experience — this is pretty much a walk-through of what *I* wish I’d had when planning hikes last summer (where I got super frustrated by Google Maps and a million open tabs). 

## What It’s Like To Actually Use

### 1. Landing on the App
- When you launch the app in your browser, you get a super clean interface. No distractions. The header says “Route Planner.”
- Up front: A spot to type where you’re starting from, how long you want to be out (“3 hours”, etc.), and optionally a specific trail (“Middlesex Fells,” etc.).
- There’s a “Find Routes” button you pretty much can’t miss — and a little empty “Saved Routes” section to make it feel like you could build a list over time. (This made it feel more game-like for me.)

### 2. Actually Starting a Search
- Type in, let’s say, “Cambridge, MA” for your start, and “3hr” for duration. You can toss in a trail name or just leave it blank.
- The "Find Routes" button gets all perky/active when your inputs are valid.
- Feels like a real form — not awkward or buggy.

### 3. Seeing Results Load
- Click "Find Routes" and the button says “Searching…” so you know it’s thinking, plus you get a loading spinner.
- A grid of route cards pops up (nice and orderly, no info-dump madness).
- Each card tells you stuff I always had to cobble together from multiple apps: transit/walking time, hiking time, how hard it is, and little icons showing if it’s subway/bus/walking.

### 4. Filtering and Browsing (The Tedious Part, Now Easier)
- You can actually “filter” without hunting for where: tap “Filters,” and you can pick easier/harder, or filter by transit mode (bus, walk, whatever).
  - Instantly the list shrinks or grows — you don’t have to reload or lose your place.
- Pagination dots at the bottom help if you have too many options. (“Why do none of these other apps have this?”)

### 5. Picking a Route
- Click on a card to see all the details you need when you’re really about to go:
  - Top shows a header — you can “save” it just by liking the heart (not buried in a menu!)
  - A few placeholder images (honestly, feels like the product could easily let people upload their own someday)
  - Big map with the route shown (no more flipping tabs!), steps/instructions, and “similar routes” which is a lifesaver when you're wavering.

### 6. Dig Into Details & Save
- Press that heart again — it clearly fills or empties so you know you saved or unsaved.
- Step-by-step instructions in nice little outlined sections on the side (much less frustrating than a wall of text).
- If you’re indecisive like me, the “similar routes” give you exit ramps without starting over.

### 7. Starting Navigation!
- Tap “Start Navigation” (no ambiguity — the button stands out).
- The whole display shifts to “navigation mode” — you see your route, current location, and live turn-by-turn directions.
- Big next-step cards and bottom controls — everything’s thumb-friendly.

### 8. While Actually Navigating
- There’s not just “start and stop” — you’ve got:
  - Status Updates (where you can check progress),
  - Modify Route (add detours, bathroom, food, etc. — this is where the real intelligence comes in), 
  - “Suggested Modifications” (I used these a LOT; the app just offers alternates, almost reading your mind).
- Each panel slides in/out — doesn’t take over.

### 9. Emergency (“How Do I Get Out of Here?”)
- The “Emergency” button is where you’d expect and *oh wow* — when you need it, everything goes red so you know you’re in a different mode, and you get the fastest “exit” route plotted immediately.
- You can SEE you’re in emergency mode — red border, different background, etc. You don’t have to wonder.

### 10. Ending Navigation
- Hit “Stop Navigation,” the app gracefully takes you back to the search screen — nothing lingering or weird.
- Map and nav stuff goes away, you’re left exactly where you’d want (at the search screen, not lost in no-mans-land).

### 11. Saved Routes (“Did I Plan This Before?”)
- Back on search, you now see saved routes with a star. Super quick to re-load or build on previous plans (what Google can’t do!).
- Can click to re-search similar options with one tap.

---

## What to Show Off in Demo/Recording

(I wrote this to make sure I wouldn’t miss anything real users care about.)

- **Instant Feedback** — Changing inputs or filters and seeing results right away, no awkward waiting.
- **No Reloads** — Everything’s live, feels like an app-not-a-website.
- **Saving Progress** — When you save a route, it’s there even if you come back later.
- **Making Mistakes** — Show what happens if you leave fields blank (no crashes!), or if the backend fails (still looks okay, clear errors).
- **Resize Window** — App shifts for mobile, touch targets still easy.
- **Emergency Mode** — Show the red mode, fast escape route, and how you can get back out with one tap.

## My Quick-Reference Demo Script
- Show the blank “search,” fill in details, hit Find.
- Play with filters — explain what I’m doing and why.
- Pick a route, show how much info you get, save it.
- Start navigation, show live directions and modifications.
- Trigger emergency, point out the changes.
- Stop navigation, show I can re-use saved routes.

## If Something Breaks / Testing
- App should always open cleanly, no errors.
- All major actions should work: search, filter, save, navigate, emergency, mobile.
- No console errors, no weird CSS.
- If backend is off, still demo the frontend (with mock or prefilled results).

---

*This flow was built to finally make planning a day outdoors — even when you have a million little “what if I need to escape? Where’s a bathroom or food?” questions — feel like a human problem, not a logistical nightmare.*

