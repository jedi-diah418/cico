# Calorie Tracker

A simple, elegant calorie tracking web application with robust backup and restore functionality.

## Features

- **Track Daily Calories**: Add foods with their calorie counts
- **Daily Goal Management**: Monitor your progress against a daily calorie goal
- **Backup & Restore**: Export and import your data with robust error handling
- **Local Storage**: Automatically saves your data locally

## How to Use

1. Open `index.html` in your web browser
2. Add foods by entering the name and calorie count
3. Track your daily progress
4. Use the backup feature to export your data

## Backup & Restore

### Creating a Backup

1. Click the "Copy Backup" button
2. Your backup data will be copied to the clipboard
3. Save it somewhere safe (notes app, email, etc.)

### Restoring from Backup

1. Click the "Paste Backup" button
2. Paste your backup data into the text area
3. Click "Restore"

## Backup Error Handling

The application now includes comprehensive error handling for backup restoration:

- **Whitespace trimming**: Automatically removes leading/trailing whitespace
- **JSON validation**: Verifies the backup data is valid JSON
- **Structure validation**: Ensures all required fields are present
- **Data validation**: Checks that foods array and daily goal are valid
- **User-friendly error messages**: Clear feedback when backup fails

### Fixed Issues

- **JSON Parse Error**: The app now properly handles JSON parsing errors with clear error messages
- **Empty Input**: Validates that backup data is not empty before attempting to parse
- **Invalid Format**: Checks for proper backup structure and provides specific error messages
- **Corrupted Data**: Validates each food item to ensure data integrity

## Technical Details

- Pure JavaScript (no frameworks required)
- CSS3 with gradient backgrounds and modern styling
- LocalStorage for data persistence
- Responsive design for mobile and desktop

## Browser Support

Works in all modern browsers that support:
- LocalStorage
- ES6 JavaScript
- Clipboard API

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and layout
- `app.js` - Application logic and backup functionality
