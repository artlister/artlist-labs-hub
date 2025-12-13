// Supabase Configuration
// TODO: Replace these with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sample tools data (will be replaced with database later)
const TOOLS = [
    {
        id: 'auto-subtitle',
        name: 'Auto Subtitle',
        description: 'Automatically generate and add subtitles to your videos using AI',
        icon: '🎬',
        url: 'https://auto-subtitle.vercel.app'
    },
    // Add more tools as you deploy them
    {
        id: 'ai-image',
        name: 'AI Image',
        description: 'Generate stunning images from text descriptions',
        icon: '🎨',
        url: '#' // Replace with actual URL when deployed
    },
    {
        id: 'ai-video',
        name: 'AI Video',
        description: 'Create professional videos with AI assistance',
        icon: '🎥',
        url: '#' // Replace with actual URL when deployed
    },
    {
        id: 'ai-voiceover',
        name: 'AI Voiceover',
        description: 'Transform text into natural-sounding speech',
        icon: '🎙️',
        url: '#' // Replace with actual URL when deployed
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
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.querySelectorAll('.auth-tab')[1].classList.remove('active');
    clearErrors();
}

function showSignup() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
    document.querySelectorAll('.auth-tab')[0].classList.remove('active');
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
    clearErrors();
}

function clearErrors() {
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
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
    // Success is handled by onAuthStateChange
});

// Signup Form Handler
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-password-confirm').value;
    const errorElement = document.getElementById('signup-error');
    
    errorElement.textContent = '';
    
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
        // Show success message
        errorElement.style.color = '#4ade80';
        errorElement.textContent = 'Account created! Check your email to verify.';
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
    
    /* Example of how this will work once database is set up:
    const { data: generations, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(8);
    
    if (generations && generations.length > 0) {
        recentGrid.innerHTML = '';
        generations.forEach(gen => {
            const card = document.createElement('div');
            card.className = 'generation-card';
            card.innerHTML = `
                ${gen.image_url ? `<img src="${gen.image_url}" class="generation-image">` : ''}
                <div class="generation-info">
                    <div class="generation-tool">${gen.tool_name}</div>
                    <div class="generation-date">${new Date(gen.created_at).toLocaleDateString()}</div>
                </div>
            `;
            recentGrid.appendChild(card);
        });
    }
    */
}
