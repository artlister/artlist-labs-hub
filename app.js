// Supabase Configuration
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://eywujdgxtmozqlzcrqtb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5d3VqZGd4dG1venFsemNycXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MDM2MzgsImV4cCI6MjA4MTE3OTYzOH0.Zoffinj8V_nLJs9Y_eDuqhhV5L5ZiavEw8omx9pD0m0';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sample tools data (will be replaced with database later)
const TOOLS = [
    {
        id: 'auto-subtitle',
        name: 'Auto Subtitle',
        description: 'Automatically generate and add subtitles to your videos using AI in any language',
        icon: '🎬',
        url: 'https://auto-subtitle-two.vercel.app/'
    },
    // Add more tools as you deploy them
    {
        id: 'photo-caption',
        name: 'Photo Caption Processor for AI Training',
        description: 'Generate captions for AI training data',
        icon: '🎨',
        url: 'https://photo-caption-processor.vercel.app/'
    }
];

// Check authentication status on page load
window.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        showDashboard(session.user);
    } else {
        showAuthPage();
    }
});

// Auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        showDashboard(session.user);
    } else if (event === 'SIGNED_OUT') {
        showAuthPage();
    }
});

// Show/Hide Pages
function showAuthPage() {
    document.getElementById('auth-page').classList.remove('hidden');
    document.getElementById('dashboard-page').classList.add('hidden');
}

function showDashboard(user) {
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('dashboard-page').classList.remove('hidden');
    
    // Display user email
    document.getElementById('user-email').textContent = user.email;
    
    // Load tools
    loadTools();
    
    // Load recent generations
    loadRecentGenerations(user.id);
}

// Tab switching
function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('forgot-password-form').classList.add('hidden');
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.querySelectorAll('.auth-tab')[1].classList.remove('active');
    clearErrors();
}

function showSignup() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
    document.getElementById('forgot-password-form').classList.add('hidden');
    document.querySelectorAll('.auth-tab')[0].classList.remove('active');
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
    clearErrors();
}

function showForgotPassword() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('forgot-password-form').classList.remove('hidden');
    document.querySelectorAll('.auth-tab')[0].classList.remove('active');
    document.querySelectorAll('.auth-tab')[1].classList.remove('active');
    clearErrors();
}

function clearErrors() {
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
    const forgotError = document.getElementById('forgot-error');
    if (forgotError) forgotError.textContent = '';
}

// Google Sign In
async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
                hd: 'artlist.io' // Restrict to artlist.io domain
            }
        }
    });
    
    if (error) {
        console.error('Google sign-in error:', error);
        alert('Error signing in with Google: ' + error.message);
    }
}

// Login Form Handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');
    
    errorElement.textContent = '';
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) {
        errorElement.textContent = error.message;
    }
});

// Signup Form Handler
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-password-confirm').value;
    const errorElement = document.getElementById('signup-error');
    
    errorElement.textContent = '';
    
    // Validate email domain
    if (!email.endsWith('@artlist.io')) {
        errorElement.textContent = 'Only @artlist.io email addresses are allowed';
        return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
        errorElement.textContent = 'Passwords do not match';
        return;
    }
    
    if (password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });
    
    if (error) {
        errorElement.textContent = error.message;
    } else {
        errorElement.style.color = '#4ade80';
        errorElement.textContent = 'Account created! Check your email to verify.';
    }
});

// Forgot Password Form Handler
document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    const errorElement = document.getElementById('forgot-error');
    
    errorElement.textContent = '';
    
    // Validate email domain
    if (!email.endsWith('@artlist.io')) {
        errorElement.textContent = 'Only @artlist.io email addresses are allowed';
        return;
    }
    
    const { data, error} = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
    });
    
    if (error) {
        errorElement.textContent = error.message;
    } else {
        errorElement.style.color = '#4ade80';
        errorElement.textContent = 'Password reset email sent! Check your inbox.';
    }
});

// Logout
async function logout() {
    await supabase.auth.signOut();
}

// Load Tools into Grid
function loadTools() {
    const toolsGrid = document.getElementById('tools-grid');
    toolsGrid.innerHTML = '';
    
    TOOLS.forEach(tool => {
        const toolCard = document.createElement('a');
        toolCard.className = 'tool-card';
        toolCard.href = tool.url;
        toolCard.target = tool.url === '#' ? '_self' : '_blank';
        
        toolCard.innerHTML = `
            <div class="tool-icon">${tool.icon}</div>
            <h3>${tool.name}</h3>
            <p>${tool.description}</p>
            <span class="tool-arrow">→</span>
        `;
        
        // If tool is not deployed yet, prevent navigation
        if (tool.url === '#') {
            toolCard.addEventListener('click', (e) => {
                e.preventDefault();
                alert('This tool is coming soon!');
            });
        } else {
            // Add authentication token to URL for deployed tools
            toolCard.addEventListener('click', async (e) => {
                e.preventDefault();
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const urlWithToken = `${tool.url}?token=${session.access_token}&user_id=${session.user.id}`;
                    window.open(urlWithToken, '_blank');
                }
            });
        }
        
        toolsGrid.appendChild(toolCard);
    });
}

// Load Recent Generations
async function loadRecentGenerations(userId) {
    const recentGrid = document.getElementById('recent-generations');
    
    // TODO: Replace with actual database query
    // For now, show empty state
    recentGrid.innerHTML = '<p class="empty-state">Your recent generations will appear here</p>';
}
