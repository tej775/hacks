// Load user profile data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
});

// Load user profile information
function loadUserProfile() {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    const userToken = localStorage.getItem('userToken');
    
    if (!userData || !userToken) {
        // No user data found, redirect to login
        showNotification('Please log in to view your profile', 'error');
        setTimeout(() => {
            window.location.href = 'signin.html';
        }, 2000);
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        
        // Display personal information
        document.getElementById('userName').textContent = user.name || 'N/A';
        document.getElementById('userEmail').textContent = user.email || 'N/A';
        document.getElementById('userPhone').textContent = user.phone || 'N/A';
        document.getElementById('userRole').textContent = (user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1);
        
        // Format and display creation date
        if (user.createdAt) {
            const createdDate = new Date(user.createdAt);
            document.getElementById('userCreated').textContent = createdDate.toLocaleDateString() + ' at ' + createdDate.toLocaleTimeString();
        } else {
            document.getElementById('userCreated').textContent = 'N/A';
        }
        
        // Show business information if user is a vendor
        if (user.role === 'vendor') {
            const businessSection = document.getElementById('businessInfo');
            businessSection.style.display = 'block';
            
            document.getElementById('businessName').textContent = user.businessName || 'N/A';
            document.getElementById('businessType').textContent = user.businessType || 'N/A';
            document.getElementById('businessAddress').textContent = user.businessAddress || 'N/A';
        }
        
        showNotification('Profile loaded successfully', 'success');
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        showNotification('Error loading profile data', 'error');
    }
}

// Edit profile function
function editProfile() {
    showNotification('Edit profile functionality coming soon!', 'info');
}

// Go to dashboard based on user role
function goToDashboard() {
    const userData = localStorage.getItem('userData');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            
            if (user.role === 'vendor') {
                window.location.href = 'vendor-dashboard.html';
            } else if (user.role === 'supplier') {
                window.location.href = 'index.html'; // Redirect to home for suppliers
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            window.location.href = 'index.html';
        }
    } else {
        window.location.href = 'signin.html';
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear user data
        localStorage.removeItem('userData');
        localStorage.removeItem('userToken');
        
        showNotification('Logged out successfully!', 'success');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// Notification System
function showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}
