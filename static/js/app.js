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

    // Current simulated date from requirements
    const currentDate = new Date('2026-04-02');

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

    function addNotification(type, message) {
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

    // --- Data Fetching ---
    const API_BASE = 'http://127.0.0.1:5005';

    async function fetchScholarships() {
        try {
            const res = await fetch(`${API_BASE}/scholarships`);
            const data = await res.json();
            renderScholarships(data);
        } catch (err) {
            console.error('Error fetching scholarships:', err);
            document.getElementById('scholarships-grid').innerHTML = '<p style="color: var(--urgent-color)">Error loading scholarships. Is the server running?</p>';
        }
    }

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
    function renderScholarships(scholarships) {
        const grid = document.getElementById('scholarships-grid');
        grid.innerHTML = '';
        const list = document.getElementById('notifications-list');
        list.innerHTML = '';

        if (!scholarships || scholarships.length === 0) {
            grid.innerHTML = '<p>No specific scholarships matched by AI. Please check general portals.</p>';
            const badge = document.getElementById('notification-badge');
            badge.innerText = '0';
            return;
        }

        scholarships.forEach(schol => {
            const card = document.createElement('div');
            card.className = 'data-card fade-in';

            let elig = schol.eligibility || 'Check official site';
            if (elig.toLowerCase().includes('none specified')) elig = 'Standard criteria applies';

            let amt = schol.amount || 'Variable/Tuition Context';
            if (amt.toLowerCase().includes('none specified')) amt = 'Variable';

            card.innerHTML = `
                <h3 style="color: var(--secondary-color)">${schol.name}</h3>
                <div class="card-detail"><strong>Eligibility:</strong> <span>${elig}</span></div>
                <div class="card-detail"><strong>Benefit:</strong> <span>${amt}</span></div>
                <div class="card-detail"><strong>Deadline:</strong> <span style="font-weight: bold; color: var(--active-color)">${schol.deadline || 'To be announced'}</span></div>
                <div class="status-badge status-info">AI Matched 💰</div>
            `;
            grid.appendChild(card);

            const li = document.createElement('li');
            li.innerHTML = `<span class="indicator active"></span> <strong>${schol.name}</strong> - Deadline: ${schol.deadline || 'TBA'}`;
            list.appendChild(li);
        });

        // Update Notification Badge Count
        const badge = document.getElementById('notification-badge');
        badge.innerText = scholarships.length;
    }

    function renderExams(exams) {
        const grid = document.getElementById('exams-grid');
        grid.innerHTML = '';

        exams.forEach(exam => {
            const card = document.createElement('div');
            card.className = 'data-card fade-in';
            // Determine difficulty color if possible
            let diffColor = exam.difficulty.toLowerCase().includes('high') ? 'var(--urgent-color)' :
                (exam.difficulty.toLowerCase().includes('med') ? 'var(--warning-color)' : 'var(--active-color)');

            let dt = exam.important_dates || 'Check official site';
            if (dt.toLowerCase().includes('none specified')) dt = 'Check official portal notification';

            let elig = exam.eligibility || 'Check official site';
            if (elig.toLowerCase().includes('none specified')) elig = 'Standard criteria applies';

            card.innerHTML = `
                <h3 style="color: var(--primary-color)">${exam.name}</h3>
                <div class="card-detail"><strong>Eligibility:</strong> <span>${elig}</span></div>
                <div class="card-detail"><strong>Dates:</strong> <span>${dt}</span></div>
                <div class="card-detail"><strong>Difficulty:</strong> <span style="color: ${diffColor}; font-weight: bold;">${exam.difficulty}</span></div>
                <div class="status-badge status-info">AI Matched ✨</div>
            `;
            grid.appendChild(card);

            // Randomly push some exam notifications for demo
            if (Math.random() > 0.7) {
                addNotification('info', `Registration for ${exam.name} is currently open!`);
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

            renderRoadmap(data);

            // Re-render exams dynamically
            renderExams(data.recommended_exams || []);

            // Re-render scholarships dynamically
            renderScholarships(data.recommended_scholarships || []);

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
});
