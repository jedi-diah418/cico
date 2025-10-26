// Calorie Tracker App - Main JavaScript

// ============================================================================
// DATA STORAGE & STATE MANAGEMENT
// ============================================================================

class CalorieTracker {
    constructor() {
        this.currentDate = this.getTodayDate();
        this.userProfile = this.loadUserProfile();
        this.quickAddItems = this.loadQuickAddItems();
        this.dailyHistory = this.loadDailyHistory();
        this.todayEntries = this.loadTodayEntries();
        this.chart = null;
        this.chartPeriod = 30;

        this.init();
    }

    // Initialize the app
    init() {
        this.checkNewDay();
        this.setupEventListeners();
        this.updateUI();
        this.renderQuickAddButtons();
        this.renderFoodLog();
        this.renderQuickAddList();
        this.renderHistory();
        this.initChart();
        this.updateSettingsForm();
        this.updateBMRDisplay();
        this.checkWebShareSupport();
    }

    // Check if Web Share API is supported (iOS Safari, Android Chrome, etc.)
    checkWebShareSupport() {
        if (navigator.share) {
            const shareBtn = document.getElementById('shareDataBtn');
            if (shareBtn) {
                shareBtn.style.display = 'block';
            }
        }
    }

    // ========================================================================
    // DATE & DAY MANAGEMENT
    // ========================================================================

    getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    checkNewDay() {
        const today = this.getTodayDate();
        const lastDate = localStorage.getItem('lastActiveDate');

        if (lastDate && lastDate !== today) {
            // New day detected - archive previous day
            this.archivePreviousDay(lastDate);
            this.todayEntries = [];
            this.saveTodayEntries();
        }

        localStorage.setItem('lastActiveDate', today);
        this.currentDate = today;

        // Update date display
        document.getElementById('currentDate').textContent = this.formatDate(today);
    }

    archivePreviousDay(date) {
        const entries = this.loadFromStorage('todayEntries') || [];
        const total = entries.reduce((sum, entry) => sum + entry.calories, 0);

        if (entries.length > 0) {
            this.dailyHistory[date] = {
                total: total,
                entries: entries,
                goal: this.userProfile.dailyGoal,
                date: date
            };
            this.saveDailyHistory();
        }
    }

    // ========================================================================
    // LOCAL STORAGE OPERATIONS
    // ========================================================================

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            alert('Error saving data. Storage may be full.');
        }
    }

    loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return defaultValue;
        }
    }

    // User Profile
    loadUserProfile() {
        const defaultProfile = {
            weight: 200,
            height: 70,
            age: 30,
            gender: 'male',
            exerciseCalories: 75,
            bmr: 1850,
            dailyGoal: 1350
        };
        return this.loadFromStorage('userProfile', defaultProfile);
    }

    saveUserProfile() {
        this.saveToStorage('userProfile', this.userProfile);
    }

    // Quick Add Items
    loadQuickAddItems() {
        return this.loadFromStorage('quickAddItems', []);
    }

    saveQuickAddItems() {
        this.saveToStorage('quickAddItems', this.quickAddItems);
    }

    // Today's Entries
    loadTodayEntries() {
        return this.loadFromStorage('todayEntries', []);
    }

    saveTodayEntries() {
        this.saveToStorage('todayEntries', this.todayEntries);
    }

    // Daily History
    loadDailyHistory() {
        return this.loadFromStorage('dailyHistory', {});
    }

    saveDailyHistory() {
        this.saveToStorage('dailyHistory', this.dailyHistory);
    }

    // ========================================================================
    // BMR CALCULATION
    // ========================================================================

    calculateBMR(weight, height, age, gender) {
        // Convert lbs to kg, inches to cm
        const weightKg = weight * 0.453592;
        const heightCm = height * 2.54;

        // Mifflin-St Jeor Equation
        let bmr;
        if (gender === 'male') {
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
        } else {
            bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
        }

        return Math.round(bmr);
    }

    updateBMR() {
        const { weight, height, age, gender } = this.userProfile;
        this.userProfile.bmr = this.calculateBMR(weight, height, age || 30, gender);
        this.userProfile.dailyGoal = this.userProfile.bmr - 500;
        this.saveUserProfile();
    }

    // ========================================================================
    // CALORIE TRACKING
    // ========================================================================

    addFoodEntry(name, calories) {
        const entry = {
            id: Date.now(),
            name: name.trim(),
            calories: parseInt(calories),
            timestamp: new Date().toISOString()
        };

        this.todayEntries.push(entry);
        this.saveTodayEntries();
        this.updateUI();
        this.renderFoodLog();
    }

    deleteFoodEntry(id) {
        this.todayEntries = this.todayEntries.filter(entry => entry.id !== id);
        this.saveTodayEntries();
        this.updateUI();
        this.renderFoodLog();
    }

    getTodayTotal() {
        return this.todayEntries.reduce((sum, entry) => sum + entry.calories, 0);
    }

    getRemainingCalories() {
        return this.userProfile.dailyGoal - this.getTodayTotal();
    }

    // ========================================================================
    // QUICK ADD ITEMS
    // ========================================================================

    addQuickAddItem(name, calories) {
        const item = {
            id: Date.now(),
            name: name.trim(),
            calories: parseInt(calories)
        };

        this.quickAddItems.push(item);
        this.saveQuickAddItems();
        this.renderQuickAddButtons();
        this.renderQuickAddList();
    }

    deleteQuickAddItem(id) {
        this.quickAddItems = this.quickAddItems.filter(item => item.id !== id);
        this.saveQuickAddItems();
        this.renderQuickAddButtons();
        this.renderQuickAddList();
    }

    // ========================================================================
    // UI RENDERING
    // ========================================================================

    updateUI() {
        const total = this.getTodayTotal();
        const goal = this.userProfile.dailyGoal;
        const remaining = this.getRemainingCalories();
        const percentage = Math.min((total / goal) * 100, 100);

        // Update stats
        document.getElementById('dailyGoal').textContent = goal;
        document.getElementById('consumedCalories').textContent = total;
        document.getElementById('remainingCalories').textContent = remaining;

        // Update progress bar
        const progressBar = document.getElementById('progressBar');
        progressBar.style.setProperty('--progress', percentage + '%');

        // Color coding
        progressBar.classList.remove('warning', 'danger');
        if (percentage >= 100) {
            progressBar.classList.add('danger');
        } else if (percentage >= 80) {
            progressBar.classList.add('warning');
        }

        // Update progress text
        document.getElementById('progressText').textContent =
            `${Math.round(percentage)}% of daily goal`;
    }

    renderQuickAddButtons() {
        const grid = document.getElementById('quickAddGrid');

        if (this.quickAddItems.length === 0) {
            grid.innerHTML = '<p class="empty-message">No quick-add items yet. Add some in the Quick Add tab!</p>';
            return;
        }

        grid.innerHTML = this.quickAddItems.map(item => `
            <button class="quick-add-btn" data-id="${item.id}" data-name="${item.name}" data-calories="${item.calories}">
                <span class="name">${item.name}</span>
                <span class="calories">${item.calories} cal</span>
            </button>
        `).join('');
    }

    renderFoodLog() {
        const log = document.getElementById('foodLog');

        if (this.todayEntries.length === 0) {
            log.innerHTML = '<p class="empty-message">No items added yet today.</p>';
            return;
        }

        log.innerHTML = this.todayEntries
            .sort((a, b) => b.id - a.id) // Most recent first
            .map(entry => {
                const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                });
                return `
                    <div class="log-item">
                        <div class="log-item-info">
                            <div class="log-item-name">${entry.name}</div>
                            <div class="log-item-time">${time}</div>
                        </div>
                        <span class="log-item-calories">${entry.calories}</span>
                        <button class="delete-btn" data-id="${entry.id}">Delete</button>
                    </div>
                `;
            }).join('');
    }

    renderQuickAddList() {
        const list = document.getElementById('quickAddList');

        if (this.quickAddItems.length === 0) {
            list.innerHTML = '<p class="empty-message">No saved items yet.</p>';
            return;
        }

        list.innerHTML = this.quickAddItems.map(item => `
            <div class="quick-add-item">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                </div>
                <span class="item-calories">${item.calories} cal</span>
                <button class="delete-btn" data-id="${item.id}">Delete</button>
            </div>
        `).join('');
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        const entries = Object.values(this.dailyHistory).sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        if (entries.length === 0) {
            historyList.innerHTML = '<p class="empty-message">No history yet. Start tracking today!</p>';
            return;
        }

        historyList.innerHTML = entries.map(day => {
            const percentage = (day.total / day.goal) * 100;
            let statusClass = 'success';
            let statusText = 'On Track';

            if (percentage >= 100) {
                statusClass = 'danger';
                statusText = 'Over Goal';
            } else if (percentage >= 90) {
                statusClass = 'warning';
                statusText = 'Near Goal';
            }

            return `
                <div class="history-item">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div>
                            <div class="history-date">${this.formatDate(day.date)}</div>
                            <div class="history-goal">Goal: ${day.goal} cal</div>
                        </div>
                        <div style="text-align: right;">
                            <div class="history-total">${day.total} cal</div>
                            <span class="history-status ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========================================================================
    // CHART & VISUALIZATION
    // ========================================================================

    initChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        this.updateChart(this.chartPeriod);
    }

    updateChart(days) {
        this.chartPeriod = days;

        // Get historical data
        let entries = Object.values(this.dailyHistory).sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });

        // Filter by period
        if (days !== 'all') {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            entries = entries.filter(day => new Date(day.date) >= cutoffDate);
        }

        // Prepare chart data
        const labels = entries.map(day => this.formatDate(day.date).split(',')[0]);
        const data = entries.map(day => day.total);
        const goalLine = entries.map(day => day.goal);

        // Calculate average
        const average = entries.length > 0
            ? Math.round(data.reduce((sum, val) => sum + val, 0) / data.length)
            : 0;

        document.getElementById('avgCalories').textContent = average + ' cal';
        document.getElementById('daysTracked').textContent = entries.length;

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        const ctx = document.getElementById('trendChart');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Calories Consumed',
                        data: data,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.3,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Daily Goal',
                        data: goalLine,
                        borderColor: '#FF9800',
                        borderDash: [5, 5],
                        borderWidth: 2,
                        fill: false,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Calories'
                        }
                    }
                }
            }
        });
    }

    updateSettingsForm() {
        document.getElementById('weight').value = this.userProfile.weight;
        document.getElementById('height').value = this.userProfile.height;
        document.getElementById('age').value = this.userProfile.age || '';
        document.getElementById('gender').value = this.userProfile.gender;
        document.getElementById('exerciseCalories').value = this.userProfile.exerciseCalories;
    }

    updateBMRDisplay() {
        document.getElementById('bmrValue').textContent = this.userProfile.bmr;
        document.getElementById('goalValue').textContent = this.userProfile.dailyGoal;
    }

    // ========================================================================
    // EVENT LISTENERS
    // ========================================================================

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                this.switchTab(targetTab);
            });
        });

        // Add food form
        document.getElementById('addFoodForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('foodName').value;
            const calories = document.getElementById('foodCalories').value;

            if (name && calories) {
                this.addFoodEntry(name, calories);
                e.target.reset();
            }
        });

        // Quick add buttons (delegated)
        document.getElementById('quickAddGrid').addEventListener('click', (e) => {
            const btn = e.target.closest('.quick-add-btn');
            if (btn) {
                const name = btn.dataset.name;
                const calories = btn.dataset.calories;
                this.addFoodEntry(name, calories);

                // Visual feedback
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = 'scale(1)', 150);
            }
        });

        // Delete food entry (delegated)
        document.getElementById('foodLog').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const id = parseInt(e.target.dataset.id);
                this.deleteFoodEntry(id);
            }
        });

        // Save quick add item form
        document.getElementById('saveQuickAddForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('quickAddName').value;
            const calories = document.getElementById('quickAddCalories').value;

            if (name && calories) {
                this.addQuickAddItem(name, calories);
                e.target.reset();
            }
        });

        // Delete quick add item (delegated)
        document.getElementById('quickAddList').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const id = parseInt(e.target.dataset.id);
                this.deleteQuickAddItem(id);
            }
        });

        // Settings form
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.userProfile.weight = parseFloat(document.getElementById('weight').value);
            this.userProfile.height = parseFloat(document.getElementById('height').value);
            this.userProfile.age = parseInt(document.getElementById('age').value) || 30;
            this.userProfile.gender = document.getElementById('gender').value;
            this.userProfile.exerciseCalories = parseInt(document.getElementById('exerciseCalories').value) || 0;

            this.updateBMR();
            this.updateUI();
            this.updateBMRDisplay();

            alert('Settings saved successfully!');
        });

        // Chart period buttons
        document.querySelectorAll('.chart-controls .btn-small').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-controls .btn-small').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                const period = e.target.dataset.period;
                this.updateChart(period === 'all' ? 'all' : parseInt(period));
            });
        });

        // Share backup (iOS/Android native share sheet)
        const shareBtn = document.getElementById('shareDataBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareData();
            });
        }

        // Export data (download)
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Copy backup to clipboard
        document.getElementById('copyDataBtn').addEventListener('click', () => {
            this.copyDataToClipboard();
        });

        // Import from file
        document.getElementById('importFile').addEventListener('change', (e) => {
            this.handleFileImport(e);
        });

        // Paste backup from clipboard
        document.getElementById('pasteDataBtn').addEventListener('click', () => {
            this.pasteDataFromClipboard();
        });

        // Clear data
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                localStorage.clear();
                location.reload();
            }
        });

        // Check for new day periodically (every minute)
        setInterval(() => {
            this.checkNewDay();
        }, 60000);
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Refresh chart if switching to history
        if (tabName === 'history') {
            this.renderHistory();
            this.updateChart(this.chartPeriod);
        }
    }

    // ========================================================================
    // DATA EXPORT & IMPORT
    // ========================================================================

    getBackupData() {
        return {
            version: '1.0',
            userProfile: this.userProfile,
            quickAddItems: this.quickAddItems,
            dailyHistory: this.dailyHistory,
            todayEntries: this.todayEntries,
            exportDate: new Date().toISOString()
        };
    }

    exportData() {
        const data = this.getBackupData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `calorie-tracker-backup-${this.getTodayDate()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        alert('Backup downloaded successfully! Save this file in a safe place.');
    }

    async shareData() {
        try {
            const data = this.getBackupData();
            const jsonString = JSON.stringify(data, null, 2);
            const fileName = `calorie-tracker-backup-${this.getTodayDate()}.json`;

            // Try sharing as a file first (better for iOS Notes)
            if (navigator.canShare) {
                const file = new File([jsonString], fileName, { type: 'application/json' });

                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Calorie Tracker Backup',
                        text: `Backup from ${this.formatDate(this.getTodayDate())}`
                    });
                    return;
                }
            }

            // Fallback to sharing text (still works with Notes app)
            await navigator.share({
                title: 'Calorie Tracker Backup',
                text: `Calorie Tracker Backup - ${this.formatDate(this.getTodayDate())}\n\n${jsonString}`
            });

        } catch (err) {
            // User cancelled or share failed
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
                // Fallback to copy
                this.copyDataToClipboard();
            }
        }
    }

    async copyDataToClipboard() {
        try {
            const data = this.getBackupData();
            const jsonString = JSON.stringify(data, null, 2);
            await navigator.clipboard.writeText(jsonString);
            alert('Backup copied to clipboard!\n\nPaste it into a note app or email to save it.');
        } catch (err) {
            alert('Failed to copy to clipboard. Try the Download option instead.');
            console.error('Copy failed:', err);
        }
    }

    async pasteDataFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            const data = JSON.parse(text);
            this.importData(data);
        } catch (err) {
            alert('Failed to paste backup. Make sure you copied valid backup data.\n\nError: ' + err.message);
            console.error('Paste failed:', err);
        }
    }

    importData(data) {
        try {
            // Validate data structure
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid backup format');
            }

            // Confirm with user before overwriting
            const confirmMsg = `This will restore your backup from ${data.exportDate ? new Date(data.exportDate).toLocaleString() : 'unknown date'}.\n\nYour current data will be replaced. Continue?`;

            if (!confirm(confirmMsg)) {
                return;
            }

            // Import data with version handling
            if (data.userProfile) {
                this.userProfile = data.userProfile;
                this.saveUserProfile();
            }

            if (data.quickAddItems) {
                this.quickAddItems = data.quickAddItems;
                this.saveQuickAddItems();
            }

            if (data.dailyHistory) {
                this.dailyHistory = data.dailyHistory;
                this.saveDailyHistory();
            }

            if (data.todayEntries) {
                this.todayEntries = data.todayEntries;
                this.saveTodayEntries();
            }

            // Refresh UI
            this.updateUI();
            this.renderQuickAddButtons();
            this.renderFoodLog();
            this.renderQuickAddList();
            this.renderHistory();
            this.updateSettingsForm();
            this.updateBMRDisplay();
            if (this.chart) {
                this.updateChart(this.chartPeriod);
            }

            alert('Backup restored successfully! All your data is back.');
        } catch (err) {
            alert('Failed to import backup. Please check the file format.\n\nError: ' + err.message);
            console.error('Import failed:', err);
        }
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.importData(data);
            } catch (err) {
                alert('Failed to read backup file. Please check the file format.');
                console.error('File read failed:', err);
            }
        };
        reader.readAsText(file);

        // Reset input so same file can be imported again
        event.target.value = '';
    }
}

// ============================================================================
// PWA & SERVICE WORKER MANAGEMENT
// ============================================================================

class PWAManager {
    constructor() {
        this.swRegistration = null;
        this.deferredPrompt = null;
        this.appVersion = '1.0.0';

        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOfflineDetection();
        this.setupEventListeners();
        this.updateAppStatus();
    }

    // Register service worker for offline functionality
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('./service-worker.js');
                console.log('[PWA] Service Worker registered successfully');

                // Check for updates periodically
                setInterval(() => {
                    this.swRegistration.update();
                }, 60000); // Check every minute

                // Listen for service worker updates
                this.swRegistration.addEventListener('updatefound', () => {
                    const newWorker = this.swRegistration.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available
                            this.showUpdateAvailable();
                        }
                    });
                });

                // Update app status
                this.updateAppStatus();
            } catch (error) {
                console.error('[PWA] Service Worker registration failed:', error);
                this.updateAppStatus();
            }
        } else {
            console.warn('[PWA] Service Workers not supported');
            this.updateAppStatus();
        }
    }

    // Setup install prompt (Add to Home Screen)
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;

            // Show install prompt after a delay
            setTimeout(() => {
                const dismissed = localStorage.getItem('installPromptDismissed');
                if (!dismissed) {
                    this.showInstallPrompt();
                }
            }, 3000);

            // Show install button in settings
            const installAppBtn = document.getElementById('installAppBtn');
            if (installAppBtn) {
                installAppBtn.style.display = 'block';
            }
        });

        // Detect if app was installed
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed successfully');
            this.deferredPrompt = null;
            this.hideInstallPrompt();

            const installAppBtn = document.getElementById('installAppBtn');
            if (installAppBtn) {
                installAppBtn.style.display = 'none';
            }
        });
    }

    // Setup online/offline detection
    setupOfflineDetection() {
        const updateOnlineStatus = () => {
            const indicator = document.getElementById('offlineIndicator');
            const appModeElement = document.getElementById('appMode');

            if (navigator.onLine) {
                if (indicator) indicator.style.display = 'none';
                if (appModeElement) {
                    appModeElement.textContent = '🌐 Online';
                    appModeElement.classList.remove('offline');
                    appModeElement.classList.add('online');
                }
            } else {
                if (indicator) indicator.style.display = 'inline-block';
                if (appModeElement) {
                    appModeElement.textContent = '📴 Offline';
                    appModeElement.classList.remove('online');
                    appModeElement.classList.add('offline');
                }
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    }

    setupEventListeners() {
        // Check for updates button
        const checkUpdateBtn = document.getElementById('checkUpdateBtn');
        if (checkUpdateBtn) {
            checkUpdateBtn.addEventListener('click', () => {
                this.checkForUpdates();
            });
        }

        // Install app button (in banner)
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.addEventListener('click', () => {
                this.installApp();
            });
        }

        // Dismiss install prompt
        const dismissBtn = document.getElementById('dismissInstallBtn');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                this.hideInstallPrompt();
                localStorage.setItem('installPromptDismissed', 'true');
            });
        }

        // Install app button (in settings)
        const installAppBtn = document.getElementById('installAppBtn');
        if (installAppBtn) {
            installAppBtn.addEventListener('click', () => {
                this.installApp();
            });
        }
    }

    async checkForUpdates() {
        const statusElement = document.getElementById('updateStatus');
        const checkBtn = document.getElementById('checkUpdateBtn');

        if (statusElement) statusElement.textContent = 'Checking...';
        if (checkBtn) checkBtn.disabled = true;

        try {
            if (this.swRegistration) {
                await this.swRegistration.update();

                setTimeout(() => {
                    if (statusElement) {
                        if (navigator.serviceWorker.controller) {
                            statusElement.textContent = '✅ Up to date';
                        } else {
                            statusElement.textContent = '🔄 Update available - Reload to update';
                        }
                    }
                    if (checkBtn) checkBtn.disabled = false;
                }, 1000);
            } else {
                if (statusElement) statusElement.textContent = '⚠️ Updates not available (no service worker)';
                if (checkBtn) checkBtn.disabled = false;
            }
        } catch (error) {
            console.error('[PWA] Update check failed:', error);
            if (statusElement) statusElement.textContent = '❌ Check failed';
            if (checkBtn) checkBtn.disabled = false;
        }
    }

    showUpdateAvailable() {
        const statusElement = document.getElementById('updateStatus');
        if (statusElement) {
            statusElement.textContent = '🔄 Update available!';
        }

        if (confirm('A new version is available! Reload to update?')) {
            window.location.reload();
        }
    }

    showInstallPrompt() {
        const prompt = document.getElementById('installPrompt');
        if (prompt) {
            prompt.style.display = 'block';
        }
    }

    hideInstallPrompt() {
        const prompt = document.getElementById('installPrompt');
        if (prompt) {
            prompt.style.display = 'none';
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            alert('App is already installed or cannot be installed on this device.');
            return;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('[PWA] User accepted install');
            this.hideInstallPrompt();
        }

        this.deferredPrompt = null;
    }

    updateAppStatus() {
        const appVersionElement = document.getElementById('appVersion');
        const updateStatusElement = document.getElementById('updateStatus');

        if (appVersionElement) {
            appVersionElement.textContent = this.appVersion;
        }

        if (updateStatusElement) {
            if ('serviceWorker' in navigator) {
                updateStatusElement.textContent = '✅ Offline-ready';
            } else {
                updateStatusElement.textContent = '⚠️ Offline mode not supported';
            }
        }
    }
}

// ============================================================================
// INITIALIZE APP
// ============================================================================

let app;
let pwaManager;

document.addEventListener('DOMContentLoaded', () => {
    app = new CalorieTracker();
    pwaManager = new PWAManager();
});
