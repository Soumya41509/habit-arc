<div align="center">

# 🌿 HabitArc

### *Build your rhythm. One arc at a time.*

A mindful, private, and aesthetic habit-tracking mobile experience crafted with **React Native**, **Expo Router**, and **Expo SQLite**, designed around the **Calm Arc Flow** design system.

<br/>

[![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_57-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-Local_First-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-9B8AFB?style=flat-square)](LICENSE)

<br/>

</div>

---

## ✦ Design Philosophy & Vision

**HabitArc** redefines personal tracking by shifting away from rigid numbers, aggressive red streaks, and cognitive guilt. Instead, it visualizes consistency through **organic, living arcs of momentum** that reflect natural human cadences.

By combining tactile frosted glassmorphism, soothing lavender accents, and responsive micro-interactions, HabitArc creates an atmosphere of quiet accomplishment—turning daily routines into moments of calm reflection.

---

## ✨ Core Pillars

<table>
  <tr>
    <td width="33%" align="center" valign="top">
      <h3>⚡ Zero Friction</h3>
      <p>Instant launch with zero logins, accounts, or mandatory sync. Open the app and log your habit in a single tactile tap.</p>
    </td>
    <td width="33%" align="center" valign="top">
      <h3>🌱 Gentle Cadence</h3>
      <p>Mindful progress visualization that eliminates streak anxiety. Celebrate showing up without fear of breaking momentum.</p>
    </td>
    <td width="33%" align="center" valign="top">
      <h3>🔒 100% Private</h3>
      <p>Built strictly local-first. All records, timestamps, and preferences live securely on your device inside an embedded SQLite database.</p>
    </td>
  </tr>
</table>

---

## 📱 Key Experiences

### 🌌 Initiation & Onboarding
- **Launch Screen**: Subtle organic aura glows, breathing logo badge, and animated micro-dots.
- **Mindful Walkthrough**: Interactive 3-slide introduction featuring the luminous 5-node Milestone Arc.
- **Fast-Track Skip**: Option to jump directly into your daily flow with a single tap.

### 🎯 Daily Tracking & Momentum
- **Rising Arc Indicators**: Dynamic multi-gradient SVG arcs showing completion milestones.
- **Tactile Cards**: Frosted glass containers (`GlassView`) with soft blur and gentle elevation.
- **Customizable Habits**: Tailor icons, color accents, and weekly recurrence patterns.

### 📊 Insights & Consistency
- **Trend Analytics**: Comprehensive completion records and weekly momentum breakdowns.
- **Streak Records**: Personal milestones tracked quietly in the background.

### 🌗 Adaptive Theme Engine
- **Dark Mode (`#12131A`)**: Deep atmospheric background crafted for nighttime unwinding.
- **Light Mode (`#FAF8FF`)**: High-clarity lavender-tinted palette for daytime focus.
- **Live Switching**: Seamlessly toggle themes on the fly from Settings.

---

## 🎨 Color Palette Specifications

The **Calm Arc Flow** palette establishes a serene visual rhythm using lavender as the anchor, complemented by gentle milestone progression hues:

| Token | Hex (Light) | Hex (Dark) | Role & Semantics |
| :--- | :---: | :---: | :--- |
| **Canvas Background** | `#FAF8FF` | `#12131A` | Main application background |
| **Surface Container** | `#ECEDFB` | `#1E1F27` | Interactive cards & layered surfaces |
| **Primary Accent** | `#5F4DBA` | `#C9BFFF` | Active navigation & primary controls |
| **Primary Glow** | `#9B8AFB` | `#9B8AFB` | Gradients, aura halos & glowing nodes |
| **Secondary Accent** | `#1E5BB8` | `#AEC6FF` | Supporting chips, badges & tags |
| **Tertiary / Mint** | `#006B59` | `#65DABE` | Milestone completion & success targets |
| **Sunrise Salmon** | `#FFB38A` | `#FFB38A` | Arc origin milestone node |
| **Blush Pink** | `#F38BB8` | `#F38BB8` | Arc progression milestone node |

---

## 🛠 Architectural Foundation

- **Client Runtime**: React Native 0.86 with Expo SDK 57
- **Routing Engine**: Expo Router (Modern file-based hierarchy with native stack and tab transitions)
- **Persistence Layer**: Embedded SQLite with Write-Ahead Logging (`WAL`) for instant sub-millisecond queries
- **Animation Engine**: React Native Reanimated for 60fps fluid transformations and gestures
- **Vector Graphics**: React Native SVG with custom linear gradients and glow filters
- **Visual Depth**: Expo Blur for cross-platform glassmorphic backdrops

---

## 📄 License

Distributed under the **MIT License**. Free for personal and commercial exploration.

<br/>

<div align="center">
  <sub>Designed & Developed for Mindful Daily Living.</sub>
</div>
