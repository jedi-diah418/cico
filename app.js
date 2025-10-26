// Calorie Tracker Application

class CalorieTracker {
    constructor() {
        this.foods = [];
        this.dailyGoal = 2000;
        this.loadFromLocalStorage();
        this.initEventListeners();
        this.render();
    }

    initEventListeners() {
        // Food form submission
        document.getElementById('food-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addFood();
        });

        // Backup buttons
        document.getElementById('copy-backup').addEventListener('click', () => {
            this.copyBackup();
        });

        document.getElementById('paste-backup').addEventListener('click', () => {
            this.openPasteModal();
        });

        // Modal buttons
        document.getElementById('restore-btn').addEventListener('click', () => {
            this.restoreBackup();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closePasteModal();
        });

        // Close modal on outside click
        document.getElementById('paste-modal').addEventListener('click', (e) => {
            if (e.target.id === 'paste-modal') {
                this.closePasteModal();
            }
        });
    }

    addFood() {
        const nameInput = document.getElementById('food-name');
        const caloriesInput = document.getElementById('food-calories');

        const food = {
            id: Date.now(),
            name: nameInput.value.trim(),
            calories: parseInt(caloriesInput.value),
            timestamp: new Date().toISOString()
        };

        this.foods.push(food);
        this.saveToLocalStorage();
        this.render();

        // Clear form
        nameInput.value = '';
        caloriesInput.value = '';
        nameInput.focus();
    }

    deleteFood(id) {
        this.foods = this.foods.filter(food => food.id !== id);
        this.saveToLocalStorage();
        this.render();
    }

    getTotalCalories() {
        return this.foods.reduce((total, food) => total + food.calories, 0);
    }

    render() {
        const totalCalories = this.getTotalCalories();
        const remaining = this.dailyGoal - totalCalories;

        // Update stats
        document.getElementById('total-calories').textContent = totalCalories;
        document.getElementById('daily-goal').textContent = this.dailyGoal;
        document.getElementById('remaining-calories').textContent = remaining;

        // Update remaining color
        const remainingEl = document.getElementById('remaining-calories');
        remainingEl.style.color = remaining >= 0 ? '#fff' : '#ff6b6b';

        // Render food list
        const foodsList = document.getElementById('foods');
        foodsList.innerHTML = '';

        if (this.foods.length === 0) {
            foodsList.innerHTML = '<li style="text-align: center; color: #999;">No foods added yet</li>';
            return;
        }

        this.foods.forEach(food => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="food-info">
                    <span class="food-name">${this.escapeHtml(food.name)}</span>
                    <span class="food-calories">${food.calories} cal</span>
                </div>
                <button onclick="tracker.deleteFood(${food.id})">Delete</button>
            `;
            foodsList.appendChild(li);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveToLocalStorage() {
        localStorage.setItem('calorieTrackerData', JSON.stringify({
            foods: this.foods,
            dailyGoal: this.dailyGoal
        }));
    }

    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('calorieTrackerData');
            if (data) {
                const parsed = JSON.parse(data);
                this.foods = parsed.foods || [];
                this.dailyGoal = parsed.dailyGoal || 2000;
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
        }
    }

    copyBackup() {
        const backupData = {
            version: 1,
            timestamp: new Date().toISOString(),
            data: {
                foods: this.foods,
                dailyGoal: this.dailyGoal
            }
        };

        const backupString = JSON.stringify(backupData);

        // Copy to clipboard
        navigator.clipboard.writeText(backupString).then(() => {
            this.showStatus('Backup copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            this.fallbackCopy(backupString);
        });
    }

    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            this.showStatus('Backup copied to clipboard!', 'success');
        } catch (error) {
            this.showStatus('Failed to copy backup. Please copy manually.', 'error');
        }

        document.body.removeChild(textarea);
    }

    openPasteModal() {
        document.getElementById('paste-modal').classList.add('active');
        document.getElementById('backup-input').value = '';
        document.getElementById('paste-error').classList.remove('active');
        document.getElementById('backup-input').focus();
    }

    closePasteModal() {
        document.getElementById('paste-modal').classList.remove('active');
    }

    restoreBackup() {
        const input = document.getElementById('backup-input').value;
        const errorEl = document.getElementById('paste-error');

        // Clear previous error
        errorEl.classList.remove('active');

        // Validate and parse backup
        const result = this.parseBackupData(input);

        if (!result.success) {
            errorEl.textContent = result.error;
            errorEl.classList.add('active');
            return;
        }

        // Restore data
        try {
            this.foods = result.data.foods;
            this.dailyGoal = result.data.dailyGoal;
            this.saveToLocalStorage();
            this.render();
            this.closePasteModal();
            this.showStatus('Backup restored successfully!', 'success');
        } catch (error) {
            errorEl.textContent = 'Failed to restore backup. Please try again.';
            errorEl.classList.add('active');
        }
    }

    parseBackupData(input) {
        // Step 1: Validate input is not empty
        if (!input || input.trim() === '') {
            return {
                success: false,
                error: 'Backup data is empty. Please paste valid backup data.'
            };
        }

        // Step 2: Clean the input (trim whitespace)
        const cleanedInput = input.trim();

        // Step 3: Try to parse JSON
        let parsed;
        try {
            parsed = JSON.parse(cleanedInput);
        } catch (parseError) {
            return {
                success: false,
                error: 'Failed to paste backup. Make sure you copied valid backup data.\nError: JSON Parse error: Unable to parse JSON string'
            };
        }

        // Step 4: Validate backup structure
        if (!parsed || typeof parsed !== 'object') {
            return {
                success: false,
                error: 'Invalid backup format. Backup must be a valid JSON object.'
            };
        }

        // Step 5: Check for version and data fields
        if (!parsed.data) {
            return {
                success: false,
                error: 'Invalid backup format. Missing "data" field.'
            };
        }

        // Step 6: Validate data structure
        const { foods, dailyGoal } = parsed.data;

        if (!Array.isArray(foods)) {
            return {
                success: false,
                error: 'Invalid backup format. "foods" must be an array.'
            };
        }

        if (typeof dailyGoal !== 'number' || dailyGoal < 0) {
            return {
                success: false,
                error: 'Invalid backup format. "dailyGoal" must be a positive number.'
            };
        }

        // Step 7: Validate each food item
        for (let i = 0; i < foods.length; i++) {
            const food = foods[i];

            if (!food || typeof food !== 'object') {
                return {
                    success: false,
                    error: `Invalid food item at position ${i + 1}.`
                };
            }

            if (!food.name || typeof food.name !== 'string') {
                return {
                    success: false,
                    error: `Invalid food name at position ${i + 1}.`
                };
            }

            if (typeof food.calories !== 'number' || food.calories < 0) {
                return {
                    success: false,
                    error: `Invalid calories value at position ${i + 1}.`
                };
            }

            // Ensure required fields
            if (!food.id) {
                food.id = Date.now() + i;
            }

            if (!food.timestamp) {
                food.timestamp = new Date().toISOString();
            }
        }

        // Step 8: Return validated data
        return {
            success: true,
            data: {
                foods: foods,
                dailyGoal: dailyGoal
            }
        };
    }

    showStatus(message, type) {
        const statusEl = document.getElementById('backup-status');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        statusEl.style.display = 'block';

        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    }
}

// Initialize the app
const tracker = new CalorieTracker();
