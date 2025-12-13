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
    },
        // Prompt Journey! 
    {
        id: 'prompt-journey',
        name: 'Prompt Journey',
        description: 'A prompt and visual exploration tool',
        icon: '🎨',
        url: 'https://prompt-journey-eta.vercel.app/'
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
    
    try {
        const { data: generations, error } = await supabase
            .from('generations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(8);
        
        if (error) {
            console.error('Error loading generations:', error);
            recentGrid.innerHTML = '<p class="empty-state">Error loading generations</p>';
            return;
        }
        
        if (generations && generations.length > 0) {
            recentGrid.innerHTML = '';
            generations.forEach(gen => {
                const card = document.createElement('div');
                card.className = 'generation-card';
                
                const mediaUrl = gen.media_urls && gen.media_urls[0];
                const isVideo = mediaUrl && (mediaUrl.includes('.mp4') || mediaUrl.includes('video'));
                
                card.innerHTML = `
                    ${mediaUrl ? (isVideo ? 
                        `<video src="${mediaUrl}" class="generation-image"></video>` :
                        `<img src="${mediaUrl}" class="generation-image" alt="Generation">`) : ''}
                    <div class="generation-info">
                        <div class="generation-tool">${gen.tool_name}</div>
                        <div class="generation-date">${new Date(gen.created_at).toLocaleDateString()}</div>
                    </div>
                `;
                
                // Add click handler to open lightbox
                card.addEventListener('click', () => {
                    openLightbox(mediaUrl, isVideo, gen);
                });
                
                recentGrid.appendChild(card);
            });
        } else {
            recentGrid.innerHTML = '<p class="empty-state">Your recent generations will appear here</p>';
        }
    } catch (err) {
        console.error('Exception loading generations:', err);
        recentGrid.innerHTML = '<p class="empty-state">Error loading generations</p>';
    }
}

// Lightbox functions
// Lightbox functions
function openLightbox(mediaUrl, isVideo, generation) {
    const modal = document.getElementById('lightboxModal');
    const image = document.getElementById('lightboxImage');
    const video = document.getElementById('lightboxVideo');
    const downloadBtn = document.getElementById('lightboxDownload');
    const copyPromptBtn = document.getElementById('lightboxCopyPrompt');
    const promptDiv = document.getElementById('lightboxPrompt');
    const metaDiv = document.getElementById('lightboxMeta');
    
    if (isVideo) {
        image.style.display = 'none';
        video.style.display = 'block';
        video.src = mediaUrl;
    } else {
        video.style.display = 'none';
        image.style.display = 'block';
        image.src = mediaUrl;
    }
    
    // Display prompt only for images (not videos)
    const prompt = generation.input_data?.prompt || '';
    if (prompt && !isVideo) {
        promptDiv.textContent = prompt;
        copyPromptBtn.style.display = 'flex';
        copyPromptBtn.onclick = () => copyPrompt(prompt);
    } else {
        promptDiv.textContent = '';
        copyPromptBtn.style.display = 'none';
    }
    
    // Display metadata
    metaDiv.textContent = `${generation.tool_name} • ${new Date(generation.created_at).toLocaleDateString()}`;
    
    // Set download handler
    downloadBtn.onclick = () => downloadMedia(mediaUrl, generation);
    
    modal.classList.add('show');
}

function copyPrompt(prompt) {
    navigator.clipboard.writeText(prompt).then(() => {
        const btn = document.getElementById('lightboxCopyPrompt');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>✓</span><span>Copied!</span>';
        btn.style.background = 'rgba(76, 175, 80, 0.2)';
        btn.style.borderColor = '#4CAF50';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy prompt');
    });
}

function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    const video = document.getElementById('lightboxVideo');
    
    modal.classList.remove('show');
    video.pause();
    video.src = '';
}

async function downloadMedia(url, generation) {
    try {
        // Fetch the file as a blob
        const response = await fetch(url);
        const blob = await response.blob();
        
        // Create download link
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${generation.tool_name}_${new Date(generation.created_at).toISOString().split('T')[0]}.${url.includes('.mp4') ? 'mp4' : 'jpg'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Download failed:', error);
        // Fallback: open in new tab
        window.open(url, '_blank');
    }
}

// Initialize lightbox event listeners when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxModal = document.getElementById('lightboxModal');
    
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target.id === 'lightboxModal') {
                closeLightbox();
            }
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('lightboxModal');
            if (modal && modal.classList.contains('show')) {
                closeLightbox();
            }
        }
    });
});