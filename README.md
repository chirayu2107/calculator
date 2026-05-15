# Maid Tracker

Track monthly attendance and calculate payment for household staff (maid, cook, driver, etc.). Multi-staff, cloud-synced, light/dark mode, works offline.

## Features

- **Multiple staff members** — separate rates, meal modes, attendance per person
- **Calendar grid** — tap any day to toggle Lunch / Dinner / Cleaning
- **Real auth** — Firebase Email/Password sign-in syncs across devices
- **Per-staff configurable rates** — monthly amounts auto-divided by days in month
- **Live monthly summary** — Food / Cleaning / Grand total
- **Account deletion** built into Settings (Play Store requirement)
- **Light & dark mode** (follows system)
- **Local-first** — AsyncStorage cache means it works offline

## Run locally

```bash
npm install
npx expo start
```

Press `a` for Android emulator, `i` for iOS simulator, `w` for web, or scan the QR with Expo Go.

## Project layout

```
App.js                                # Root + ErrorBoundary + auth gate
src/
  context/AppContext.js               # Auth state + multi-staff state + persistence
  firebase/
    config.js                         # Firebase init (with RN auth persistence)
    authService.js                    # signUp/signIn/reset/delete wrappers
    firebaseService.js                # Firestore reads/writes
  storage/storage.js                  # AsyncStorage cache + schema helpers
  screens/
    AuthScreen.js                     # Sign in / sign up / reset password
    HomeScreen.js                     # Calendar + staff picker + summary
  components/
    StaffPicker.js                    # Horizontal staff pill scroller
    StaffManagerSheet.js              # Add / rename / delete staff
    SettingsSheet.js                  # Per-staff settings + sign out + delete account
    ErrorBoundary.js                  # Catch render errors
    ...
  utils/
    logger.js                         # __DEV__-aware console wrapper
    date.js, summary.js, responsive.js
assets/                               # icon.png, adaptive-icon.png, splash.png, favicon.png
firestore.rules                       # Security rules — deploy to Firebase
eas.json                              # EAS Build profiles (Android)
PRIVACY.md                            # Privacy policy
```

## Data model (Firestore)

```js
users/{uid} = {
  email: 'you@example.com',
  createdAt: <serverTimestamp>,
  activeStaffId: 'staff_xxx',
  staffList: [
    { id: 'staff_xxx', name: 'Sunita', color: '#6366F1', archived: false }
  ],
  staffData: {
    'staff_xxx': {
      monthlyRates: { lunch: 1500, dinner: 1500, cleaning: 1200 },
      mealMode: 'both' | 'lunch' | 'dinner',
      cleaningPerWeek: 3,
      attendance: {
        '2026-05-12': { lunch: true, dinner: false, cleaning: true }
      }
    }
  }
}
```

Days with no active toggles are not stored (saves space).

---

# Launching to the Play Store

A step-by-step checklist. Most of this is one-time setup.

### 1. Firebase setup (5 min)

In the [Firebase Console](https://console.firebase.google.com/project/maid-calc):

1. **Authentication → Sign-in method** → enable **Email/Password** provider.
2. **Firestore Database** → **Rules** tab → paste contents of [`firestore.rules`](firestore.rules) and publish.
3. (Optional) Tighten the API key in [Google Cloud Console](https://console.cloud.google.com/) → Credentials → restrict to your Android package name + SHA-1.

### 2. Privacy policy (10 min)

You must host the privacy policy at a public URL before Play Store will accept your app.

- Easiest free option: push [`PRIVACY.md`](PRIVACY.md) to a GitHub repo and use the GitHub Pages URL, or paste it into a Notion page set to "Share to web."
- Edit the contact email and "Last updated" date in [`PRIVACY.md`](PRIVACY.md) before publishing.

### 3. Generate proper icons (optional but recommended)

The current [`assets/icon.png`](assets/icon.png), [`adaptive-icon.png`](assets/adaptive-icon.png), and [`splash.png`](assets/splash.png) are programmatic placeholders (indigo gradient, no logo). To replace with a designed icon:

- Open [`assets/icon.svg`](assets/icon.svg) in Figma / Inkscape, customize, export as 1024×1024 PNG → `assets/icon.png`.
- Same for adaptive icon (foreground only — Android crops the corners).
- Splash should be at least 1242×2436 with transparent or solid background.

### 4. EAS Build setup (one time)

```bash
npm install -g eas-cli
eas login                        # use your Expo account
eas init                         # links this repo to an Expo project, fills extra.eas.projectId in app.json
eas build:configure              # confirms eas.json is valid
```

### 5. Android signing (handled by EAS)

```bash
eas credentials                  # let EAS generate and store the upload keystore
```

EAS will generate and securely store an Android keystore for you. **Don't lose access to this Expo account** — losing the keystore means you can't push updates to the same Play Store listing.

### 6. Build a preview APK to test on a real device

```bash
eas build --profile preview --platform android
```

Wait ~10–15 min, then download/install the APK link EAS gives you. Test:

- Sign up with a new email
- Add a couple of staff members
- Toggle some days, change rates
- Force-quit and re-open — data should persist
- Switch to airplane mode — should still work locally
- Sign out, sign back in — data restored from cloud
- Settings → Delete account → enter password → confirm → app returns to login

### 7. Build a production AAB

```bash
eas build --profile production --platform android
```

This produces an `.aab` (Android App Bundle) — required for Play Store.

### 8. Play Console setup (~1–2 hours)

1. Create a Google Play Console account ($25 one-time): https://play.google.com/console
2. Create a new app → fill in:
   - Title: **Maid Tracker**
   - Short description (80 chars): *Track house staff attendance and calculate monthly payment.*
   - Full description (4000 chars): adapt the Features section above
   - Category: **Productivity** or **Lifestyle**
   - Content rating: take the questionnaire — Maid Tracker has no objectionable content
   - Target audience: 13+
3. **App content → Privacy policy** → paste your hosted URL
4. **App content → Data safety** → fill in honestly:
   - Email collected: yes (account creation), not shared
   - User data collected: app activity (yours only), not shared
   - Data encrypted in transit: yes
   - Users can request data deletion: yes (in-app + email)
5. **Release → Internal testing** → upload the `.aab` from step 7 → add 1-2 tester emails → roll out
6. After testing, promote to **Closed testing** (20+ testers) → **Open testing** → **Production**

### 9. First production release

```bash
eas submit --profile production --platform android
```

This uploads the AAB to Play Store and creates a draft release in the **Internal** track. Promote it from there in the Play Console.

---

## Future roadmap (post-launch)

These are the next features in priority order:

1. **Export & share** — PDF/image of monthly summary for WhatsApp (`expo-print` + `expo-sharing`)
2. **Salary advance / loan tracking** — auto-deduct from monthly total
3. **Leave & holiday tracking** — paid vs unpaid leave
4. **Notes per day** — free-text annotations
5. **Bonus / festival pay** — one-off additions
6. **Push reminders** — month-end nudge to settle payment (`expo-notifications`)
7. **Biometric / PIN app lock** — privacy for payment data (`expo-local-authentication`)
8. **Hindi localization** + currency selection
9. **Haptic feedback** on day toggles
10. **iOS launch** + Sign in with Apple (requires Apple Developer account)
