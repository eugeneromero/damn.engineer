// Data is loaded from data.js into window.workoutProgram

// State
const state = {
    currentPhaseIndex: 0,
    currentWeek: 1,
    currentPhaseIndex: 0,
    currentWeek: 1,
    completedExercises: JSON.parse(localStorage.getItem('workoutTracker_completed')) || {},
    exerciseWeights: JSON.parse(localStorage.getItem('workoutTracker_weights')) || {}
};

// DOM Elements
const elements = {
    prevPhaseBtn: document.getElementById('prev-phase'),
    nextPhaseBtn: document.getElementById('next-phase'),
    currentPhaseName: document.getElementById('current-phase-name'),
    currentPhaseDates: document.getElementById('current-phase-dates'),
    weekSelector: document.getElementById('week-selector'),
    workoutView: document.getElementById('workout-view'),
    resetBtn: document.getElementById('reset-data'),
    // Modal Elements
    modal: document.getElementById('reset-modal'),
    cancelResetBtn: document.getElementById('cancel-reset'),
    confirmResetBtn: document.getElementById('confirm-reset')
};

// Init
function init() {
    renderPhaseInfo();
    renderWeekSelector();
    renderWorkouts();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    elements.prevPhaseBtn.addEventListener('click', () => changePhase(-1));
    elements.nextPhaseBtn.addEventListener('click', () => changePhase(1));
    elements.resetBtn.addEventListener('click', openResetModal);
    elements.cancelResetBtn.addEventListener('click', closeResetModal);
    elements.confirmResetBtn.addEventListener('click', confirmReset);

    // Close modal if clicking outside
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) closeResetModal();
    });
}

// Logic
function changePhase(direction) {
    const newIndex = state.currentPhaseIndex + direction;
    if (newIndex >= 0 && newIndex < workoutProgram.phases.length) {
        state.currentPhaseIndex = newIndex;
        // Set week to the first week of the new phase
        state.currentWeek = workoutProgram.phases[newIndex].weeks[0];
        renderPhaseInfo();
        renderWeekSelector();
        renderWorkouts();
    }
}

function changeWeek(week) {
    state.currentWeek = week;
    renderWeekSelector();
    renderWorkouts();
}

function toggleExercise(dayKey, exerciseIndex) {
    const key = `p${state.currentPhaseIndex + 1}_w${state.currentWeek}_${dayKey}_e${exerciseIndex}`;

    if (state.completedExercises[key]) {
        delete state.completedExercises[key];
    } else {
        state.completedExercises[key] = true;
    }

    localStorage.setItem('workoutTracker_completed', JSON.stringify(state.completedExercises));
    renderWorkouts(); // Re-render to update UI
}

function saveWeight(dayKey, exerciseIndex, value) {
    const key = `p${state.currentPhaseIndex + 1}_w${state.currentWeek}_${dayKey}_e${exerciseIndex}`;

    if (value.trim() === '') {
        delete state.exerciseWeights[key];
    } else {
        state.exerciseWeights[key] = value;
    }

    localStorage.setItem('workoutTracker_weights', JSON.stringify(state.exerciseWeights));
}

function openResetModal() {
    elements.modal.classList.remove('hidden');
}

function closeResetModal() {
    elements.modal.classList.add('hidden');
}

function confirmReset() {
    state.completedExercises = {};
    state.exerciseWeights = {};
    localStorage.removeItem('workoutTracker_completed');
    localStorage.removeItem('workoutTracker_weights');
    renderWorkouts();
    closeResetModal();
}

// Rendering
function renderPhaseInfo() {
    const phase = workoutProgram.phases[state.currentPhaseIndex];
    elements.currentPhaseName.textContent = `${phase.name}`;
    elements.currentPhaseDates.textContent = phase.duration;

    // Disable buttons if at ends
    elements.prevPhaseBtn.disabled = state.currentPhaseIndex === 0;
    elements.prevPhaseBtn.style.opacity = state.currentPhaseIndex === 0 ? '0.3' : '1';

    elements.nextPhaseBtn.disabled = state.currentPhaseIndex === workoutProgram.phases.length - 1;
    elements.nextPhaseBtn.style.opacity = state.currentPhaseIndex === workoutProgram.phases.length - 1 ? '0.3' : '1';
}

function renderWeekSelector() {
    const phase = workoutProgram.phases[state.currentPhaseIndex];
    elements.weekSelector.innerHTML = '';

    phase.weeks.forEach(week => {
        const btn = document.createElement('button');
        btn.className = `week-btn ${week === state.currentWeek ? 'active' : ''}`;
        btn.textContent = `Week ${week}`;
        btn.onclick = () => changeWeek(week);
        elements.weekSelector.appendChild(btn);
    });
}

function renderWorkouts() {
    const phase = workoutProgram.phases[state.currentPhaseIndex];
    const schedule = phase.schedule;
    elements.workoutView.innerHTML = '';

    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayNames = {
        mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
        fri: 'Friday', sat: 'Saturday', sun: 'Sunday'
    };

    days.forEach(dayKey => {
        const dayData = schedule[dayKey];
        if (!dayData) return;

        const card = document.createElement('div');
        card.className = 'day-card';

        // Header
        const header = document.createElement('div');
        header.className = 'day-header';
        header.innerHTML = `
            <div class="day-title">
                <h3>${dayNames[dayKey]}</h3>
                <div class="day-meta">
                    <span class="day-tag ${dayData.type.toLowerCase()}">${dayData.type}</span>
                    <span>${dayData.focus}</span>
                </div>
            </div>
        `;
        card.appendChild(header);

        // Content
        if (dayData.type === 'Rest') {
            card.innerHTML += `<p style="color: var(--text-secondary); font-style: italic;">Rest & Recovery</p>`;
        } else {
            const list = document.createElement('ul');
            list.className = 'exercise-list';

            // Handle Variations (e.g. Week 1-2 vs 3-4)
            let exercisesToRender = [];
            let notes = dayData.note || dayData.description || '';

            if (dayData.exercises) {
                // Standard exercises
                exercisesToRender = dayData.exercises;
            } else if (dayData.variations) {
                // Variations based on week
                const variation = dayData.variations.find(v => v.weeks.includes(state.currentWeek));
                if (variation) {
                    exercisesToRender = variation.options.map(opt => ({ name: opt, sets: '-', weight: '-' }));
                }
            } else if (dayData.options) {
                // Simple options list
                exercisesToRender = dayData.options.map(opt => ({ name: opt, sets: '-', weight: '-' }));
            }

            // Handle Progression (e.g. jogging time increases)
            if (dayData.progression && dayData.progression[state.currentWeek]) {
                const prog = dayData.progression[state.currentWeek];
                exercisesToRender = [{ name: prog, sets: 'Intervals', weight: '-' }, ...exercisesToRender];
            }

            // Render the list
            exercisesToRender.forEach((ex, index) => {
                const key = `p${state.currentPhaseIndex + 1}_w${state.currentWeek}_${dayKey}_e${index}`;
                const isCompleted = state.completedExercises[key];

                const li = document.createElement('li');
                li.className = `exercise-item ${isCompleted ? 'completed' : ''}`;
                const savedWeight = state.exerciseWeights[key] || '';

                li.innerHTML = `
                    <div class="checkbox" onclick="toggleExercise('${dayKey}', ${index})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div class="exercise-details" onclick="toggleExercise('${dayKey}', ${index})">
                        <div class="exercise-name">${ex.name}</div>
                        <div class="exercise-meta">${ex.sets !== '-' ? ex.sets : ''} ${ex.weight && ex.weight !== '-' ? ' • ' + ex.weight : ''}</div>
                    </div>
                    <div class="weight-input-container" onclick="event.stopPropagation()">
                        <input type="text" class="weight-input" placeholder="Weight" value="${savedWeight}" onchange="saveWeight('${dayKey}', ${index}, this.value)">
                    </div>
                `;
                list.appendChild(li);
            });

            // Expose functions to global scope for inline event handlers
            window.toggleExercise = toggleExercise;
            window.saveWeight = saveWeight;

            card.appendChild(list);

            if (notes) {
                const noteEl = document.createElement('p');
                noteEl.style.marginTop = '16px';
                noteEl.style.fontSize = '0.85rem';
                noteEl.style.color = 'var(--text-secondary)';
                noteEl.textContent = `Note: ${notes}`;
                card.appendChild(noteEl);
            }
        }

        elements.workoutView.appendChild(card);
    });
}

// Start
init();
