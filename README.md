# Maid Tracker

A simple React Native (Expo) app to track a household maid's monthly attendance and calculate payment. Toggle lunch, dinner, and cleaning per day; the app totals everything based on configurable rates.

## Features

- Monthly calendar grid (Sun–Sat) with prev/next navigation and today highlight
- Tap any day to toggle Lunch / Dinner / Cleaning (with active-state color fill)
- Meal mode segmented control — `Lunch only` · `Both` · `Dinner only`
- Editable rates (default ₹50 lunch, ₹50 dinner, ₹100 cleaning)
- Live monthly summary: Food total, Cleaning total, Grand total + breakdown
- All data persisted locally via AsyncStorage (`YYYY-MM-DD` keys)
- Light & dark mode (follows system)

## Run it

You need [Node.js](https://nodejs.org) (18+) and the [Expo Go](https://expo.dev/client) app on your phone.

```bash
npm install
npx expo start
```

Then scan the QR code with Expo Go (Android) or the Camera app (iOS). For a simulator: press `i` for iOS or `a` for Android. Press `w` to open in a browser.

## Project layout

```
App.js                              # Root, theme + routing
src/
  context/AppContext.js             # State + persistence wiring
  storage/storage.js                # AsyncStorage keys + helpers
  theme/theme.js                    # Light / dark color tokens
  utils/date.js                     # Calendar grid + date helpers
  utils/summary.js                  # Monthly totals math
  components/
    DayCell.js                      # Single day in the grid
    DayEditorModal.js               # Bottom sheet with 3 toggle buttons
    MealModeToggle.js               # Segmented control
    SummaryBar.js                   # Sticky bottom totals
  screens/
    HomeScreen.js                   # Calendar + meal mode + summary
    SettingsScreen.js               # Editable rates
```

## Data model

```js
attendance = {
  "2026-05-12": { lunch: true, dinner: false, cleaning: true },
  ...
}
rates    = { lunch: 50, dinner: 50, cleaning: 100 }
mealMode = "both" | "lunch" | "dinner"
```

Days with no active toggles are stored as absent keys (not empty objects), keeping storage compact.
