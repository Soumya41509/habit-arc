<div align="center">

# 🌿 HabitArc

### *Build your rhythm. One arc at a time.*

A mindful, private, and aesthetic habit-tracking application built with **React Native**, **Expo Router**, and **Expo SQLite**, styled with the **Calm Arc Flow** design system.

[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-57-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-Local_First-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-9B8AFB?style=for-the-badge)](LICENSE)

<br />

```
   ╭───────────────────────────────────────────────────────────╮
   │   🌸 Sunrise Salmon   →   🌺 Blush Pink   →   💜 Lavender │
   │   →   🌊 Sky Cerulean  →   🌱 Mint Momentum Milestone     │
   ╰───────────────────────────────────────────────────────────╯
```

</div>

---

## 📖 Overview

**HabitArc** transforms daily routines into moments of calm accomplishment. Designed without guilt, pressure, or cognitive overload, HabitArc visualizes your consistency as a rising, organic arc of progress.

Whether you're developing a morning routine, reading daily, or meditating, HabitArc provides a tactile, distraction-free environment that puts your focus where it belongs: **on showing up.**

---

## ✨ Key Features

### 🔒 100% Private & Local-First
- **No Cloud Lock-in**: All habit records, streaks, and timestamps are stored in an on-device **SQLite** database (`habitarc.db`).
- **Instant Speed**: Zero network latency, instant responsiveness, and full offline functionality.
- **No Mandatory Accounts**: No logins, email verifications, or passwords needed.

### 🎨 Calm Arc Flow Design System
- **Dual Themes**: Tailored **Dark Mode** (`#12131A`) for evening reflection and **Light Mode** (`#FAF8FF`) for daytime focus.
- **Glassmorphic Depth**: Frosted blur surfaces, soft ambient aura glows, and tactile pill-shaped buttons.
- **Dynamic Arc Progress**: Rising SVG arcs with multi-gradient stops and milestone spheres instead of rigid percentage bars.

### 📱 Holistic Flow
- **Initiation Flow**: Cinematic splash screen with breathing aura animations and an interactive 3-pillar onboarding guide.
- **Daily Dashboard**: Quick one-tap habit completions, streak tracking, and daily focus views.
- **Habit Builder**: Customizable icons, colors, and flexible weekly frequency schedules.
- **Analytics & History**: Detailed completion trends, streak records, and habit log breakdowns.
- **Personalized Settings**: Real-time theme toggles, onboarding replays, and offline database management.

---

## 🎨 Color Palette & Themes

HabitArc uses a carefully curated spectrum of calming tones and pastel milestones:

| Token | Light Theme | Dark Theme | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas / Surface** | `#FAF8FF` | `#12131A` | Main background base |
| **Surface Container** | `#ECEDFB` | `#1E1F27` | Cards & floating panels |
| **Primary Accent** | `#5F4DBA` | `#C9BFFF` | Core actions & active tabs |
| **Primary Container** | `#9B8AFB` | `#9B8AFB` | Gradients & glowing highlights |
| **Secondary Accent** | `#1E5BB8` | `#AEC6FF` | Supporting badges & pills |
| **Tertiary Accent** | `#006B59` | `#65DABE` | Success states & milestone nodes |
| **Sunrise Salmon** | `#FFB38A` | `#FFB38A` | Habit arc start point |
| **Blush Pink** | `#F38BB8` | `#F38BB8` | Arc progression node |

---

## 🛠 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo SDK 57](https://expo.dev/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Local Database**: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) with WAL journal mode
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Graphics**: [React Native SVG](https://github.com/software-mansion/react-native-svg) & [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
- **UI & Effects**: [Expo Blur](https://docs.expo.dev/versions/latest/sdk/blur/) & [@expo/vector-icons](https://icons.expo.fyi/)
- **Storage & Security**: [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)

---

## 📁 Project Structure

```text
HabitArc/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.jsx       # Custom glassmorphic floating bottom navigation
│   │   ├── index.jsx         # Home dashboard & habit completion tracker
│   │   ├── add.jsx           # Create new habits with icons & schedules
│   │   ├── analytics.jsx     # Habit analytics & weekly trends
│   │   └── settings.jsx      # Theme switch (Dark/Light) & settings
│   ├── habit/
│   │   └── [id].jsx          # Detailed habit view, stats & completion history
│   ├── _layout.jsx           # App root with ThemeProvider & font loaders
│   ├── index.jsx             # Initiation splash screen with breathing aura
│   ├── onboarding.jsx        # 3-slide visual onboarding walkthrough
│   └── +not-found.jsx        # 404 handler
├── components/
│   ├── ArcLogo.js            # Multi-gradient SVG arc logo with milestone nodes
│   ├── ArcProgress.js        # Dynamic circular progress arc
│   ├── Background.js         # Theme-aware ambient aura background
│   ├── Button.js             # Pill-shaped primary, secondary, and ghost buttons
│   ├── GlassView.js          # Cross-platform frosted glass container
│   ├── TabBar.js             # Floating bottom glassmorphism tab bar
│   └── ThemedText.js         # Typography component supporting Inter scale
├── constants/
│   └── Colors.js             # Calm Arc Flow color tokens for Light & Dark modes
├── context/
│   └── ThemeContext.js       # Global theme provider with persistence
├── lib/
│   ├── db.js                 # SQLite database initialization & CRUD operations
│   └── supabase.js           # Optional cloud synchronization client
├── package.json
└── app.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [Expo Go](https://expo.dev/go) app on your mobile device (iOS / Android) or simulator

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Soumya41509/habit-arc.git
   cd habit-arc
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on your device:**
   - Scan the QR code with your iPhone camera or Android **Expo Go** app.
   - Press `a` for Android emulator, `i` for iOS simulator, or `w` for Web.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use and adapt it for personal or commercial projects.

---

<div align="center">
  <sub>Crafted with care for mindful living.</sub>
</div>
