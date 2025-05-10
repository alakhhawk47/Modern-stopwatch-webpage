window.addEventListener('DOMContentLoaded', () => {
    // Get DOM Elements
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const millisecondsEl = document.getElementById('milliseconds');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const lapBtn = document.getElementById('lapBtn');
    const lapsList = document.getElementById('lapsList');
    const lapsContainer = document.querySelector('.laps-container');
    const timeDisplayEl = document.querySelector('.time-display');

    // State Variables
    let startTime = 0;
    let elapsedTime = 0; // Time elapsed before pause
    let timerInterval = null; // To store setInterval ID
    let lapCounter = 1;
    let isRunning = false; // Track running state
    let lapTimes = []; // Store all lap times

    // Add button click effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95) translateY(2px)';
        });
        button.addEventListener('mouseup', () => {
            if (!button.disabled) {
                button.style.transform = 'scale(1.05) translateY(-3px)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 200);
            }
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });

    // Helper Function: Format Time (MM:SS:ms)
    function formatTime(time) {
        const totalMilliseconds = Math.floor(time);
        const totalSeconds = Math.floor(totalMilliseconds / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);

        const displayMilliseconds = String(Math.floor((totalMilliseconds % 1000) / 10)).padStart(2, '0'); // Show hundredths
        const displaySeconds = String(totalSeconds % 60).padStart(2, '0');
        const displayMinutes = String(totalMinutes % 60).padStart(2, '0'); // Can add hours if needed

        return {
            minutes: displayMinutes,
            seconds: displaySeconds,
            milliseconds: displayMilliseconds
        };
    }

    // Helper Function: Update Time Display
    function updateDisplay(time) {
        const formatted = formatTime(time);
        minutesEl.textContent = formatted.minutes;
        secondsEl.textContent = formatted.seconds;
        millisecondsEl.textContent = formatted.milliseconds;
    }

    // Animation for time display
    function pulseTimeDisplay() {
        timeDisplayEl.classList.add('pulse');
        setTimeout(() => {
            timeDisplayEl.classList.remove('pulse');
        }, 300);
    }

    // Helper Function: Create lap element with animation
    function createLapElement(number, time) {
        const li = document.createElement('li');
        const formattedTime = formatTime(time);
        
        li.innerHTML = `
            <span class="lap-number">Lap ${number}</span>
            <span class="lap-time">${formattedTime.minutes}:${formattedTime.seconds}:${formattedTime.milliseconds}</span>
        `;
        
        // Apply entrance animation
        li.style.opacity = '0';
        li.style.transform = 'translateX(-20px)';
        
        return li;
    }

    // Start Timer Function with visual feedback
    function startTimer() {
        if (isRunning) return; // Prevent multiple intervals

        // Add animation effect
        pulseTimeDisplay();
        
        isRunning = true;
        startTime = Date.now() - elapsedTime; // Adjust start time if resuming
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateDisplay(elapsedTime);
        }, 10); // Update every 10ms

        // Update button states
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        lapBtn.disabled = false;
        resetBtn.disabled = false;
        
        // Visual feedback
        timeDisplayEl.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.6)';
    }

    // Pause Timer Function with visual feedback
    function pauseTimer() {
        if (!isRunning) return;

        isRunning = false;
        clearInterval(timerInterval);
        
        // Visual feedback
        pulseTimeDisplay();
        timeDisplayEl.style.boxShadow = '0 0 20px rgba(255, 0, 204, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.6)';

        // Update button states
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        lapBtn.disabled = true;
        resetBtn.disabled = false;
    }

    // Reset Timer Function with visual feedback
    function resetTimer() {
        isRunning = false;
        clearInterval(timerInterval);
        timerInterval = null;
        elapsedTime = 0;
        startTime = 0;
        lapCounter = 1;
        lapTimes = [];

        // Visual feedback
        timeDisplayEl.classList.add('reset-flash');
        setTimeout(() => {
            timeDisplayEl.classList.remove('reset-flash');
            timeDisplayEl.style.boxShadow = 'inset 0 0 20px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 255, 255, 0.4)';
        }, 300);

        updateDisplay(0); // Reset display to 00:00:00
        
        // Clear laps with fade-out animation
        const existingLaps = lapsList.querySelectorAll('li');
        if (existingLaps.length > 0) {
            existingLaps.forEach((lap, index) => {
                setTimeout(() => {
                    lap.style.opacity = '0';
                    lap.style.transform = 'translateX(20px)';
                }, index * 50);
            });
            
            // Clear after animations complete
            setTimeout(() => {
                lapsList.innerHTML = '';
            }, existingLaps.length * 50 + 300);
        } else {
            lapsList.innerHTML = '';
        }

        // Update button states
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        lapBtn.disabled = true;
        resetBtn.disabled = true;
    }

    // Record Lap Function with improved animations
    function recordLap() {
        if (!isRunning && elapsedTime === 0) return; // Don't record if reset or never started

        const lapTime = elapsedTime; // Capture the current elapsed time
        lapTimes.push(lapTime);
        
        const li = createLapElement(lapCounter, lapTime);
        lapsList.appendChild(li);
        
        // Animate new lap entrance
        setTimeout(() => {
            li.style.opacity = '1';
            li.style.transform = 'translateX(0)';
        }, 10);
        
        // Add 'fastest' and 'slowest' indicators if we have more than 1 lap
        if (lapTimes.length > 1) {
            updateLapIndicators();
        }
        
        lapCounter++;

        // Auto-scroll laps container to the bottom with smooth animation
        lapsContainer.scrollTo({
            top: lapsContainer.scrollHeight,
            behavior: 'smooth'
        });
        
        // Visual feedback
        pulseTimeDisplay();
    }
    
    // Helper function to update fastest/slowest lap indicators
    function updateLapIndicators() {
        // Remove existing indicators
        const existingIndicators = lapsList.querySelectorAll('.lap-indicator');
        existingIndicators.forEach(indicator => indicator.remove());
        
        if (lapTimes.length <= 1) return;
        
        // Find fastest and slowest lap times
        const fastestLapTime = Math.min(...lapTimes);
        const slowestLapTime = Math.max(...lapTimes);
        
        // Add indicators to the appropriate laps
        const lapItems = lapsList.querySelectorAll('li');
        lapItems.forEach((lap, index) => {
            if (index >= lapTimes.length) return;
            
            if (lapTimes[index] === fastestLapTime && lapTimes.length > 1) {
                const indicator = document.createElement('span');
                indicator.className = 'lap-indicator fastest';
                indicator.textContent = 'FASTEST';
                indicator.style.color = '#00ff87';
                indicator.style.fontSize = '0.6em';
                indicator.style.marginLeft = '10px';
                indicator.style.fontWeight = 'bold';
                lap.querySelector('.lap-number').appendChild(indicator);
            }
            
            if (lapTimes[index] === slowestLapTime && lapTimes.length > 1) {
                const indicator = document.createElement('span');
                indicator.className = 'lap-indicator slowest';
                indicator.textContent = 'SLOWEST';
                indicator.style.color = '#ff5858';
                indicator.style.fontSize = '0.6em';
                indicator.style.marginLeft = '10px';
                indicator.style.fontWeight = 'bold';
                lap.querySelector('.lap-number').appendChild(indicator);
            }
        });
    }

    // Add a CSS class for the reset flash animation if it doesn't exist
    if (!document.querySelector('#reset-flash-style')) {
        const style = document.createElement('style');
        style.id = 'reset-flash-style';
        style.textContent = `
            @keyframes resetFlash {
                0% { background-color: rgba(0, 0, 0, 0.4); }
                50% { background-color: rgba(255, 0, 0, 0.2); }
                100% { background-color: rgba(0, 0, 0, 0.4); }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }
            
            .reset-flash {
                animation: resetFlash 0.3s ease-out;
            }
            
            .pulse {
                animation: pulse 0.3s ease-out;
            }
        `;
        document.head.appendChild(style);
    }

    // Add Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    lapBtn.addEventListener('click', recordLap);

    // Add keyboard controls
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case ' ': // Space bar
                e.preventDefault();
                if (isRunning) {
                    pauseTimer();
                } else {
                    startTimer();
                }
                break;
            case 'r': // 'r' key for reset
                resetTimer();
                break;
            case 'l': // 'l' key for lap
                if (isRunning) {
                    recordLap();
                }
                break;
        }
    });

    // Initial State Setup
    updateDisplay(0);
    pauseBtn.disabled = true;
    lapBtn.disabled = true;
    resetBtn.disabled = true;
    
    // Show keyboard shortcuts in console (could be displayed in the UI as well)
    console.log("Keyboard shortcuts: Space = Start/Pause, R = Reset, L = Lap");
});