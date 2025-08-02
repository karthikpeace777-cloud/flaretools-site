// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDUAsWKHBxX-FzxNDexb2I5zk-XB25rKOg",
    authDomain: "flaretools.firebaseapp.com",
    projectId: "flaretools",
    storageBucket: "flaretools.firebasestorage.app",
    messagingSenderId: "510853583077",
    appId: "1:510853583077:web:65fa718a22c6126b9b840c"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// Authentication state observer
auth.onAuthStateChanged((user) => {
    updateUI(user);
    protectRoutes(user);
});

// Sign up with email/password
async function signUp(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign in with email/password
async function signIn(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign in with Google
async function signInWithGoogle() {
    try {
        const result = await auth.signInWithPopup(provider);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign out
function signOut() {
    return auth.signOut();
}

// Get current user
function getCurrentUser() {
    return auth.currentUser;
}

// Check if user is authenticated
function isAuthenticated() {
    return !!auth.currentUser;
}

// Update UI based on auth state
function updateUI(user) {
    const authElements = document.querySelectorAll('[data-auth]');
    
    authElements.forEach(element => {
        const shouldShow = element.getAttribute('data-auth') === 'true' ? !!user : !user;
        element.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Update user info in UI
    const userInfoElements = document.querySelectorAll('[data-user]');
    if (user) {
        userInfoElements.forEach(element => {
            const attr = element.getAttribute('data-user');
            if (attr === 'displayName') {
                element.textContent = user.displayName || user.email.split('@')[0];
            } else if (attr === 'email') {
                element.textContent = user.email;
            } else if (attr === 'photoURL' && user.photoURL) {
                element.src = user.photoURL;
                element.style.display = 'block';
            }
        });
    }
}

// Protect routes that require authentication
function protectRoutes(user) {
    const protectedRoutes = ['/submit-tool.html', '/rate'];
    const currentPath = window.location.pathname;
    
    if (protectedRoutes.some(route => currentPath.includes(route)) && !user) {
        window.location.href = 'index.html?redirect=' + encodeURIComponent(currentPath);
    }
}

// Handle redirect after login
function handleLoginRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');
    
    if (redirectUrl && isAuthenticated()) {
        window.location.href = redirectUrl;
    }
}

// Initialize auth UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    handleLoginRedirect();
    updateUI(getCurrentUser());
});

// Export functions
window.authModule = {
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    getCurrentUser,
    isAuthenticated
};
