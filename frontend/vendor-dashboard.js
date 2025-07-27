// Vendor Dashboard JavaScript

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", function () {
    initializeDashboard();
});

// Initialize Dashboard
function initializeDashboard() {
    // Show loading overlay initially
    showLoading();
    
    // Load static dashboard UI
    setTimeout(() => {
        loadStaticDashboard();
        hideLoading();
    }, 1500);
    
    // Set up event listeners
    setupEventListeners();
}

// Load Static Dashboard (UI only)
function loadStaticDashboard() {
    // Update vendor name with placeholder
    document.getElementById('vendorName').textContent = 'Vendor Dashboard';
    
    // Update stats with placeholder data
    updateStats({
        requests: '--',
        orders: '--',
        rating: '--',
        revenue: '--'
    });
    
    // Show placeholder message for activity
    loadPlaceholderActivity();
}

// Update Stats Cards (UI only)
function updateStats(stats) {
    // Update requests
    const requestsElement = document.getElementById('totalRequests');
    if (requestsElement) {
        requestsElement.textContent = stats.requests;
    }
    
    // Update orders
    const ordersElement = document.getElementById('totalOrders');
    if (ordersElement) {
        ordersElement.textContent = stats.orders;
    }
    
    // Update rating
    const ratingElement = document.getElementById('avgRating');
    if (ratingElement) {
        ratingElement.textContent = stats.rating;
    }
    
    // Update revenue
    const revenueElement = document.getElementById('totalRevenue');
    if (revenueElement) {
        revenueElement.textContent = stats.revenue;
    }
}

// Load Placeholder Activity
function loadPlaceholderActivity() {
    const activityContainer = document.querySelector('.activity-list');
    if (activityContainer) {
        activityContainer.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-content">
                    <h4>Dashboard Ready</h4>
                    <p>Connect to backend to view real activity data</p>
                    <span class="activity-time">Now</span>
                </div>
            </div>
        `;
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const userMenu = document.querySelector('.user-menu');
        const dropdown = document.getElementById('userDropdown');
        
        if (!userMenu.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

// Toggle User Menu
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Edit Profile
function editProfile() {
    showNotification('Profile editing feature coming soon!', 'info');
    toggleUserMenu();
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Show logout message
        showNotification('Logged out successfully!', 'success');
        
        // Redirect to signin page
        setTimeout(() => {
            window.location.href = 'signin.html';
        }, 1500);
    }
    toggleUserMenu();
}

// Quick Action Functions (UI placeholders)
function viewSuppliers() {
    showNotification('Suppliers view requires backend implementation', 'info');
}

function manageOrders() {
    showNotification('Order management requires backend implementation', 'info');
}

function viewAnalytics() {
    showNotification('Analytics view requires backend implementation', 'info');
}

// Handle Activity Actions (UI only)
function handleActivityAction(activityType) {
    showNotification(`${activityType} action requires backend implementation`, 'info');
}

// Loading Functions
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('hidden');
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="closeNotification(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        min-width: 300px;
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        closeNotification(notification.querySelector('.notification-close'));
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fas fa-check-circle';
        case 'error': return 'fas fa-exclamation-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        default: return 'fas fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return 'linear-gradient(135deg, #28a745, #20c997)';
        case 'error': return 'linear-gradient(135deg, #dc3545, #e74c3c)';
        case 'warning': return 'linear-gradient(135deg, #ffc107, #f39c12)';
        default: return 'linear-gradient(135deg, #667eea, #764ba2)';
    }
}

function closeNotification(closeBtn) {
    const notification = closeBtn.closest('.notification');
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// Refresh Dashboard Data (UI only)
function refreshDashboard() {
    showNotification('Dashboard refresh requires backend implementation', 'info');
}

// Action handlers
function openRequestForm() {
    try {
        console.log('Opening grocery request form...');
        window.location.href = 'grocery-request.html';
    } catch (error) {
        console.error('Error opening request form:', error);
        showNotification('Error opening request form. Please try again.', 'error');
    }
}

function viewSuppliers() {
    alert('Redirecting to suppliers page...');
    // Implement navigation to suppliers page
}

function manageOrders() {
    alert('Opening order management...');
    // Implement order management
}

function viewAnalytics() {
    alert('Opening analytics dashboard...');
    // Implement analytics view
}

// Global functions for onclick handlers
window.toggleUserMenu = () => toggleUserMenu();
window.editProfile = () => editProfile();
window.logout = () => logout();
window.openRequestForm = () => {
    console.log('Request Items button clicked!');
    try {
        console.log('Opening grocery request form...');
        window.location.href = 'grocery-request.html';
    } catch (error) {
        console.error('Error opening request form:', error);
        showNotification('Error opening request form. Please try again.', 'error');
    }
};
window.viewSuppliers = () => viewSuppliers();
window.viewAnalytics = () => viewAnalytics();

// Test function to verify button functionality
// Manage Orders - Redirect to dedicated manage orders page
function manageOrders() {
    console.log('Redirecting to manage orders page...');
    
    // Redirect to the dedicated manage orders page
    window.location.href = 'manage-orders.html';
}

function showManageOrdersModal(responses) {
    const modalHTML = `
        <div id="manageOrdersModal" class="modal">
            <div class="modal-content large">
                <div class="modal-header">
                    <h3><i class="fas fa-box"></i> Supplier Responses to Your Requests</h3>
                    <button class="modal-close" onclick="closeManageOrdersModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="responses-list">
                        ${generateResponsesHTML(responses)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('manageOrdersModal').style.display = 'flex';
}

function generateResponsesHTML(requestsWithResponses) {
    return requestsWithResponses.map((request, requestIndex) => {
        const vendorName = request.vendorInfo?.name || 'Unknown Vendor';
        const requestItems = request.items?.map(item => `${item.name} (${item.quantity})`).join(', ') || 'No items specified';
        const budgetRange = request.budgetInfo?.range || 'Not specified';
        const deliveryDate = request.deliveryInfo?.preferredDate || 'Not specified';
        const requestDate = new Date(request.timestamp || Date.now()).toLocaleDateString();
        
        return `
            <div class="request-card">
                <div class="request-header">
                    <div class="request-info">
                        <h4>Your Request #${request.id || (requestIndex + 1)}</h4>
                        <p class="request-date">
                            <i class="fas fa-calendar"></i> Submitted on ${requestDate}
                        </p>
                        <p class="request-status">
                            <i class="fas fa-info-circle"></i> ${request.supplierResponses.length} supplier response(s)
                        </p>
                    </div>
                </div>
                
                <div class="request-details">
                    <div class="original-request">
                        <h5>Request Details:</h5>
                        <p><strong>Items:</strong> ${requestItems}</p>
                        <p><strong>Budget:</strong> ${budgetRange}</p>
                        <p><strong>Delivery Date:</strong> ${deliveryDate}</p>
                        <p><strong>Delivery Address:</strong> ${request.deliveryInfo?.address || 'Not specified'}</p>
                    </div>
                    
                    ${request.supplierResponses.length > 0 ? `
                        <div class="supplier-responses">
                            <h5>Supplier Responses:</h5>
                            ${request.supplierResponses.map((response, responseIndex) => {
                                const statusClass = response.status === 'accepted' ? 'accepted' : 
                                                   response.status === 'rejected' ? 'rejected' : 'pending';
                                
                                return `
                                    <div class="supplier-response-item ${statusClass}">
                                        <div class="supplier-header">
                                            <div class="supplier-info">
                                                <h6>${response.supplierInfo?.name || 'Supplier'}</h6>
                                                <p class="supplier-contact">
                                                    <i class="fas fa-envelope"></i> ${response.supplierInfo?.email || 'No email'} |
                                                    <i class="fas fa-phone"></i> ${response.supplierInfo?.phone || 'No phone'}
                                                </p>
                                            </div>
                                            <div class="response-status">
                                                <span class="status-badge ${statusClass}">
                                                    ${response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div class="supplier-details">
                                            <p><strong>Message:</strong> ${response.responseMessage}</p>
                                            <p><strong>Quoted Price:</strong> ₹${response.estimatedPrice}</p>
                                            <p><strong>Delivery Timeline:</strong> ${response.deliveryTimeline}</p>
                                            ${response.additionalNotes ? `<p><strong>Notes:</strong> ${response.additionalNotes}</p>` : ''}
                                        </div>
                                        
                                        ${response.status === 'pending' ? `
                                            <div class="response-actions">
                                                <button class="btn-success" onclick="acceptSupplierResponse(${requestIndex}, ${responseIndex})">
                                                    <i class="fas fa-check"></i> Accept
                                                </button>
                                                <button class="btn-danger" onclick="rejectSupplierResponse(${requestIndex}, ${responseIndex})">
                                                    <i class="fas fa-times"></i> Reject
                                                </button>
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : `
                        <div class="no-responses">
                            <p><i class="fas fa-clock"></i> No supplier responses yet. Suppliers will see your request and respond soon.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function closeManageOrdersModal() {
    const modal = document.getElementById('manageOrdersModal');
    if (modal) {
        modal.remove();
    }
}

function acceptSupplierResponse(requestIndex, responseIndex) {
    const responses = JSON.parse(localStorage.getItem('supplierResponses') || '[]');
    const vendorRequests = JSON.parse(localStorage.getItem('groceryRequests') || '[]');
    
    // Find the specific response
    const request = vendorRequests[requestIndex];
    const responseToUpdate = responses.find(response => 
        response.originalRequestId === (request.id || requestIndex)
    );
    
    if (!responseToUpdate) {
        alert('Response not found!');
        return;
    }
    
    // Update response status
    const responseIndexInArray = responses.findIndex(r => r.id === responseToUpdate.id);
    responses[responseIndexInArray].status = 'accepted';
    responses[responseIndexInArray].acceptedAt = new Date().toISOString();
    
    // Save updated responses
    localStorage.setItem('supplierResponses', JSON.stringify(responses));
    
    // Show success message
    alert(`You have accepted the offer from ${responseToUpdate.supplierInfo?.name || 'the supplier'}! They will be notified.`);
    
    // Refresh the modal
    closeManageOrdersModal();
    manageOrders();
}

function rejectSupplierResponse(requestIndex, responseIndex) {
    const responses = JSON.parse(localStorage.getItem('supplierResponses') || '[]');
    const vendorRequests = JSON.parse(localStorage.getItem('groceryRequests') || '[]');
    
    // Find the specific response
    const request = vendorRequests[requestIndex];
    const responseToUpdate = responses.find(response => 
        response.originalRequestId === (request.id || requestIndex)
    );
    
    if (!responseToUpdate) {
        alert('Response not found!');
        return;
    }
    
    const reason = prompt('Please provide a reason for rejection (optional):');
    
    // Update response status
    const responseIndexInArray = responses.findIndex(r => r.id === responseToUpdate.id);
    responses[responseIndexInArray].status = 'rejected';
    responses[responseIndexInArray].rejectedAt = new Date().toISOString();
    responses[responseIndexInArray].rejectionReason = reason || 'No reason provided';
    
    // Save updated responses
    localStorage.setItem('supplierResponses', JSON.stringify(responses));
    
    // Show success message
    alert(`You have rejected the offer from ${responseToUpdate.supplierInfo?.name || 'the supplier'}. They will be notified.`);
    
    // Refresh the modal
    closeManageOrdersModal();
    manageOrders();
}

function negotiateWithSupplier(index) {
    alert('Negotiation feature will be implemented soon! For now, you can contact the supplier directly.');
}

// Make manageOrders globally accessible
window.manageOrders = manageOrders;

function testRequestButton() {
    console.log('Testing Request Items button...');
    if (typeof openRequestForm === 'function') {
        console.log('✅ openRequestForm function exists');
    } else {
        console.error('❌ openRequestForm function not found');
    }
}

// Call test function when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    testRequestButton();
});
