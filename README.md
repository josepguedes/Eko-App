<p align="center">
  <img src="eko-App/assets/images/readme.jpg" alt="Eco-Driving App Logo" width="320"/>
</p>

<h1 align="center">Eco-Driving App</h1>

<p align="center">
  <strong>Drive smarter. Drive greener. Drive better.</strong>
</p>

<p align="center">
  A mobile application designed to help users drive more sustainably, efficiently, and safely through real-time trip recording, eco-driving analytics, gamification, and community challenges.
</p>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
  - [Demo Account](#demo-account)
- [How It Works](#-how-it-works)
- [Demo Data](#-demo-data)
- [Key Functionalities](#-key-functionalities)
- [Contributors](#-contributors)
- [License](#-license)
- [Institution](#institution)

---

## 🚗 About the Project

**Eco-Driving** is a comprehensive mobile application built with **React Native** that transforms the way people drive. The app leverages real-time GPS tracking, motion sensors, and intelligent algorithms to analyze driving patterns and provide actionable feedback to reduce fuel consumption, lower CO₂ emissions, and improve road safety.

### Why Eco-Driving?

- **Environmental Impact:** Reduce your carbon footprint by adopting eco-friendly driving habits
- **Cost Savings:** Save money on fuel through optimized driving techniques
- **Safety First:** Minimize aggressive driving behaviors for safer roads
- **Community Engagement:** Join groups, compete in challenges, and learn from others
- **Gamification:** Earn points, unlock achievements, and track your progress

---

## ✨ Features

### 🎯 Core Features

- **Real-Time Trip Recording**
  - GPS-based route tracking with map visualization
  - Live eco-score calculation during trips
  - Detection of aggressive events (harsh braking, rapid acceleration)
  - Fuel consumption and CO₂ emission estimates

- **Comprehensive Analytics Dashboard**
  - Detailed trip history with filterable periods (Today, Week, Month, Year, All Time)
  - Visual charts for fuel consumption trends
  - Eco-score breakdown by category (speed, acceleration, braking)
  - Distance, time, and cost statistics

- **Personal Goal System**
  - Create custom goals from predefined templates
  - Track progress with visual indicators
  - Goals include: eco-score targets, distance milestones, fuel savings, trip counts
  - Automatic goal completion detection and notifications

- **Group Challenges & Social Features**
  - Create or join public/private groups
  - Group leaderboards and rankings
  - In-group messaging and chat
  - Shared challenges and collective goals
  - Group statistics and progress tracking

- **Multi-Car Management**
  - Add unlimited vehicles to your profile
  - Track stats per vehicle
  - Quick car switching from home screen
  - Vehicle-specific fuel consumption tracking

- **Profile & Achievements**
  - Comprehensive driving statistics
  - Personal achievements and badges
  - Trip history timeline
  - Settings: notifications, privacy, account management

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo** (~52.0.11) - Development platform and build tooling
- **TypeScript** - Type-safe development
- **Expo Router** - File-based navigation system

### Storage & State Management
- **@react-native-async-storage/async-storage** - Local data persistence
- **React Context API** - Global state management (notifications, user session)

### UI & Design
- **@expo/vector-icons** - Icon library (Ionicons)
- **react-native-safe-area-context** - Safe area handling
- **expo-blur** - Blur effects for modern UI
- **expo-linear-gradient** - Gradient backgrounds

### Location & Sensors
- **expo-location** - GPS tracking and geolocation
- **expo-sensors** - Accelerometer for aggressive event detection

### Media & Files
- **expo-image-picker** - Profile and group image selection
- **expo-file-system** - File management

### Other
- **date-fns** - Date manipulation and formatting
- **react-native-charts-wrapper** (planned) - Advanced charting

---

## 🗂️ Project Structure

```
Eko-App/
├── eko-App/
│   ├── app/                          # Application screens and routing
│   │   ├── (tabs)/                   # Main tab navigation
│   │   │   ├── index.tsx             # Home screen
│   │   │   ├── groups.tsx            # Groups overview
│   │   │   ├── record.tsx            # Trip recording screen
│   │   │   ├── stats.tsx             # Statistics dashboard
│   │   │   ├── profile.tsx           # User profile
│   │   │   └── _layout.tsx           # Tab layout configuration
│   │   ├── login.tsx                 # Authentication screen
│   │   ├── register.tsx              # User registration
│   │   ├── create-group.tsx          # Group creation
│   │   ├── create-goals.tsx          # Goal creation
│   │   ├── group-page.tsx            # Group details page
│   │   ├── support.tsx               # Help & FAQ
│   │   ├── terms.tsx                 # Terms & Conditions
│   │   └── _layout.tsx               # Root layout
│   │
│   ├── components/                   # Reusable UI components
│   │   ├── mainPage/                 # Home screen components
│   │   │   ├── dropdown.tsx          # Car selection dropdown
│   │   │   ├── introBox.tsx          # Tips banner
│   │   │   ├── mainGoals.tsx         # Goals widget
│   │   │   ├── lastTrip.tsx          # Last trip summary
│   │   │   └── activitySummary.tsx   # Recent trips
│   │   ├── profile/                  # Profile components
│   │   │   └── stats-row.tsx         # Stats summary row
│   │   ├── buttons.tsx               # Custom button component
│   │   ├── inputs.tsx                # Custom input fields
│   │   └── checkBox.tsx              # Checkbox component
│   │
│   ├── models/                       # Data models and business logic
│   │   ├── users.ts                  # User authentication & management
│   │   ├── trip.ts                   # Trip data structure
│   │   ├── tripStats.ts              # Trip analytics calculations
│   │   ├── cars.ts                   # Car management
│   │   ├── goals.ts                  # Goal system logic
│   │   ├── groups.ts                 # Group management
│   │   ├── messages.ts               # In-app messaging
│   │   ├── mockData.ts               # Demo data initialization
│   │   └── initialization.ts         # App initialization
│   │
│   ├── contexts/                     # React Context providers
│   │   └── NotificationContext.tsx   # Global notifications
│   │
│   ├── constants/                    # App constants
│   │   └── defaultAvatar.ts          # Default user avatar
│   │
│   ├── assets/                       # Static assets
│   │   ├── images/                   # Images and icons
│   │   └── fonts/                    # Custom fonts
│   │
│   ├── scripts/                      # Utility scripts
│   │   └── reset-project.js          # Project reset utility
│   │
│   ├── app.json                      # Expo configuration
│   ├── package.json                  # Dependencies
│   ├── tsconfig.json                 # TypeScript config
│   └── .gitignore                    # Git ignore rules
│
└── README.md                         # This file
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your development machine:

### Required Software

- **Node.js** (v18.0.0 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm** (v9.0.0 or higher) or **yarn**
  - Comes with Node.js
  - Verify installation: `npm --version`

- **Git**
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

### Mobile Development Environment

Choose **ONE** of the following options:

#### Option 1: Physical Device (Recommended for beginners)
- **Expo Go App** installed on your iOS or Android device
  - [Download for iOS](https://apps.apple.com/app/expo-go/id982107779)
  - [Download for Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

#### Option 2: Android Emulator
- **Android Studio** with Android SDK
  - Download from [developer.android.com](https://developer.android.com/studio)
  - Configure an Android Virtual Device (AVD)

#### Option 3: iOS Simulator (macOS only)
- **Xcode** (latest version)
  - Download from Mac App Store
  - Install Command Line Tools: `xcode-select --install`



## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/josepguedes/Eko-App.git
   cd Eko-App/eko-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   Or if you prefer yarn:
   ```bash
   yarn install
   ```

   This will install all required packages including:
   - React Native framework
   - Expo SDK and modules
   - Navigation libraries
   - AsyncStorage for data persistence
   - All other dependencies listed in `package.json`

3. **Verify installation**
   ```bash
   npx expo --version
   ```
   Should display Expo SDK version ~52.0.11

### Running the App

#### Development Server

Start the Expo development server:

```bash
npx expo start
```

Or with specific options:

```bash
# Clear cache and start
npx expo start --clear

# Start in development mode
npx expo start --dev-client

# Start on specific port
npx expo start --port 8081
```

After running the command, you'll see a QR code in your terminal and a development tools interface will open in your browser (usually at `http://localhost:8081`).

#### Running on Physical Device

1. Ensure your phone is on the **same WiFi network** as your computer
2. Open the **Expo Go** app on your device
3. Scan the QR code displayed in the terminal or browser
4. The app will load and run on your device

**Troubleshooting Connection Issues:**
- Use tunnel mode if on different networks: `npx expo start --tunnel`
- Ensure firewall allows connections on port 8081

#### Running on Android Emulator

1. Start your Android emulator from Android Studio
2. Run the development server: `npx expo start`
3. Press `a` in the terminal to open the app in Android emulator
4. Wait for the app to build and install (first time may take several minutes)

#### Running on iOS Simulator (macOS only)

1. Ensure Xcode and Command Line Tools are installed
2. Run the development server: `npx expo start`
3. Press `i` in the terminal to open the app in iOS simulator
4. Select a simulator device if prompted
5. Wait for the app to build and launch

### Demo Account

The app comes with pre-configured demo data. You can log in using:

**Email:** `maria.silva@email.pt`  
**Password:** `password123`

This demo account includes:
- 3 registered cars (BMW 320d, Tesla Model 3, Toyota Prius)
- 10 recent trip records with realistic driving data
- Pre-joined groups and active goals
- Complete profile with statistics

Alternatively, you can **register a new account** from the registration screen. The app will automatically create default groups and initialize the necessary data structure.



---

## 🧑‍💻 How It Works

### 1. User Authentication & Initialization

When a user first opens the app:
- The `_layout.tsx` checks for an authenticated user using `getLoggedInUser()`
- If no user is found, redirect to login screen
- On successful login/register, `initializeMockData()` creates default app data
- User session is stored in AsyncStorage for persistence

### 2. Trip Recording Flow

```
User taps "Start Trip" → GPS tracking begins → 
Real-time data collection (speed, location, acceleration) → 
Eco-score calculated continuously → 
Aggressive events detected via accelerometer → 
User stops trip → Data saved to AsyncStorage → 
Statistics updated → Goals progress checked
```

### 3. Data Analysis & Statistics

- **Trip Statistics:** Calculated in `tripStats.ts` using `calculateTripStatistics()`
- **Filtering:** Data filtered by time period (Today, Week, Month, Year, All Time)
- **Metrics Tracked:**
  - Overall eco-score (0-5 scale)
  - Distance traveled (km)
  - Fuel consumed and saved (liters)
  - Average and maximum speed (km/h)
  - Total trip count
  - CO₂ emissions estimate

### 4. Goals System

- **Predefined Templates:** 7 goal categories (eco-score, distance, trips, etc.)
- **Custom Targets:** Users can set their own target values
- **Progress Tracking:** Automatically updated after each trip
- **Completion Detection:** Goals marked as complete when target is reached
- **Visual Feedback:** Progress bars and completion status indicators

### 5. Group Challenges

- **Group Creation:** Users can create public or private groups
- **Membership:** Join groups via invite or discovery
- **Leaderboards:** Ranked by total eco-score or other metrics
- **Group Chat:** Real-time messaging within groups (stored in AsyncStorage)
- **Shared Goals:** Groups can have collective challenges

### 6. Data Persistence

All data is stored locally using AsyncStorage:
- **Users:** Authentication, profile, preferences
- **Trips:** Complete trip history with routes
- **Cars:** Vehicle information and selection state
- **Goals:** User goals and progress
- **Groups:** Group details, memberships, messages
- **Stats:** Cached statistics for performance

---

## 🧪 Demo Data

The app includes comprehensive mock data initialized on first launch:

### Users
- **Maria Silva** (maria.silva@email.pt)
- **João Santos** (joao.santos@email.pt)
- **Ana Costa** (ana.costa@email.pt)
- Additional users for group population

### Cars (for Maria Silva)
1. **BMW 320d** (2020, Diesel) - Default selected
2. **Tesla Model 3** (2022, Electric)
3. **Toyota Prius** (2021, Hybrid)

### Trips (10 recent trips)
- **Trip 1:** 15.5 km, eco-score 4.5, 2 hours ago
- **Trip 2:** 22.3 km, eco-score 4.2, 5 hours ago
- **Trip 3:** 8.7 km, eco-score 4.7, yesterday
- **Trips 4-10:** Various distances and dates within the last week

Each trip includes:
- Route coordinates (latitude/longitude pairs)
- Speed data (average, maximum)
- Fuel consumption
- CO₂ emissions
- Aggressive event markers

### Groups (5 default groups)
1. **Eco Warriors Portugal** (50 members)
2. **Green Road Heroes** (40 members)
3. **Save Money, Save Planet** (60 members)
4. **EcoDrive Champions** (45 members)
5. **Clean Air Drivers** (35 members)

---

## 🔑 Key Functionalities

### Home Screen Components

- **Connected Car Dropdown:** Quick car switching with visual selection
- **Intro Box:** Daily eco-driving tips and advice
- **My Goals Widget:** Shows active goals with progress bars
- **Last Trip Summary:** Circular chart with eco-score and trip stats
- **Activity Summary:** Recent trips with visual timeline

### Stats Page Features

- **Period Selector:** Filter stats by time range
- **Metric Bars:** Visual representation of eco-score, speed, trips
- **Gas Chart:** 30-day fuel consumption trend line
- **Recent Trips List:** Detailed trip cards with route previews
- **Export Options:** (Planned) Export data as CSV/PDF

### Profile Management

- **User Info:** Name, email, avatar
- **Stats Overview:** Total score, goals completed, average eco-score
- **Car Management:** Add, edit, delete vehicles
- **Settings:** Notifications, privacy, language
- **App Actions:** Logout, clear data, delete account

### Trip Recording

- **Real-Time Map:** Live route visualization
- **Speed Monitor:** Current speed display with limit warnings
- **Eco-Score Live:** Updated every few seconds
- **Event Markers:** Visual indicators for aggressive driving
- **Summary Screen:** Post-trip detailed breakdown

---

## 👥 Contributors

This project was developed by:

### Development Team

- **José Guedes** - Full-Stack Developer [40230110@esmad.ipp.pt]
- **Mário Dias** - Full-Stack Developer [40230356@esmad.ipp.pt]
- **Eduardo Sousa** - Full-Stack Developer [40230115@esmad.ipp.pt]
- **Xavier Kooijman** - Full-Stack Developer [40220456@esmad.ipp.pt]  

---

## 📄 License

This project was developed for **educational and demonstration purposes** as part of academic coursework of the class "Computação Móvel e Ubíqua".

---

## Institution
**ESMAD - Escola Superior de Media Artes e Design**  
Vila do Conde, Portugal

---