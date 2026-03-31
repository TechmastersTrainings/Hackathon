// ============================================
// TechMasters Hackathon 2026
// Complete JavaScript with Firebase
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

console.log("Firebase loaded successfully!");

// ========== Firebase Configuration ==========
const firebaseConfig = {
    apiKey: "AIzaSyClJh9aaJ3ZV8C7aLSWPtbp9wKNrYuE_qM",
    authDomain: "tm-hack.firebaseapp.com",
    projectId: "tm-hack",
    storageBucket: "tm-hack.firebasestorage.app",
    messagingSenderId: "412409579050",
    appId: "1:412409579050:web:4b64a9047e33cb4fb7a553"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("Firebase initialized!");

// ========== App State ==========
let currentUser = null;
let memberCount = 2;
let countdownInterval = null;

// ========== TechMasters Team Members ==========
const techmastersTeam = [
    {
        name: "Rajesh Kumar",
        role: "Founder & CEO",
        bio: "Visionary leader with 15+ years in tech innovation. Passionate about building communities.",
        social: { linkedin: "#", twitter: "#", github: "#" }
    },
    {
        name: "Priya Sharma",
        role: "Technical Director",
        bio: "AI/ML expert and hackathon mentor. Has guided 50+ winning teams across India.",
        social: { linkedin: "#", twitter: "#", github: "#" }
    },
    {
        name: "Amit Patel",
        role: "Head of Partnerships",
        bio: "Building bridges between innovators and industry. Connects talent with opportunities.",
        social: { linkedin: "#", twitter: "#", github: "#" }
    },
    {
        name: "Neha Gupta",
        role: "Community Manager",
        bio: "Community builder and event organizer. Ensures smooth hackathon experience.",
        social: { linkedin: "#", twitter: "#", github: "#" }
    },
    {
        name: "Vikram Singh",
        role: "Lead Mentor",
        bio: "Full-stack developer and open-source contributor. Provides technical guidance.",
        social: { linkedin: "#", twitter: "#", github: "#" }
    },
    {
        name: "Anjali Reddy",
        role: "Design Lead",
        bio: "UI/UX expert helping teams create beautiful and user-friendly interfaces.",
        social: { linkedin: "#", twitter: "#", github: "#" }
    }
];

// ========== Helper Functions ==========
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoader() {
    const existing = document.getElementById('globalLoader');
    if (existing) existing.remove();
    const loader = document.createElement('div');
    loader.className = 'loader-container';
    loader.id = 'globalLoader';
    loader.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(loader);
}

function hideLoader() {
    const loader = document.getElementById('globalLoader');
    if (loader) loader.remove();
}

function updateCountdown() {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl) return;

    const deadline = new Date('March 15, 2026 23:59:59').getTime();
    const now = new Date().getTime();
    const distance = deadline - now;

    if (distance < 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
    }

    daysEl.textContent = String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0');
    hoursEl.textContent = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    minutesEl.textContent = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    secondsEl.textContent = String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0');
}

// ========== Page Templates ==========
function renderHomePage() {
    const teamMembersHtml = techmastersTeam.map(member => `
        <div class="team-member-card">
            <div class="member-avatar">
                <div class="member-avatar-placeholder">
                    <i class="fas fa-user-circle"></i>
                </div>
            </div>
            <h3>${member.name}</h3>
            <p class="member-role">${member.role}</p>
            <p class="member-bio">${member.bio}</p>
            <div class="member-social">
                <a href="${member.social.linkedin}" target="_blank"><i class="fab fa-linkedin"></i></a>
                <a href="${member.social.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>
                <a href="${member.social.github}" target="_blank"><i class="fab fa-github"></i></a>
            </div>
        </div>
    `).join('');

    return `
        <section class="hero">
            <div class="hero-content">
                <div class="deadline-badge">
                    <i class="fas fa-calendar-alt"></i>
                    Registration Deadline: <span>Mar 15, 2026</span>
                </div>
                <h1 class="hero-title">
                    Tech<span class="highlight">Masters</span><br>
                    <span class="hero-subtitle-text">INNOVATION HACKATHON 2026</span>
                </h1>
                <p class="hero-description">
                    Empowering Future Technologies through Open Innovation
                </p>
                <div class="countdown-timer">
                    <div class="countdown-item">
                        <span class="countdown-number" id="days">00</span>
                        <span class="countdown-label">DAYS</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-number" id="hours">00</span>
                        <span class="countdown-label">HOURS</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-number" id="minutes">00</span>
                        <span class="countdown-label">MINUTES</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-number" id="seconds">00</span>
                        <span class="countdown-label">SECONDS</span>
                    </div>
                </div>
                <div class="hero-buttons">
                    <button onclick="window.navigateTo('register')" class="btn btn-primary btn-large">
                        <i class="fas fa-rocket"></i> Start Registration
                    </button>
                    <button onclick="window.navigateTo('login')" class="btn btn-outline btn-large">
                        <i class="fas fa-sign-in-alt"></i> Team Login
                    </button>
                </div>
            </div>
        </section>
        
        <section style="padding: 80px 0; background: var(--bg-secondary);">
            <div class="container">
                <h2 class="section-title">Why Participate?</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-lightbulb"></i></div>
                        <div class="stat-info">
                            <h3>Innovate</h3>
                            <p>Build breakthrough solutions</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-users"></i></div>
                        <div class="stat-info">
                            <h3>Network</h3>
                            <p>Connect with experts</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-trophy"></i></div>
                        <div class="stat-info">
                            <h3>Win Prizes</h3>
                            <p>₹50,000 prize pool</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-chalkboard-teacher"></i></div>
                        <div class="stat-info">
                            <h3>Learn</h3>
                            <p>Expert mentorship</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <section style="padding: 80px 0; background: var(--bg-primary);">
            <div class="container">
                <h2 class="section-title">Meet Our Team</h2>
                <div class="team-grid">
                    ${teamMembersHtml}
                </div>
            </div>
        </section>
        
        <section style="padding: 80px 0; background: var(--bg-secondary);">
            <div class="container">
                <h2 class="section-title">Hackathon Themes</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-brain"></i></div>
                        <div class="stat-info">
                            <h3>AI & ML</h3>
                            <p>Intelligent solutions</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-link"></i></div>
                        <div class="stat-info">
                            <h3>Web3 & Blockchain</h3>
                            <p>Decentralized future</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-microchip"></i></div>
                        <div class="stat-info">
                            <h3>IoT</h3>
                            <p>Connected devices</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-heartbeat"></i></div>
                        <div class="stat-info">
                            <h3>HealthTech</h3>
                            <p>Healthcare innovation</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

function renderRegisterPage() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h2>Team Registration</h2>
                    <p>Join TechMasters Hackathon 2026</p>
                </div>
                <form id="registerForm">
                    <div class="form-group">
                        <label><i class="fas fa-users"></i> Team Name</label>
                        <input type="text" id="teamName" required placeholder="Enter your team name">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-envelope"></i> Team Email</label>
                        <input type="email" id="email" required placeholder="team@example.com">
                        <small>This will be used for login</small>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-lock"></i> Password</label>
                        <input type="password" id="password" required placeholder="Create a strong password">
                        <small>Minimum 6 characters</small>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-check-circle"></i> Confirm Password</label>
                        <input type="password" id="confirmPassword" required placeholder="Confirm your password">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-user-friends"></i> Team Members</label>
                        <div id="membersContainer">
                            <div class="member-input-group">
                                <input type="text" class="member-name" placeholder="Member 1 Name (Team Lead)" required>
                                <input type="email" class="member-email" placeholder="Member 1 Email" required>
                            </div>
                            <div class="member-input-group">
                                <input type="text" class="member-name" placeholder="Member 2 Name" required>
                                <input type="email" class="member-email" placeholder="Member 2 Email" required>
                            </div>
                        </div>
                        <button type="button" id="addMemberBtn" class="btn-add-member">
                            <i class="fas fa-plus"></i> Add Team Member
                        </button>
                        <small>Minimum 2 members, Maximum 4 members</small>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-university"></i> College/Organization</label>
                        <input type="text" id="college" required placeholder="Your college or organization name">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-phone"></i> Contact Number</label>
                        <input type="tel" id="phone" required placeholder="+91 98765 43210">
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="terms" required>
                            <span>I agree to the Terms & Conditions</span>
                        </label>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Register Team</button>
                </form>
                <div class="auth-footer">
                    <p>Already have an account? <a href="#" onclick="window.navigateTo('login')">Login here</a></p>
                </div>
            </div>
        </div>
    `;
}

function renderLoginPage() {
    return `
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h2>Welcome Back!</h2>
                    <p>Login to your TechMasters Hackathon account</p>
                </div>
                <form id="loginForm">
                    <div class="form-group">
                        <label><i class="fas fa-envelope"></i> Team Email</label>
                        <input type="email" id="loginEmail" required placeholder="team@example.com">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-lock"></i> Password</label>
                        <input type="password" id="loginPassword" required placeholder="Enter your password">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Login to Dashboard</button>
                </form>
                <div class="auth-footer">
                    <p>Don't have an account? <a href="#" onclick="window.navigateTo('register')">Register your team</a></p>
                </div>
            </div>
        </div>
    `;
}

function renderDashboardPage() {
    return `
        <div class="dashboard-container">
            <div class="dashboard-header">
                <h1>Team Dashboard</h1>
                <p id="welcomeMessage">Welcome, loading...</p>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-users"></i></div>
                    <div class="stat-info">
                        <h3 id="teamSize">0</h3>
                        <p>Team Members</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-clock"></i></div>
                    <div class="stat-info">
                        <h3 id="daysLeft">0</h3>
                        <p>Days Until Event</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-trophy"></i></div>
                    <div class="stat-info">
                        <h3>₹50,000</h3>
                        <p>Prize Pool</p>
                    </div>
                </div>
            </div>
            <div class="info-card">
                <h3><i class="fas fa-info-circle"></i> Team Information</h3>
                <div class="info-row"><label>Team Name:</label><span id="teamNameDisplay">-</span></div>
                <div class="info-row"><label>Team Email:</label><span id="teamEmailDisplay">-</span></div>
                <div class="info-row"><label>College:</label><span id="collegeDisplay">-</span></div>
                <div class="info-row"><label>Contact:</label><span id="phoneDisplay">-</span></div>
            </div>
            <button id="logoutBtn" class="btn btn-danger btn-block" style="margin-top: 20px;">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `;
}

// ========== Navigation ==========
function navigateTo(page) {
    console.log("Navigating to:", page);
    const container = document.getElementById('app-container');
    if (!container) {
        console.error("Container not found!");
        return;
    }

    if (page === 'home') {
        container.innerHTML = renderHomePage();
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();
    } else if (page === 'register') {
        container.innerHTML = renderRegisterPage();
        memberCount = 2;
        const addBtn = document.getElementById('addMemberBtn');
        if (addBtn) {
            addBtn.onclick = () => {
                if (memberCount >= 4) {
                    showToast('Maximum 4 members allowed', 'error');
                    return;
                }
                memberCount++;
                const container = document.getElementById('membersContainer');
                const div = document.createElement('div');
                div.className = 'member-input-group';
                div.innerHTML = `
                    <input type="text" class="member-name" placeholder="Member ${memberCount} Name" required>
                    <input type="email" class="member-email" placeholder="Member ${memberCount} Email" required>
                    <button type="button" class="remove-member-btn" onclick="this.parentElement.remove(); memberCount--;">✖</button>
                `;
                container.appendChild(div);
            };
        }
        const form = document.getElementById('registerForm');
        if (form) form.onsubmit = handleRegister;
    } else if (page === 'login') {
        container.innerHTML = renderLoginPage();
        const form = document.getElementById('loginForm');
        if (form) form.onsubmit = handleLogin;
    } else if (page === 'dashboard') {
        container.innerHTML = renderDashboardPage();
        loadDashboardData();
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.onclick = handleLogout;
    }

    // Update active nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        const linkPage = link.getAttribute('data-page');
        if (linkPage === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    window.scrollTo({ top: 0 });
}

// ========== Firebase Functions ==========
async function handleRegister(e) {
    e.preventDefault();
    showLoader();

    try {
        const teamName = document.getElementById('teamName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const college = document.getElementById('college').value;
        const phone = document.getElementById('phone').value;

        const members = [];
        document.querySelectorAll('.member-input-group').forEach((input, i) => {
            const name = input.querySelector('.member-name').value;
            const memEmail = input.querySelector('.member-email').value;
            members.push({ name, email: memEmail, role: i === 0 ? 'Team Lead' : 'Member' });
        });

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'teams', user.uid), {
            teamId: user.uid,
            teamName, email, members, college, phone,
            createdAt: serverTimestamp(),
            paymentStatus: 'pending'
        });

        await addDoc(collection(db, 'payments'), {
            teamId: user.uid, teamName, amount: 500, utr: '', status: 'pending', createdAt: serverTimestamp()
        });

        showToast('Registration successful!', 'success');
        setTimeout(() => navigateTo('dashboard'), 2000);

    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoader();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    showLoader();

    try {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Login successful!', 'success');
        setTimeout(() => navigateTo('dashboard'), 1000);
    } catch (error) {
        showToast('Invalid email or password', 'error');
    } finally {
        hideLoader();
    }
}

async function handleLogout() {
    showLoader();
    try {
        await signOut(auth);
        showToast('Logged out', 'success');
        navigateTo('home');
    } catch (error) {
        showToast('Logout failed', 'error');
    } finally {
        hideLoader();
    }
}

async function loadDashboardData() {
    if (!currentUser) return;

    try {
        const teamDoc = await getDoc(doc(db, 'teams', currentUser.uid));
        if (teamDoc.exists()) {
            const data = teamDoc.data();
            document.getElementById('welcomeMessage').innerHTML = `Welcome, <strong>${data.teamName}</strong>!`;
            document.getElementById('teamNameDisplay').textContent = data.teamName;
            document.getElementById('teamEmailDisplay').textContent = data.email;
            document.getElementById('collegeDisplay').textContent = data.college;
            document.getElementById('phoneDisplay').textContent = data.phone;
            document.getElementById('teamSize').textContent = data.members.length;
        }
    } catch (error) {
        console.error(error);
    }
}

// ========== Auth Listener ==========
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const dashboardNav = document.getElementById('dashboardNavLink');
    if (dashboardNav) {
        dashboardNav.style.display = user ? 'inline-block' : 'none';
    }
    if (user && (currentPage === 'login' || currentPage === 'register')) {
        navigateTo('dashboard');
    }
});

let currentPage = 'home';

// ========== Theme Toggle ==========
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    });
}

// ========== Navigation Setup ==========
window.navigateTo = navigateTo;

document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-page'));
    });
});

console.log("Starting app...");
navigateTo('home');