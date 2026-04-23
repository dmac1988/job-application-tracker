# ByeUnemployment 👋

**Option C: Job Application Tracker**

A mobile app built with React Native (Expo) and Drizzle ORM that allows users to record job applications, track application status changes over time, categorise applications, define application volume targets, and view aggregated progress.

## Links

- **GitHub Repository:** https://github.com/dmac1988/job-application-tracker
- **Expo Link:** https://expo.dev/accounts/dmac1988/projects/byeunemployment/updates/b136e11c-b065-4977-9567-02ed7e255939

## Setup Instructions

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (Android/iOS) or press `a` to open on Android emulator.

## Running Tests

```bash
npm test
```

## Features

### Core
- Add, edit, and delete job applications
- Categories with custom names and colours
- Weekly and monthly application targets with progress tracking
- Insights with pie charts and bar charts
- Search and filter by text, category, and date range
- User registration, login, logout, and profile deletion
- Local SQLite persistence via Drizzle ORM
- Seed script with sample data

### Advanced
- Light/Dark mode toggle
- CSV data export
- Streak tracking for consecutive target completion
- External API integration (Remotive remote job listings)

## Tech Stack

- React Native with Expo SDK 54
- Expo Router (file-based navigation)
- Drizzle ORM with expo-sqlite
- react-native-chart-kit for visualisations
- Jest + React Native Testing Library for testing