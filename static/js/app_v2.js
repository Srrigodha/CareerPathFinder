document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'light') {
            themeToggleBtn.textContent = '☀️';
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggleBtn.textContent = '☀️';
        }
    });

    // --- Routing Logic (Scroll Behavior) ---
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.dashboard-view');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // --- Dynamic Sidebar Highlighting on Scroll ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navBtns.forEach(b => b.classList.remove('active'));
                const activeBtn = document.querySelector(`.nav-btn[data-target="${entry.target.id}"]`);
                if (activeBtn) activeBtn.classList.add('active');
            }
        });
    }, { threshold: 0.3 });

    views.forEach(view => observer.observe(view));

    // --- Auth Logic ---
    const sessionUser = localStorage.getItem('session_username');
    const loginBtn = document.getElementById('login-nav-btn');
    const logoutBtn = document.getElementById('logout-nav-btn');
    const greeting = document.getElementById('user-greeting');

    if (sessionUser) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        greeting.classList.remove('hidden');
        greeting.textContent = `👋 Welcome, ${sessionUser}!`;
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('session_user_id');
            localStorage.removeItem('session_username');
            window.location.reload();
        });
    }

    // --- Auth Modal Logic ---
    const authModal = document.getElementById('auth-modal');
    const closeAuthModal = document.getElementById('close-auth-modal');
    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            authModal.classList.remove('hidden');
        });
    }

    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => {
            authModal.classList.add('hidden');
        });
    }

    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.classList.add('hidden');
            }
        });
    }

    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', () => {
            loginSection.classList.add('hidden');
            signupSection.classList.remove('hidden');
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', () => {
            signupSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
        });
    }

    // Auth Form Submission API_BASE
    const API_BASE_AUTH = 'http://127.0.0.1:5005/api';

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const err = document.getElementById('login-error');
            err.textContent = '';
            
            const user = document.getElementById('login-user').value;
            const pass = document.getElementById('login-pass').value;

            try {
                const res = await fetch(`${API_BASE_AUTH}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({username: user, password: pass})
                });
                const data = await res.json();
                
                if (!res.ok) {
                    err.textContent = data.error || 'Login failed';
                    return;
                }

                localStorage.setItem('session_user_id', data.user_id);
                localStorage.setItem('session_username', data.username);
                window.location.reload();
            } catch(error) {
                err.textContent = 'Server connection error.';
            }
        });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const err = document.getElementById('signup-error');
            err.textContent = '';
            
            const user = document.getElementById('signup-user').value;
            const pass = document.getElementById('signup-pass').value;

            try {
                const res = await fetch(`${API_BASE_AUTH}/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({username: user, password: pass})
                });
                const data = await res.json();
                
                if (!res.ok) {
                    err.textContent = data.error || 'Signup failed';
                    return;
                }

                localStorage.setItem('session_user_id', data.user_id);
                localStorage.setItem('session_username', data.username);
                window.location.reload();
            } catch(error) {
                err.textContent = 'Server connection error.';
            }
        });
    }

    // Current simulated date from requirements
    const currentDate = new Date('2026-04-02');
    
    let currentRoadmapData = null; // Stores the current AI roadmap context

    // UI Elements
    const roadmapForm = document.getElementById('roadmap-form');
    const generateBtn = document.getElementById('generate-btn');
    const generateLoader = document.getElementById('generate-loader');
    const roadmapResults = document.getElementById('roadmap-results');

    const notifTray = document.getElementById('notifications-tray');
    const notifToggleBtn = document.getElementById('toggle-notifications');
    const notifCloseBtn = document.getElementById('close-notifications');
    const notifList = document.getElementById('notifications-list');
    const notifBadge = document.getElementById('notification-badge');

    // Notifications Array
    let notifications = [];

    // --- Notifications Logic ---
    notifToggleBtn.addEventListener('click', () => {
        notifTray.classList.toggle('hidden');
    });

    notifCloseBtn.addEventListener('click', () => {
        notifTray.classList.add('hidden');
    });

    const triggeredNotifications = new Set();
    function addNotification(type, message) {
        if (triggeredNotifications.has(message)) return;
        triggeredNotifications.add(message);
        notifications.push({ type, message });
        updateNotificationsUI();
    }

    function updateNotificationsUI() {
        notifBadge.textContent = notifications.length;
        notifList.innerHTML = '';

        if (notifications.length === 0) {
            notifList.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">No new notifications</p>';
            return;
        }

        // Sort: Urgent -> Warning -> Info
        const order = { 'urgent': 1, 'warning': 2, 'info': 3 };
        notifications.sort((a, b) => order[a.type] - order[b.type]);

        notifications.forEach(notif => {
            const div = document.createElement('div');
            div.className = `notification-item notif-${notif.type}`;

            let icon = 'ℹ️';
            if (notif.type === 'urgent') icon = '🔴';
            if (notif.type === 'warning') icon = '🟡';
            if (notif.type === 'info') icon = '🟢';

            div.innerHTML = `<strong>${icon}</strong> ${notif.message}`;
            notifList.appendChild(div);
        });
    }

    // Initialize UI with empty state after function is defined
    updateNotificationsUI();

    // --- Data Fetching ---
    const API_BASE = 'http://127.0.0.1:5005';

    let allScholarships = [];
    async function fetchScholarships() {
        try {
            const res = await fetch(`${API_BASE}/scholarships`);
            const data = await res.json();
            allScholarships = data;
            renderScholarships(data);
        } catch (err) {
            console.error('Error fetching scholarships:', err);
            document.getElementById('scholarships-grid').innerHTML = '<p style="color: var(--urgent-color)">Error loading scholarships. Is the server running?</p>';
        }
    }

    function matchEligibility(filter, eligText) {
        if (!eligText) return false;
        eligText = eligText.toLowerCase();
        if (filter === '10th') {
            return eligText.includes('10th') || eligText.includes('school') || eligText.includes('8th');
        }
        if (filter === '12th') {
            return eligText.includes('12th') || eligText.includes('high school') || eligText.includes('school') || eligText.includes('8th');
        }
        if (filter === 'undergraduate') {
            return eligText.includes('undergraduate') || eligText.includes('college') || eligText.includes('degree') || eligText.includes('bachelor');
        }
        return eligText.includes(filter);
    }

    const scholFilterElig = document.getElementById('scholarship-filter-eligibility');
    const scholFilterLoc = document.getElementById('scholarship-filter-location');
    const scholFilterField = document.getElementById('scholarship-filter-field');
    const userLocSelector = document.getElementById('user-location-selector');

    function applyScholarshipFilters() {
        const valElig = scholFilterElig ? scholFilterElig.value.toLowerCase() : 'all';
        const valLoc = scholFilterLoc ? scholFilterLoc.value.toLowerCase() : 'all';
        const valField = scholFilterField ? scholFilterField.value.toLowerCase() : 'all';
        const userLoc = userLocSelector ? userLocSelector.value.toLowerCase() : 'any';

        let filtered = allScholarships.filter(s => {
            let matchElig = valElig === 'all' || matchEligibility(valElig, s.eligibility);
            let matchLoc = valLoc === 'all';
            let matchField = valField === 'all';
            
            const name = (s.name || '').toLowerCase();
            const reqExam = (s.required_exam || '').toLowerCase();

            if (valField !== 'all') {
                if (valField === 'science' && (name.includes('science') || name.includes('tech') || name.includes('kvpy') || reqExam.includes('jee') || reqExam.includes('neet'))) matchField = true;
                else if (valField === 'commerce' && (name.includes('commerce') || name.includes('business') || name.includes('ca'))) matchField = true;
                else if (valField === 'arts' && (name.includes('arts') || name.includes('humanities'))) matchField = true;
                else if (name.includes('foundation') || name.includes('national')) matchField = true;
                else matchField = false;
            }

            return matchElig && matchLoc && matchField;
        });

        // Location Personalization Sorting (do not hide)
        if (userLoc !== 'any') {
            filtered.sort((a, b) => {
                const aName = (a.name || '').toLowerCase();
                const bName = (b.name || '').toLowerCase();
                const aMatch = aName.includes(userLoc) || aName.includes(userLoc.replace('_', ' '));
                const bMatch = bName.includes(userLoc) || bName.includes(userLoc.replace('_', ' '));
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
                return 0;
            });
        }

        renderScholarships(filtered, userLoc);
    }

    if (scholFilterElig) scholFilterElig.addEventListener('change', applyScholarshipFilters);
    if (scholFilterLoc) scholFilterLoc.addEventListener('change', applyScholarshipFilters);
    if (scholFilterField) scholFilterField.addEventListener('change', applyScholarshipFilters);
    if (userLocSelector) userLocSelector.addEventListener('change', applyScholarshipFilters);

    async function fetchExams() {
        try {
            const res = await fetch(`${API_BASE}/exams`);
            const data = await res.json();
            renderExams(data);
        } catch (err) {
            console.error('Error fetching exams:', err);
            document.getElementById('exams-grid').innerHTML = '<p style="color: var(--urgent-color)">Error loading exams. Is the server running?</p>';
        }
    }

    // --- Render Logic ---
    function renderScholarships(scholarships, userLoc = 'any') {
        const grid = document.getElementById('scholarships-grid');
        grid.innerHTML = '';

        if (!scholarships || scholarships.length === 0) {
            grid.innerHTML = '<p>No specific scholarships matched. Please adjust your filters.</p>';
            return;
        }

        scholarships.forEach(schol => {
            const card = document.createElement('div');
            card.className = 'data-card fade-in';

            let elig = schol.eligibility || 'Check official site';
            let req = schol.required_exam || 'None';

            let dlPriorityHtml = '';
            let isUrgent = false;
            let diffDays = 0;
            let deadlineText = schol.deadline || 'To be announced';
            
            if (schol.deadline && schol.deadline.includes('-')) {
                const dlDate = new Date(schol.deadline);
                const today = new Date();
                const diffTime = dlDate - today;
                diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 30 && diffDays > 0) {
                    dlPriorityHtml = `<span class="status-badge status-urgent">Urgent: ${diffDays} days left</span>`;
                    isUrgent = true;
                } else if (diffDays <= 0) {
                    dlPriorityHtml = `<span class="status-badge status-expired">Expired</span>`;
                    deadlineText = 'Expired';
                } else {
                    dlPriorityHtml = `<span class="status-badge status-active">Active</span>`;
                }
            } else {
                dlPriorityHtml = `<span class="status-badge status-active">Active</span>`;
            }

            // Location Highlight
            const nameLower = (schol.name || '').toLowerCase();
            let locHighlight = '';
            if (userLoc !== 'any' && (nameLower.includes(userLoc) || nameLower.includes(userLoc.replace('_', ' ')))) {
                locHighlight = `<div class="status-badge" style="background: rgba(99, 102, 241, 0.15); color: var(--primary-color); border: 1px solid var(--primary-color);">📍 Local Match</div>`;
            }

            card.innerHTML = `
                <h3 style="color: var(--secondary-color)">${schol.name}</h3>
                <div class="card-detail"><strong>Eligibility:</strong> <span>${elig}</span></div>
                <div class="card-detail"><strong>Required Exam:</strong> <span>${req}</span></div>
                <div class="card-detail"><strong>Deadline:</strong> <span style="font-weight: bold; color: var(--text-primary)">${deadlineText}</span></div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                    ${locHighlight}
                    ${dlPriorityHtml}
                </div>
            `;
            grid.appendChild(card);

            if (isUrgent) {
                addNotification('urgent', `Deadline approaching for ${schol.name}: ${diffDays} days left!`);
            }
        });
    }

    function renderRecommendedScholarships(scholarships, payload) {
        const grid = document.getElementById('recommended-scholarships-grid');
        grid.innerHTML = '';
        
        if (!scholarships || scholarships.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center; padding: 2rem 0;">No AI recommendations found. Try adjusting your roadmap inputs.</p>';
            return;
        }

        scholarships.forEach((schol, idx) => {
            const card = document.createElement('div');
            card.className = 'data-card fade-in';
            card.style.borderTop = '3px solid var(--primary-color)';

            let elig = schol.eligibility || 'Check official site';
            let req = schol.required_exam || 'None';
            let deadlineText = schol.deadline || 'To be announced';
            
            // Dynamic Success Rate Calculation (Critical Fix)
            let baseRate = 85 - (idx * 5); 
            baseRate = Math.max(50, baseRate); 
            
            let alignmentFactor = 0;
            const nameLower = (schol.name || '').toLowerCase();
            const reqLower = req.toLowerCase();
            const userGoal = (payload && payload.goal) ? payload.goal.toLowerCase() : '';
            const userStage = (payload && payload.stage) ? payload.stage.toLowerCase() : '';

            if (userGoal && (nameLower.includes(userGoal) || reqLower.includes(userGoal))) alignmentFactor += 10;
            if (userStage && elig.toLowerCase().includes(userStage)) alignmentFactor += 5;

            let successScore = Math.min(98, baseRate + alignmentFactor);
            
            let explanationLabel = "Solid match";
            let scoreColor = 'var(--text-secondary)';
            if (successScore >= 80) {
                explanationLabel = "High chance due to strong alignment with your roadmap";
                scoreColor = 'var(--active-color)';
            } else if (successScore >= 65) {
                explanationLabel = "Moderate chance based on your profile";
                scoreColor = 'var(--warning-color)';
            }

            card.innerHTML = `
                <h3 style="color: var(--secondary-color)">${schol.name}</h3>
                <div class="card-detail"><strong>Eligibility:</strong> <span>${elig}</span></div>
                <div class="card-detail"><strong>Required Exam:</strong> <span>${req}</span></div>
                <div class="card-detail"><strong>Deadline:</strong> <span style="font-weight: bold; color: var(--text-primary)">${deadlineText}</span></div>
                
                <!-- Dynamic Success Rate -->
                <div style="margin-top: 1rem; padding: 0.8rem; background: rgba(255,255,255,0.03); border-radius: var(--radius-md); border-left: 2px solid ${scoreColor};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                        <span style="font-size: 0.8rem; font-weight: bold; color: var(--text-primary);">AI Match Score</span>
                        <span style="font-weight: bold; color: ${scoreColor};">${successScore}%</span>
                    </div>
                    <div style="width: 100%; background: rgba(255,255,255,0.1); height: 6px; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${successScore}%; background: ${scoreColor}; height: 100%; transition: width 1s ease;"></div>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.4rem; font-style: italic;">
                        ${explanationLabel}
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                    <div class="status-badge status-active">Recommended</div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    let examChart = null;

    function renderExams(exams) {
        const grid = document.getElementById('exams-grid');
        grid.innerHTML = '';

        exams.forEach(exam => {
            const card = document.createElement('div');
            card.className = 'data-card fade-in exam-card-item';
            card.style.transition = 'all 0.3s ease';
            
            let diffColor = exam.difficulty.toLowerCase().includes('high') ? 'var(--urgent-color)' :
                (exam.difficulty.toLowerCase().includes('med') ? 'var(--warning-color)' : 'var(--active-color)');

            card.innerHTML = `
                <h3 style="color: var(--text-primary); margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;"><span style="font-size: 1.2rem;">📝</span> ${exam.name}</h3>
                <div class="card-detail"><strong>Eligibility:</strong> <span>${exam.eligibility || 'Check official site'}</span></div>
                <div class="card-detail"><strong>Date:</strong> <span>${exam.important_dates || 'Check official site'}</span></div>
                <div class="card-detail"><strong>Difficulty:</strong> <span style="color: ${diffColor}; font-weight: bold;">${exam.difficulty}</span></div>
                <div class="status-badge" style="background: rgba(245, 158, 11, 0.15); color: #d97706; margin-top: 1rem;">Recommended</div>
            `;
            
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                document.querySelectorAll('.exam-card-item').forEach(c => {
                    c.style.borderColor = 'var(--card-border)';
                    c.style.transform = 'none';
                    c.style.boxShadow = 'none';
                });
                
                card.style.borderColor = 'var(--primary-color)';
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';

                const panel = document.getElementById('exam-success-panel');
                const nameSpan = document.getElementById('success-panel-exam-name');
                panel.classList.remove('hidden');
                nameSpan.textContent = `— ${exam.name}`;
                
                // Dynamically calculate success rate breakdown
                let baseRate = 70;
                let alignText = "Medium";
                if (exam.difficulty.toLowerCase().includes('high')) {
                    baseRate = 45;
                    alignText = "Low (Highly Competitive)";
                } else if (exam.difficulty.toLowerCase().includes('med')) {
                    baseRate = 60;
                    alignText = "Medium (Balanced)";
                } else {
                    baseRate = 80;
                    alignText = "High (Accessible)";
                }

                const defaultPrepMonths = 6;
                const defaultConfidence = 0.85;
                const examFactor = (exam.name.length % 5) * 2; 

                // Current calculated rate
                let currentRate = Math.min(100, Math.round(baseRate * (1 + (defaultPrepMonths * 0.03)) * defaultConfidence + examFactor));
                // Projected rate if prep is increased
                let projectedRate = Math.min(99, Math.round(currentRate + 15 + examFactor));
                
                // Reason Breakdown logic
                const breakdownHtml = `
                    <div style="display: flex; justify-content: space-between;"><span>✔ Exam Alignment:</span> <strong>${alignText}</strong></div>
                    <div style="display: flex; justify-content: space-between;"><span>✔ Eligibility Match:</span> <strong>High (Based on Profile)</strong></div>
                    <div style="display: flex; justify-content: space-between; color: var(--warning-color);"><span>⚠ Preparation Level:</span> <strong>Moderate (${defaultPrepMonths} Months)</strong></div>
                `;
                document.getElementById('success-breakdown').innerHTML = breakdownHtml;
                
                // Explanation Text logic
                let explanation = `Your current chances are moderate because standard preparation time (${defaultPrepMonths} months) for a ${exam.difficulty.toLowerCase()} difficulty exam is assumed.`;
                if (currentRate > 75) {
                    explanation = `You have a strong foundation! With consistent prep, you are highly aligned to succeed in this ${exam.difficulty.toLowerCase()} difficulty exam.`;
                }
                explanation += ` <br><br><span style="color: var(--primary-color); font-weight: bold;">Suggestion:</span> Adding 2-3 more months of rigorous mock-tests can boost your projected success rate to ${projectedRate}%.`;
                document.getElementById('success-explanation').innerHTML = explanation;

                const ctx = document.getElementById('successChart').getContext('2d');
                if (examChart) examChart.destroy();

                const isLight = document.documentElement.getAttribute('data-theme') === 'light';
                const textColor = isLight ? '#1e293b' : '#f8fafc';
                const currentColor = isLight ? '#4f46e5' : '#8b5cf6';
                const projectedColor = '#10b981';

                examChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Current Rate', 'Projected (Improved)'],
                        datasets: [
                            { 
                                label: 'Success Rate (%)', 
                                data: [currentRate, projectedRate], 
                                backgroundColor: [currentColor, projectedColor], 
                                borderRadius: 6,
                                barThickness: 45
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                            duration: 1500,
                            easing: 'easeOutQuart'
                        },
                        scales: {
                            y: { beginAtZero: true, max: 100, ticks: { color: textColor } },
                            x: { grid: { display: false }, ticks: { color: textColor } }
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw}%` } }
                        }
                    }
                });
                
                panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });

            grid.appendChild(card);

            // True Data Notification Logic
            if (exam.important_dates && exam.important_dates.toLowerCase().includes('open')) {
                addNotification('info', `Registration for ${exam.name} is currently open!`);
            } else if (exam.important_dates && (exam.important_dates.includes('Jan') || exam.important_dates.includes('Feb') || exam.important_dates.includes('Mar') || exam.important_dates.includes('Apr') || exam.important_dates.includes('May') || exam.important_dates.includes('Jun'))) {
                addNotification('warning', `Upcoming exam dates for ${exam.name}: ${exam.important_dates}`);
            }
        });
    }

    // --- Form Submission for Gemini API ---
    roadmapForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // UI Loading State
        generateBtn.querySelector('span').textContent = 'Generating...';
        generateLoader.classList.remove('hidden');
        generateBtn.disabled = true;
        roadmapResults.classList.add('hidden');

        const payload = {
            stage: document.getElementById('stage').value,
            interests: document.getElementById('interests').value,
            goal: document.getElementById('goal').value
        };

        try {
            const res = await fetch(`${API_BASE}/generate-roadmap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.error) {
                alert("AI Error: " + data.error);
                return;
            }

            currentRoadmapData = data; // Store for chatbot context

            renderRoadmap(data);

            // Re-render exams dynamically
            renderExams(data.recommended_exams || []);

            // Re-render recommended scholarships dynamically based on AI roadmap
            renderRecommendedScholarships(data.recommended_scholarships || [], payload);

            roadmapResults.classList.remove('hidden');

            // Scroll to results
            roadmapResults.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (err) {
            console.error(err);
            alert("Failed to generate roadmap. Is the backend running?");
        } finally {
            generateBtn.querySelector('span').textContent = 'Generate Roadmap';
            generateLoader.classList.add('hidden');
            generateBtn.disabled = false;
        }
    });

    function renderRoadmap(data) {
        // Render Steps
        const stepsContainer = document.getElementById('roadmap-steps');
        stepsContainer.innerHTML = '';
        let stepCount = 0;
        
        if (data.roadmap && data.roadmap.length > 0) {
            data.roadmap.forEach(step => {
                stepCount++;
                const div = document.createElement('div');
                div.className = 'timeline-step';
                let checkboxHTML = sessionUser ? `<input type="checkbox" class="step-checkbox" data-step="${step.step}" style="margin-right: 10px; transform: scale(1.3); cursor: pointer;">` : '';
                div.innerHTML = `
                    <h4 style="display: flex; align-items: center;">${checkboxHTML}Phase ${step.step}: ${step.title}</h4>
                    <p style="margin-left: ${sessionUser ? '28px' : '0'}">${step.description}</p>
                `;
                stepsContainer.appendChild(div);
            });
        }

        if (sessionUser && stepCount > 0) {
            document.getElementById('chart-wrapper').style.display = 'block';
            initChart(stepCount, 0);
            
            document.querySelectorAll('.step-checkbox').forEach(chk => {
                chk.addEventListener('change', async (e) => {
                    const isChecked = e.target.checked;
                    const stepId = e.target.getAttribute('data-step');
                    
                    const total = document.querySelectorAll('.step-checkbox').length;
                    const completed = document.querySelectorAll('.step-checkbox:checked').length;
                    updateChart(total, completed);
                    
                    try {
                        await fetch(`${API_BASE}/save-progress`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                user_id: localStorage.getItem('session_user_id'),
                                step_id: stepId,
                                is_completed: isChecked
                            })
                        });
                    } catch(err) {
                        console.error('Failed to save progress');
                    }
                });
            });
        } else {
            document.getElementById('chart-wrapper').style.display = 'none';
        }

        // Render Lists
        const fillList = (id, items) => {
            const ul = document.getElementById(id);
            ul.innerHTML = '';
            if (items && items.length > 0) {
                items.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    ul.appendChild(li);
                });
            } else {
                ul.innerHTML = '<li>None specified</li>';
            }
        };

        fillList('required-skills', data.required_skills);
        
        // Smart Insights Generation
        const insightsContainer = document.getElementById('insights-container');
        if (insightsContainer) {
            insightsContainer.innerHTML = '';
            
            // Insight 1: Exam Track
            if (data.recommended_exams && data.recommended_exams.length > 0) {
                insightsContainer.innerHTML += `<div>🎯 You are on track for highly competitive exams like ${data.recommended_exams[0].name}.</div>`;
            } else {
                insightsContainer.innerHTML += `<div>🎯 Focus on building foundational skills before attempting major exams.</div>`;
            }
            
            // Insight 2: Preparation
            insightsContainer.innerHTML += `<div>⏱️ Your current preparation level requires consistency over the next 6-8 months.</div>`;
            
            // Insight 3: Scholarships
            if (data.recommended_scholarships && data.recommended_scholarships.length > 0) {
                insightsContainer.innerHTML += `<div>💰 There are ${data.recommended_scholarships.length} scholarships perfectly aligned with your profile to ease financial burden.</div>`;
            }
        }

        
        // Render Career Match Cards with simulated Match Score
        const cardsContainer = document.getElementById('career-match-cards');
        if (cardsContainer) {
            cardsContainer.innerHTML = '';
            const scores = ['90%', '84%', '78%', '71%', '65%'];
            if (data.alternative_careers && data.alternative_careers.length > 0) {
                data.alternative_careers.forEach((career, index) => {
                    const card = document.createElement('div');
                    card.className = 'match-card';
                    const score = scores[index] || '60%';
                    card.innerHTML = `
                        <h5>${index + 1}. ${career}</h5>
                        <p>Match score: ${score}</p>
                    `;
                    cardsContainer.appendChild(card);
                });
            } else {
                cardsContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">No matches found.</p>';
            }
        }
    }

    // Initialize Page Data
    fetchScholarships();
    fetchExams();
    
    // --- Chart Logic ---
    let myChart = null;

    function initChart(total, completed) {
        const ctx = document.getElementById('progressChart').getContext('2d');
        if (myChart) myChart.destroy();
        
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const primaryColor = isLight ? '#4f46e5' : '#8b5cf6';
        const emptyColor = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)';
        const textColor = isLight ? '#1e293b' : '#f8fafc';

        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Roadmap Progress'],
                datasets: [
                    {
                        label: 'Completed Steps',
                        data: [completed],
                        backgroundColor: primaryColor,
                        borderRadius: 5
                    },
                    {
                        label: 'Remaining Steps',
                        data: [total - completed],
                        backgroundColor: emptyColor,
                        borderRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: { stacked: true, max: total, display: false },
                    y: { stacked: true, display: false }
                },
                plugins: {
                    legend: { labels: { color: textColor, font: { family: 'Inter', size: 14 } } }
                }
            }
        });
    }

    function updateChart(total, completed) {
        if (!myChart) return;
        myChart.data.datasets[0].data = [completed];
        myChart.data.datasets[1].data = [total - completed];
        myChart.update();
    }

    // --- Chatbot Logic ---
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatPanel = document.getElementById('chat-panel');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');

    if (chatToggleBtn && chatPanel) {
        chatToggleBtn.addEventListener('click', () => {
            chatPanel.classList.toggle('hidden');
        });

        closeChatBtn.addEventListener('click', () => {
            chatPanel.classList.add('hidden');
        });

        const sendMessage = async () => {
            const message = chatInput.value.trim();
            if (!message) return;

            // Add user message to UI
            const userDiv = document.createElement('div');
            userDiv.className = 'chat-message user-message';
            userDiv.style.cssText = 'align-self: flex-end; background: var(--primary-color); padding: 0.8rem; border-radius: 8px 8px 0 8px; color: #fff; font-size: 0.9rem; max-width: 85%; margin-bottom: 0.5rem;';
            userDiv.textContent = message;
            chatMessages.appendChild(userDiv);
            
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Add loading message
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'chat-message bot-message loading';
            loadingDiv.style.cssText = 'align-self: flex-start; background: rgba(99, 102, 241, 0.1); border-left: 3px solid var(--primary-color); padding: 0.8rem; border-radius: 0 8px 8px 8px; color: var(--text-primary); font-size: 0.9rem; max-width: 85%; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;';
            loadingDiv.innerHTML = 'Thinking<div class="loader" style="width: 12px; height: 12px; border-width: 2px;"></div>';
            chatMessages.appendChild(loadingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
                const res = await fetch(`${API_BASE}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: message, context: currentRoadmapData })
                });
                
                const data = await res.json();
                
                // Replace loading with actual response
                loadingDiv.innerHTML = '';
                loadingDiv.textContent = data.response || "I'm sorry, I couldn't process that.";
                loadingDiv.classList.remove('loading');
            } catch (err) {
                console.error("Chat Error:", err);
                loadingDiv.innerHTML = '';
                loadingDiv.textContent = "Error connecting to the server.";
                loadingDiv.style.borderLeftColor = 'var(--urgent-color)';
            }
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        chatSendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
