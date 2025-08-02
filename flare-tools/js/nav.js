// Navigation component with authentication state
class Navigation extends HTMLElement {
    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.updateAuthState();
        
        // Listen for auth state changes
        if (window.authModule) {
            window.authModule.onAuthStateChanged((user) => {
                this.updateAuthState(user);
            });
        }
    }
    
    render() {
        this.innerHTML = `
            <nav class="bg-white shadow-sm">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-16">
                        <div class="flex items-center">
                            <a href="index.html" class="text-xl font-bold text-indigo-600">Flare Tools</a>
                        </div>
                        <div class="flex items-center space-x-4">
                            <a href="index.html" class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600" data-auth="false">Home</a>
                            <a href="tools.html" class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Tools</a>
                            <a href="submit-tool.html" class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600" data-auth="true">Submit Tool</a>
                            
                            <!-- Logged out state -->
                            <div class="flex items-center space-x-2" data-auth="false">
                                <a href="login.html" class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Sign In</a>
                                <a href="signup.html" class="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Sign Up</a>
                            </div>
                            
                            <!-- Logged in state -->
                            <div class="relative ml-3" data-auth="true" style="display: none;">
                                <button type="button" id="userMenuButton" class="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    <span class="sr-only">Open user menu</span>
                                    <img id="userAvatar" class="h-8 w-8 rounded-full" src="" alt="">
                                    <span id="userName" class="ml-2 text-sm font-medium text-gray-700"></span>
                                </button>
                                <div id="userDropdown" class="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" tabindex="-1">
                                    <div class="py-1" role="none">
                                        <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabindex="-1" id="user-menu-item-0">Your Profile</a>
                                        <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabindex="-1" id="user-menu-item-1">Settings</a>
                                        <button id="signOutButton" class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabindex="-1">Sign out</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }
    
    setupEventListeners() {
        // User menu toggle
        const userMenuButton = this.querySelector('#userMenuButton');
        const userDropdown = this.querySelector('#userDropdown');
        
        if (userMenuButton && userDropdown) {
            userMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
                    userDropdown.classList.add('hidden');
                }
            });
            
            // Sign out button
            const signOutButton = this.querySelector('#signOutButton');
            if (signOutButton) {
                signOutButton.addEventListener('click', async (e) => {
                    e.preventDefault();
                    try {
                        if (window.authModule) {
                            await window.authModule.signOut();
                            // Redirect to home page after sign out
                            window.location.href = 'index.html';
                        }
                    } catch (error) {
                        console.error('Error signing out:', error);
                    }
                });
            }
        }
    }
    
    updateAuthState(user) {
        const authElements = this.querySelectorAll('[data-auth]');
        const isAuthenticated = !!user;
        
        authElements.forEach(element => {
            const requiresAuth = element.getAttribute('data-auth') === 'true';
            if (requiresAuth) {
                element.style.display = isAuthenticated ? 'flex' : 'none';
            } else {
                element.style.display = isAuthenticated ? 'none' : 'flex';
            }
        });
        
        if (isAuthenticated) {
            // Update user info in the menu
            const userName = this.querySelector('#userName');
            const userAvatar = this.querySelector('#userAvatar');
            
            if (userName) {
                userName.textContent = user.displayName || user.email.split('@')[0];
            }
            
            if (userAvatar) {
                if (user.photoURL) {
                    userAvatar.src = user.photoURL;
                    userAvatar.alt = user.displayName || 'User';
                } else {
                    // Fallback to initials
                    const name = user.displayName || user.email;
                    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
                    userAvatar.src = `data:image/svg+xml;base64,${btoa(`
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" rx="16" fill="#E0E7FF"/>
                            <text x="50%" y="50%" font-family="Arial" font-size="14" font-weight="600" fill="#4F46E5" text-anchor="middle" dy=".3em">${initials.substring(0, 2)}</text>
                        </svg>
                    `)}`;
                }
            }
        }
    }
}

// Register the custom element
customElements.define('app-navigation', Navigation);

// Export for use in other modules
window.Navigation = Navigation;
