# Calorie Tracker

A mobile-optimized web app for tracking daily calorie intake with deficit goals for weight loss.

## Features

- **Daily Calorie Tracking**: Add food items and track your calorie consumption
- **Quick-Add Items**: Save frequently eaten items for one-tap adding
- **Progress Visualization**: See your daily progress with visual indicators
- **Daily History**: Automatic daily reset with historical data preservation
- **Trend Analysis**: Graph your calorie intake over 7, 30, or all days
- **BMR Calculator**: Personalized daily calorie goals based on your profile
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly UI
- **Offline-Capable**: All data stored locally in your browser
- **Robust Backup & Restore**: Enhanced error handling for reliable data imports

## User Profile (Default Settings)

- **Weight**: 200 lbs
- **Height**: 5'10" (70 inches)
- **Gender**: Male
- **BMR**: ~1850 calories/day
- **Daily Goal**: 1350 calories/day (500 cal deficit)
- **Exercise**: 75 calories/day (kettlebell routine)

## How It Works

### Daily Tracking
1. Add food items manually or use quick-add buttons
2. View your progress toward your daily calorie goal
3. See remaining calories and percentage consumed
4. Data automatically saves to browser localStorage

### Quick-Add Items
1. Go to "Quick Add" tab
2. Save frequently eaten items with their calorie counts
3. Items appear as one-tap buttons on the "Today" tab
4. Edit or delete saved items anytime

### History & Trends
1. Each day automatically starts fresh at midnight
2. Previous day's data is archived to history
3. View historical data in the "History" tab
4. Analyze trends with interactive charts
5. See average intake and days tracked

### Settings
1. Update your weight, height, age, and gender
2. BMR is automatically calculated
3. Daily goal is set to BMR - 500 calories
4. Add exercise calories to account for daily activity

### Backup & Restore

The app includes comprehensive backup and restore functionality with robust error handling:

#### Creating a Backup
1. Go to Settings tab
2. Choose from three backup options:
   - **Share to Notes** (iOS/Android) - Native share sheet integration
   - **Copy Backup** - Copy JSON to clipboard
   - **Download File** - Save as .json file

#### Restoring from Backup
1. Use "Import Backup" (file upload) or "Paste Backup" (from clipboard)
2. The app validates the backup with multi-step error checking
3. Confirms before overwriting existing data
4. Restores all data including history, quick-add items, and settings

#### Enhanced Error Handling

The backup restore feature includes robust JSON parsing with detailed error messages:

- **Whitespace Trimming**: Automatically removes leading/trailing whitespace
- **JSON Validation**: Verifies the backup data is valid JSON format
- **Structure Validation**: Ensures required data fields are present
- **Data Validation**: Checks that backup contains recognizable data
- **User-Friendly Errors**: Clear, specific feedback when restoration fails

Common error messages you might see:
- "Backup data is empty. Please paste valid backup data."
- "Failed to paste backup. Make sure you copied valid backup data. Error: JSON Parse error: Unable to parse JSON string"
- "Invalid backup format. No recognizable data found in backup."

This prevents data loss from malformed backups and guides users to fix issues.

## Technology Stack

- **HTML5**: Semantic markup, mobile viewport
- **CSS3**: Mobile-first responsive design, CSS Grid/Flexbox
- **JavaScript**: Vanilla ES6+, no frameworks
- **Chart.js**: Data visualization
- **localStorage**: Client-side data persistence
- **PWA**: Service Worker for offline functionality

## Deployment

This app is configured to deploy automatically from the `claude` branch via GitHub Pages.

### Local Development
1. Clone the repository
2. Open `index.html` in a web browser
3. No build process required

### Production Deployment
1. Merge changes to `claude` branch
2. GitHub Pages will auto-deploy
3. Access at: `https://[username].github.io/cico/`

## File Structure

```
/
├── index.html              # Main app page
├── styles.css              # All styles
├── app.js                  # Main app logic with robust error handling
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline support
├── IMPLEMENTATION_PLAN.md  # Detailed implementation guide
└── README.md               # This file
```

## Data Privacy

- All data is stored locally in your browser's localStorage
- No data is sent to any server
- Data persists across sessions
- Export your data anytime from Settings tab

## Features Explained

### BMR Calculation
Uses the Mifflin-St Jeor equation:
- **Men**: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
- **Women**: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161

### Weight Loss Goal
- 500 calorie daily deficit = ~1 lb weight loss per week
- Safe and sustainable weight loss rate
- Adjust in Settings based on your needs

### Exercise Calories
- Default: 75 calories for daily kettlebell routine
- Kettlebell workout (12 reps × 3 sets × 2 exercises): ~50-100 cal
- Can be adjusted in Settings

## Browser Support

- Chrome/Edge (latest)
- Safari (latest)
- Firefox (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Recent Improvements

### Enhanced Backup JSON Parsing (Latest)
- Added comprehensive parseBackupData method with multi-step validation
- Implemented whitespace trimming for pasted backup data
- Added specific error messages for different failure scenarios
- Improved both clipboard paste and file import error handling
- Fixed "JSON Parse error: Unable to parse JSON string" issues

## Future Enhancements

- [ ] Meal categories (breakfast, lunch, dinner, snacks)
- [ ] Macronutrient tracking (protein, carbs, fat)
- [ ] Photo uploads for meals
- [ ] Barcode scanner integration
- [ ] Export data to CSV
- [x] PWA with offline support
- [ ] Dark mode theme
- [ ] Weight tracking over time

## License

MIT License - Feel free to use and modify for your needs.

## Support

For issues or feature requests, please open an issue on GitHub.

---

**Stay consistent, reach your goals!**
