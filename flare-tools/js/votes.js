// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// Vote management class
class VoteManager {
    constructor() {
        this.currentUser = null;
        this.votesCollection = 'votes';
        this.toolsCollection = 'tools';
        
        // Listen for auth state changes
        firebase.auth().onAuthStateChanged((user) => {
            this.currentUser = user;
        });
    }

    // Check if user has already voted for a tool
    async hasUserVoted(toolId) {
        if (!this.currentUser) return false;
        
        try {
            const voteDoc = await db.collection(this.votesCollection)
                .where('userId', '==', this.currentUser.uid)
                .where('toolId', '==', toolId)
                .limit(1)
                .get();
                
            return !voteDoc.empty;
        } catch (error) {
            console.error('Error checking vote:', error);
            return false;
        }
    }

    // Add a vote for a tool
    async addVote(toolId) {
        if (!this.currentUser) {
            // Redirect to login if not authenticated
            window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
            return { success: false, error: 'User not authenticated' };
        }

        // Check if user already voted
        const hasVoted = await this.hasUserVoted(toolId);
        if (hasVoted) {
            return { success: false, error: 'You have already voted for this tool' };
        }

        // Start a batch write for atomic updates
        const batch = db.batch();
        const voteRef = db.collection(this.votesCollection).doc();
        const toolRef = db.collection(this.toolsCollection).doc(toolId);

        try {
            // Add vote to votes collection
            batch.set(voteRef, {
                userId: this.currentUser.uid,
                toolId: toolId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Increment upvote count in tools collection
            batch.update(toolRef, {
                upvotes: firebase.firestore.FieldValue.increment(1),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Commit the batch
            await batch.commit();
            
            return { success: true };
        } catch (error) {
            console.error('Error adding vote:', error);
            return { success: false, error: error.message };
        }
    }

    // Get upvote count for a tool
    async getUpvoteCount(toolId) {
        try {
            const toolDoc = await db.collection(this.toolsCollection).doc(toolId).get();
            if (toolDoc.exists) {
                return toolDoc.data().upvotes || 0;
            }
            return 0;
        } catch (error) {
            console.error('Error getting upvote count:', error);
            return 0;
        }
    }

    // Get all votes for the current user
    async getUserVotes() {
        if (!this.currentUser) return [];
        
        try {
            const votesSnapshot = await db.collection(this.votesCollection)
                .where('userId', '==', this.currentUser.uid)
                .get();
                
            return votesSnapshot.docs.map(doc => doc.data().toolId);
        } catch (error) {
            console.error('Error getting user votes:', error);
            return [];
        }
    }
}

// Initialize vote manager
const voteManager = new VoteManager();

// Export for use in other modules
window.voteManager = voteManager;
