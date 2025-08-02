// Admin JavaScript for Flare Tools
document.addEventListener('DOMContentLoaded', function() {
    // Firebase config - replace with your actual config
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "your-app.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-app.appspot.com",
        messagingSenderId: "1234567890",
        appId: "1:1234567890:web:abcdef123456"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const db = firebase.firestore();
    const auth = firebase.auth();
    const ADMIN_EMAIL = "admin@example.com";
    
    // DOM Elements
    const adminContent = document.getElementById('admin-content');
    const unauthorizedMessage = document.getElementById('unauthorized-message');
    const toolsList = document.getElementById('tools-list');
    const reviewsList = document.getElementById('reviews-list');
    const toolsLoading = document.getElementById('tools-loading');
    const noTools = document.getElementById('no-tools');
    const reviewsLoading = document.getElementById('reviews-loading');
    const noReviews = document.getElementById('no-reviews');
    const totalToolsEl = document.getElementById('total-tools');
    const totalReviewsEl = document.getElementById('total-reviews');
    const toolsCountEl = document.getElementById('tools-count');
    const reviewsCountEl = document.getElementById('reviews-count');
    const toolsSearch = document.getElementById('tools-search');
    const reviewFilter = document.getElementById('review-filter');

    // State
    let currentUser = null;
    let tools = [];
    let reviews = [];

    // Auth State Listener
    auth.onAuthStateChanged(user => {
        if (user && user.email === ADMIN_EMAIL) {
            currentUser = user;
            adminContent.classList.remove('hidden');
            unauthorizedMessage.classList.add('hidden');
            loadData();
        } else {
            adminContent.classList.add('hidden');
            unauthorizedMessage.classList.remove('hidden');
            if (!user) window.location.href = '/login.html';
        }
    });

    // Load data
    function loadData() {
        loadTools();
        loadReviews();
    }

    // Load tools
    function loadTools() {
        toolsLoading.classList.remove('hidden');
        noTools.classList.add('hidden');
        
        db.collection('tools').orderBy('createdAt', 'desc').get()
            .then(snapshot => {
                tools = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                updateToolsUI();
                toolsLoading.classList.add('hidden');
                noTools.classList.toggle('hidden', tools.length > 0);
            })
            .catch(error => {
                console.error("Error loading tools: ", error);
                toolsLoading.classList.add('hidden');
                showError("Failed to load tools");
            });
    }

    // Load reviews
    function loadReviews() {
        reviewsLoading.classList.remove('hidden');
        noReviews.classList.add('hidden');
        
        db.collection('reviews').orderBy('createdAt', 'desc').get()
            .then(snapshot => {
                reviews = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                updateReviewsUI();
                reviewsLoading.classList.add('hidden');
                noReviews.classList.toggle('hidden', reviews.length > 0);
            })
            .catch(error => {
                console.error("Error loading reviews: ", error);
                reviewsLoading.classList.add('hidden');
                showError("Failed to load reviews");
            });
    }

    // Update tools UI
    function updateToolsUI() {
        toolsList.innerHTML = '';
        const searchTerm = toolsSearch.value.toLowerCase();
        
        const filteredTools = searchTerm 
            ? tools.filter(tool => 
                tool.name.toLowerCase().includes(searchTerm) || 
                (tool.description && tool.description.toLowerCase().includes(searchTerm))
              )
            : tools;

        totalToolsEl.textContent = tools.length;
        toolsCountEl.textContent = filteredTools.length;
        
        filteredTools.forEach(tool => {
            const toolEl = document.createElement('tr');
            toolEl.className = 'hover:bg-gray-50';
            toolEl.innerHTML = `
                <td class="pl-6 pr-2 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        ${tool.imageUrl ? 
                            `<img class="h-10 w-10 rounded-md object-cover" src="${tool.imageUrl}" alt="${tool.name}">` 
                            : ''
                        }
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${escapeHtml(tool.name)}</div>
                        </div>
                    </div>
                </td>
                <td class="px-2 py-4">
                    <div class="text-sm text-gray-900 truncate-2-lines">
                        ${tool.description ? escapeHtml(tool.description) : 'No description'}
                    </div>
                </td>
                <td class="px-2 py-4 text-center">
                    <span class="status-badge status-${tool.status || 'pending'}">
                        ${(tool.status || 'pending').charAt(0).toUpperCase() + (tool.status || 'pending').slice(1)}
                    </span>
                </td>
                <td class="px-2 py-4 text-right text-sm text-gray-900">
                    ${tool.upvotes || 0}
                </td>
                <td class="pr-6 pl-2 py-4 text-right">
                    <button onclick="editTool('${tool.id}')" class="edit-btn action-btn" title="Edit">
                        <span class="material-icons text-sm">edit</span>
                    </button>
                    <button onclick="confirmDeleteTool('${tool.id}')" class="delete-btn action-btn ml-1" title="Delete">
                        <span class="material-icons text-sm">delete</span>
                    </button>
                </td>
            `;
            toolsList.appendChild(toolEl);
        });
    }

    // Update reviews UI
    function updateReviewsUI() {
        reviewsList.innerHTML = '';
        const ratingFilter = reviewFilter.value;
        
        const filteredReviews = ratingFilter !== 'all'
            ? reviews.filter(review => review.rating === parseInt(ratingFilter))
            : reviews;

        totalReviewsEl.textContent = reviews.length;
        reviewsCountEl.textContent = filteredReviews.length;
        
        filteredReviews.forEach(review => {
            const tool = tools.find(t => t.id === review.toolId);
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            
            const reviewEl = document.createElement('tr');
            reviewEl.className = 'hover:bg-gray-50';
            reviewEl.innerHTML = `
                <td class="pl-6 pr-2 py-4">
                    <div class="text-sm font-medium text-gray-900">
                        ${tool ? escapeHtml(tool.name) : 'Unknown Tool'}
                    </div>
                </td>
                <td class="px-2 py-4 text-center text-yellow-500">
                    ${stars}
                </td>
                <td class="px-2 py-4">
                    <div class="text-sm text-gray-900 truncate-2-lines max-w-xs">
                        ${review.comment ? escapeHtml(review.comment) : 'No comment'}
                    </div>
                </td>
                <td class="pr-6 pl-2 py-4 text-right">
                    <button onclick="deleteReview('${review.id}')" class="delete-btn action-btn" title="Delete">
                        <span class="material-icons text-sm">delete</span>
                    </button>
                </td>
            `;
            reviewsList.appendChild(reviewEl);
        });
    }

    // Helper functions
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showError(message) {
        // Implement toast or alert
        console.error(message);
    }

    // Event Listeners
    toolsSearch.addEventListener('input', updateToolsUI);
    reviewFilter.addEventListener('change', updateReviewsUI);
    
    // Global functions
    window.editTool = (toolId) => {
        const tool = tools.find(t => t.id === toolId);
        if (tool) alert(`Edit tool: ${tool.name}`);
    };

    window.confirmDeleteTool = (toolId) => {
        if (confirm('Delete this tool?')) {
            db.collection('tools').doc(toolId).delete()
                .then(loadData)
                .catch(error => showError('Failed to delete tool'));
        }
    };

    window.deleteReview = (reviewId) => {
        if (confirm('Delete this review?')) {
            db.collection('reviews').doc(reviewId).delete()
                .then(loadReviews)
                .catch(error => showError('Failed to delete review'));
        }
    };
});
