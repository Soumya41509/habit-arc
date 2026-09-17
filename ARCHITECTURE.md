# 🏛️ Routiva Architecture & System Design

This document details the high-level architecture, state lifecycle, and rendering pipelines of **Routiva**.

```
  ┌─────────────────────────────────────────────────────────────┐
  │                    React Native Application                 │
  │                                                             │
  │   ┌─────────────────────────────────────────────────────┐   │
  │   │  Expo Router 57 (File-Based Stack & Glass Tabs)     │   │
  │   └──────────────────────────┬──────────────────────────┘   │
  │                              │                              │
  │   ┌──────────────────────────▼──────────────────────────┐   │
  │   │     ThemeContext (Dual Mode: Calm Arc Flow)         │   │
  │   └──────────────────────────┬──────────────────────────┘   │
  │                              │                              │
  │   ┌──────────────────────────▼──────────────────────────┐   │
  │   │  UI Components (Reanimated 4 • SVG Arc • Glass)     │   │
  │   └──────────────────────────┬──────────────────────────┘   │
  │                              │                              │
  │   ┌──────────────────────────▼──────────────────────────┐   │
  │   │  Local Data Engine (Expo SQLite • WAL Journal Mode) │   │
  │   └─────────────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────────────┘
```

---

## 1. Local Database Layer (`lib/db.js`)

Routiva uses an embedded **SQLite** engine operating with **WAL (Write-Ahead Logging)** mode for high concurrency and sub-millisecond query execution:

- **`habits` Table**: Stores routine/habit metadata (title, icon, color, serialized recurrence array, and creation timestamp).
- **`habit_logs` Table**: Records daily completions with unique composite indexing `(habit_id, completed_at)` to guarantee zero duplicate logs.
- **Cascading Deletions**: Deleting a routine automatically cascades and purges historical completion logs cleanly.
- **Zero Cloud Dependency**: Operates entirely on-device (`routiva.db`) with automated data migration from legacy instances.

---

## 2. Calm Arc Flow Design System

The visual design system is structured around soft elevation tiers, tactile pill geometry, and adaptive luminance:

- **Elevation Level 0 (Canvas)**: Theme background (`#FAF8FF` in Light Mode, `#12131A` in Dark Mode).
- **Elevation Level 1 (Layered Grouping)**: Sub-surfaces embedded inside the canvas for grouped controls.
- **Elevation Level 2 (Glass Floating Cards)**: `GlassView` components leveraging frosted backdrops and diffused borders.
- **Elevation Level 3 (Active Arcs & Modals)**: Multi-gradient SVG arcs with glowing milestone nodes.

---

## 3. Theme Engine (`context/ThemeContext.js`)

- Dynamic system color scheme listener.
- Synchronized persistence across application restarts via `Expo SecureStore`.
- Zero-flicker transitions for text, cards, and tab navigation.
