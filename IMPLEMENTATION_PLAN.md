# Calorie Tracker MVP - Implementation Plan

## User Profile
- **Weight**: 200 lbs
- **Height**: 5'10" (70 inches)
- **Gender**: Male
- **BMR**: ~1800-1900 calories/day
- **Goal**: 500 calorie deficit per day (lose weight)
- **Target Daily Intake**: ~1300-1400 calories/day
- **Exercise**: Daily bicep/tricep kettlebell routine (12 reps, 3 sets, 2 exercises) - estimated 50-100 calories burned

## Core Features

### 1. Daily Calorie Tracking
- Add food items with calorie counts
- View total calories for the day
- See remaining calories vs goal
- Visual progress bar showing deficit/surplus

### 2. Quick-Add Items (Saved Favorites)
- Save frequently eaten items with calorie counts
- One-tap adding from favorites list
- Edit/delete saved items
- Persistent storage using localStorage

### 3. Daily History & Reset
- Automatically start new day at midnight
- Save each day's total to history
- View past days' calorie intake
- Historical data stored in localStorage

### 4. Trend Analysis & Visualization
- Line graph showing calorie intake over time
- 7-day, 30-day, and all-time views
- Average intake calculation
- Visual goal line for target calories
- Identify patterns and areas for improvement

### 5. Goal Management
- Display BMR calculation (Mifflin-St Jeor equation)
- Show daily calorie goal (BMR - 500)
- Adjust for exercise calories if needed
- Progress indicator (calories consumed vs goal)

## Technical Stack

### Frontend
- **HTML5**: Semantic markup, mobile viewport meta tags
- **CSS3**:
  - Mobile-first responsive design
  - CSS Grid/Flexbox for layouts
  - CSS variables for theming
  - Touch-friendly tap targets (min 44x44px)
- **JavaScript**:
  - Vanilla JS (no framework needed for MVP)
  - ES6+ features (classes, modules, arrow functions)
  - Chart.js for data visualization

### Data Storage
- **localStorage**:
  - `calorieItems` - Array of saved quick-add items
  - `dailyHistory` - Object with date keys and calorie totals
  - `currentDay` - Today's entries
  - `userProfile` - BMR, goals, preferences

### Deployment
- **GitHub Pages**: Auto-deploy from `claude` branch
- Static site (HTML/CSS/JS only)
- No build process required

## File Structure
```
/
├── index.html           # Main app page
├── styles.css           # All styles
├── app.js              # Main app logic
├── chart.min.js        # Chart.js library (CDN or local)
└── IMPLEMENTATION_PLAN.md
```

## UI/UX Design

### Mobile-First Layout
1. **Header**: App title, current date, daily goal
2. **Quick Stats Card**:
   - Calories consumed today
   - Calories remaining
   - Progress bar
3. **Add Food Section**:
   - Quick-add buttons (saved items)
   - Manual entry form (name + calories)
4. **Today's Log**:
   - List of items added today
   - Delete individual items
5. **Navigation Tabs**:
   - Today (default view)
   - History & Trends
   - Quick-Add Manager
   - Settings

### Color Scheme
- **Primary**: #4CAF50 (green - healthy)
- **Warning**: #FF9800 (orange - approaching limit)
- **Danger**: #F44336 (red - over limit)
- **Background**: #F5F5F5 (light gray)
- **Text**: #333333 (dark gray)

## Data Models

### Quick-Add Item
```javascript
{
  id: timestamp,
  name: "Banana",
  calories: 105
}
```

### Daily Entry
```javascript
{
  id: timestamp,
  name: "Banana",
  calories: 105,
  timestamp: "2025-10-26T14:30:00Z"
}
```

### Daily History
```javascript
{
  "2025-10-26": {
    total: 1350,
    entries: [...dailyEntries],
    goal: 1400
  }
}
```

### User Profile
```javascript
{
  weight: 200,
  height: 70, // inches
  age: null, // optional
  gender: "male",
  bmr: 1850,
  dailyGoal: 1350, // BMR - 500
  exerciseCalories: 75 // optional daily burn
}
```

## Key Functions

### Storage Management
- `saveToLocalStorage(key, data)`
- `loadFromLocalStorage(key)`
- `checkNewDay()` - Detect date change and archive previous day

### Calorie Tracking
- `addFoodItem(name, calories)` - Add to today's log
- `deleteFoodItem(id)` - Remove from today's log
- `calculateDailyTotal()` - Sum all entries for today
- `getRemainingCalories()` - Goal minus consumed

### Quick-Add Management
- `saveQuickAddItem(name, calories)` - Add to favorites
- `deleteQuickAddItem(id)` - Remove from favorites
- `renderQuickAddButtons()` - Display quick-add UI

### History & Analytics
- `archiveDailyData()` - Save today's data to history
- `getHistoricalData(days)` - Retrieve last N days
- `calculateAverage(days)` - Average intake over period
- `renderTrendChart(data)` - Display Chart.js visualization

### BMR Calculation
- `calculateBMR(weight, height, age, gender)` - Mifflin-St Jeor equation
  - Men: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
  - Simplified for 30yo male: ~1850 calories

## Implementation Phases

### Phase 1: Core Tracking (Priority 1)
- [x] Basic HTML structure
- [x] Mobile-responsive CSS
- [x] Add food items manually
- [x] Display daily total
- [x] Show remaining calories
- [x] localStorage persistence

### Phase 2: Quick-Add (Priority 2)
- [x] Save favorite items
- [x] Quick-add buttons
- [x] Manage saved items UI
- [x] Edit/delete favorites

### Phase 3: History (Priority 3)
- [x] Daily reset at midnight
- [x] Archive previous days
- [x] View historical data
- [x] Date-based navigation

### Phase 4: Visualization (Priority 4)
- [x] Integrate Chart.js
- [x] Trend line graph
- [x] Multiple time periods
- [x] Goal line overlay
- [x] Average calculation display

### Phase 5: Polish (Priority 5)
- [x] BMR calculator
- [x] User profile settings
- [x] Improved mobile UX
- [x] PWA capabilities (optional)
- [x] Export data feature (optional)

## Deployment Instructions

1. **Development**: Work on `claude/calorie-tracker-mvp-*` branch
2. **Testing**: Test locally and on mobile devices
3. **Merge**: Merge to `claude` branch when ready
4. **Deploy**: GitHub Pages will auto-deploy from `claude` branch
5. **Access**: Visit `https://[username].github.io/[repo-name]/`

## Notes
- Keep it simple - vanilla JavaScript, no build process
- Mobile-first approach - optimize for phone usage
- Offline-capable - all data stored locally
- Privacy-focused - no data leaves the device
- Fast and lightweight - minimal dependencies

## Future Enhancements (Post-MVP)
- Meal categories (breakfast, lunch, dinner, snacks)
- Macronutrient tracking (protein, carbs, fat)
- Photo uploads for meals
- Barcode scanner integration
- Export data to CSV
- PWA with offline support
- Dark mode theme
- Exercise tracking integration
- Weight tracking over time
