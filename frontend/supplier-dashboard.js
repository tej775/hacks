// Supplier Dashboard JavaScript
class SupplierDashboard {
    constructor() {
        this.currentUser = null;
        this.groceryRequests = [];
        this.init();
    }

    init() {
        try {
            this.loadUserData();
            this.loadGroceryRequests();
            this.loadDashboardData();
            this.setupEventListeners();
            this.hideLoading();
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    loadUserData() {
        // Get user data from localStorage or session
        const userData = localStorage.getItem('userData');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            document.getElementById('supplierName').textContent = this.currentUser.name || 'Supplier';
        } else {
            // Set default supplier name
            document.getElementById('supplierName').textContent = 'Supplier Dashboard';
        }
    }

    loadGroceryRequests() {
        // Load grocery requests from localStorage
        const requests = localStorage.getItem('groceryRequests');
        this.groceryRequests = requests ? JSON.parse(requests) : [];
        console.log('Loaded grocery requests:', this.groceryRequests);
    }

    loadDashboardData() {
        try {
            this.showLoading();
            
            // Load all orders (pending, accepted, rejected)
            const allOrders = this.getAllOrdersWithStatus();
            
            const ratings = { average: 4.8, total: 127, breakdown: [75, 20, 3, 1, 1] };
            const revenue = { total: 25000, growth: 8.5 };
            const vendors = allOrders.length;

            this.updateStatsCards(allOrders, ratings, revenue, vendors);
            this.updateOrdersTable(allOrders);
            this.updateRatingsSection(ratings);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    getAllOrdersWithStatus() {
        // Get all grocery requests and supplier responses to determine status
        const allRequests = this.groceryRequests;
        const supplierResponses = JSON.parse(localStorage.getItem('supplierResponses') || '[]');
        
        console.log('Debug - All requests:', allRequests);
        console.log('Debug - Supplier responses:', supplierResponses);
        
        // Map each request with its current status
        const ordersWithStatus = allRequests.map((request, index) => {
            const requestId = request.id || index;
            
            // Find supplier response for this request - check multiple possible ID fields
            const response = supplierResponses.find(resp => {
                // Check various ways the response might be linked to the request
                return resp.originalRequestId === requestId ||
                       resp.originalRequest?.id === requestId ||
                       resp.requestId === requestId ||
                       (resp.originalRequest && (
                           resp.originalRequest.vendorName === request.vendorName ||
                           resp.originalRequest.contactEmail === request.contactEmail
                       ));
            });
            
            let status = 'Pending';
            if (response) {
                console.log(`Debug - Found response for request ${requestId}:`, response);
                if (response.status === 'accepted') {
                    status = 'Accepted';
                } else if (response.status === 'rejected') {
                    status = 'Rejected';
                } else {
                    status = 'Responded';
                }
            }
            
            return {
                ...request,
                currentStatus: status,
                responseData: response
            };
        });
        
        console.log('Debug - All orders with status:', ordersWithStatus);
        return ordersWithStatus;
    }

    updateAcceptedOrdersTable(acceptedOrders) {
        const tbody = document.getElementById('acceptedOrdersTableBody');
        
        if (!tbody) {
            console.error('acceptedOrdersTableBody element not found');
            return;
        }
        
        if (!acceptedOrders || acceptedOrders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No accepted orders yet</td></tr>';
            return;
        }

        tbody.innerHTML = acceptedOrders.map((order, index) => {
            const orderId = order.originalRequestId || (index + 1);
            const vendorName = order.vendorInfo?.name || 'Unknown Vendor';
            const vendorEmail = order.vendorInfo?.email || 'No email provided';
            const vendorPhone = order.vendorInfo?.phone || 'No phone provided';
            const acceptedDate = new Date(order.acceptedAt || order.timestamp).toLocaleDateString();
            
            // Extract grocery items from the original request
            const groceryItems = order.originalRequest?.items?.map(item => 
                `${item.name} (${item.quantity})`
            ).join(', ') || order.originalRequest?.groceryItems || 'No items specified';
            
            return `
                <tr>
                    <td>#${orderId}</td>
                    <td>${vendorName}</td>
                    <td>${vendorEmail}</td>
                    <td>${vendorPhone}</td>
                    <td>${groceryItems}</td>
                    <td><span class="status completed">Accepted</span></td>
                </tr>
            `;
        }).join('');
    }

    // View Orders - Show vendor grocery requests that haven't been responded to yet
    viewOrders() {
        console.log('Opening orders page with grocery requests:', this.groceryRequests);
        
        if (this.groceryRequests.length === 0) {
            this.showNotification('No grocery requests found from vendors yet.', 'info');
            return;
        }
        
        // Filter out requests that have already been responded to by any supplier
        const supplierResponses = JSON.parse(localStorage.getItem('supplierResponses') || '[]');
        
        const unrespondedRequests = this.groceryRequests.filter((request, index) => {
            // Check if ANY supplier has responded to this request
            const requestId = request.id || index;
            const hasAnyResponse = supplierResponses.some(response => 
                response.originalRequestId === requestId
            );
            return !hasAnyResponse; // Only show requests that have NO responses yet
        });
        
        console.log('Filtered unresponded requests:', unrespondedRequests);
        console.log('Total supplier responses:', supplierResponses.length);
        
        if (unrespondedRequests.length === 0) {
            this.showNotification('No new requests to respond to. All available requests have been responded to by suppliers.', 'info');
            return;
        }
        
        // Create and show orders modal with filtered requests
        this.showOrdersModal(unrespondedRequests);
    }
    
    showOrdersModal(filteredRequests = null) {
        // Use filtered requests if provided, otherwise use all requests
        const requestsToShow = filteredRequests || this.groceryRequests;
        
        // Create modal HTML
        const modalHTML = `
            <div id="ordersModal" class="modal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h3><i class="fas fa-shopping-cart"></i> Vendor Grocery Requests</h3>
                        <button class="modal-close" onclick="closeOrdersModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="orders-list">
                            ${this.generateOrdersHTML(requestsToShow)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        document.getElementById('ordersModal').style.display = 'flex';
    }
    
    generateOrdersHTML(requests = null) {
        // Use provided requests or fall back to this.groceryRequests
        const requestsToProcess = requests || this.groceryRequests;
        
        return requestsToProcess.map((request, index) => {
            // Extract vendor info from nested structure
            const vendorName = request.vendorInfo?.name || request.vendorName || 'Unknown Vendor';
            const contactEmail = request.vendorInfo?.email || request.contactEmail || 'No email provided';
            const phoneNumber = request.vendorInfo?.phone || request.phoneNumber || 'No phone provided';
            const deliveryAddress = request.deliveryInfo?.address || request.deliveryAddress || 'No address provided';
            const preferredDate = request.deliveryInfo?.preferredDate || request.preferredDate || 'No date specified';
            const budgetRange = request.budgetInfo?.range || request.budgetRange || 'No budget specified';
            
            return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <h4>Request #${request.id || (index + 1)}</h4>
                        <p class="vendor-name"><i class="fas fa-user"></i> ${vendorName}</p>
                        <p class="order-date"><i class="fas fa-calendar"></i> ${new Date(request.submittedAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div class="order-status">
                        <span class="status-badge new">New Request</span>
                    </div>
                </div>
                <div class="order-details">
                    <div class="contact-info">
                        <p><i class="fas fa-envelope"></i> ${contactEmail}</p>
                        <p><i class="fas fa-phone"></i> ${phoneNumber}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${deliveryAddress}</p>
                    </div>
                    <div class="items-list">
                        <h5>Requested Items:</h5>
                        <ul>
                            ${request.items && request.items.length > 0 ? request.items.map(item => `
                                <li>${item.name} - ${item.quantity} (${item.category})</li>
                            `).join('') : '<li>No items specified</li>'}
                        </ul>
                    </div>
                    <div class="budget-info">
                        <p><strong>Budget:</strong> ${budgetRange}</p>
                        <p><strong>Delivery Date:</strong> ${preferredDate}</p>
                        <p><strong>Business Type:</strong> ${request.vendorInfo?.businessType || 'Not specified'}</p>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn-primary" onclick="respondToRequest(${index})">
                        <i class="fas fa-reply"></i> Respond to Request
                    </button>
                    <button class="btn-secondary" onclick="viewRequestDetails(${index})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `;
        }).join('');
    }

    updateStatsCards(orders, ratings, revenue, vendors) {
        // Update orders count
        document.getElementById('ordersCount').textContent = orders.length || 0;
        
        // Update average rating
        const avgRating = ratings.average || 4.8;
        document.getElementById('averageRating').textContent = avgRating.toFixed(1);
        this.updateStarRating(document.querySelector('.stat-card.rating .rating-stars'), avgRating);
        
        // Update revenue
        document.getElementById('totalRevenue').textContent = `$${revenue.total.toLocaleString()}`;
        
        // Update active vendors
        document.getElementById('activeVendors').textContent = vendors.active || 0;
    }

    updateOrdersTable(orders) {
        const tbody = document.getElementById('ordersTableBody');
        
        if (!tbody) {
            console.error('ordersTableBody element not found');
            return;
        }
        
        if (!orders || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No orders found</td></tr>';
            return;
        }

        // Display all orders with their current status
        tbody.innerHTML = orders.map((order, index) => {
            const orderId = order.id || (index + 1);
            const vendorName = order.vendorInfo?.name || order.vendorName || 'Unknown Vendor';
            const vendorEmail = order.vendorInfo?.email || order.contactEmail || 'No email provided';
            const items = order.items?.map(item => item.name).join(', ') || order.groceryItems || 'No items';
            const status = order.currentStatus || 'Pending';
            
            // Get status styling
            let statusClass = 'pending';
            if (status === 'Accepted') statusClass = 'completed';
            else if (status === 'Rejected') statusClass = 'cancelled';
            else if (status === 'Responded') statusClass = 'processing';
            
            return `
                <tr>
                    <td>#${orderId}</td>
                    <td>${vendorName}</td>
                    <td>${vendorEmail}</td>
                    <td>${items}</td>
                    <td><span class="status ${statusClass}">${status}</span></td>
                </tr>
            `;
        }).join('');
    }

    updateRatingsSection(ratings) {
        // Update overall rating
        document.getElementById('overallRating').textContent = ratings.average.toFixed(1);
        document.getElementById('totalReviews').textContent = ratings.total;
        
        // Update star rating
        this.updateStarRating(document.querySelector('.rating-overview .rating-stars'), ratings.average);
        
        // Update rating breakdown
        if (ratings.breakdown) {
            const bars = document.querySelectorAll('.rating-bar');
            bars.forEach((bar, index) => {
                const percentage = ratings.breakdown[5 - index] || 0;
                const fill = bar.querySelector('.fill');
                const percentText = bar.querySelector('span:last-child');
                
                fill.style.width = `${percentage}%`;
                percentText.textContent = `${percentage}%`;
            });
        }
        
        // Update recent reviews
        this.updateRecentReviews(ratings.recent || []);
    }

    updateRecentReviews(reviews) {
        const container = document.getElementById('recentReviewsList');
        
        if (!reviews || reviews.length === 0) {
            container.innerHTML = '<p class="no-data">No recent reviews</p>';
            return;
        }

        container.innerHTML = reviews.slice(0, 3).map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="reviewer-info">
                        <strong>${review.reviewer}</strong>
                        <div class="rating-stars small">
                            ${this.generateStarHTML(review.rating)}
                        </div>
                    </div>
                    <span class="review-date">${this.formatDate(review.date)}</span>
                </div>
                <p class="review-text">${review.text}</p>
            </div>
        `).join('');
    }

    updateStarRating(container, rating) {
        const stars = container.querySelectorAll('i');
        stars.forEach((star, index) => {
            if (index < Math.floor(rating)) {
                star.className = 'fas fa-star';
            } else if (index < rating) {
                star.className = 'fas fa-star-half-alt';
            } else {
                star.className = 'far fa-star';
            }
        });
    }

    generateStarHTML(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                html += '<i class="fas fa-star"></i>';
            } else if (i <= rating) {
                html += '<i class="fas fa-star-half-alt"></i>';
            } else {
                html += '<i class="far fa-star"></i>';
            }
        }
        return html;
    }

    setupEventListeners() {
        // User menu toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('.user-menu-btn')) {
                this.toggleUserMenu();
            } else if (!e.target.closest('.user-menu')) {
                this.hideUserMenu();
            }
        });

        // Refresh data periodically
        setInterval(() => {
            this.loadDashboardData();
        }, 300000); // Refresh every 5 minutes
    }

    toggleUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.toggle('show');
    }

    hideUserMenu() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.remove('show');
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }

    showError(message) {
        // Create a simple error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            z-index: 10001;
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
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fas fa-check-circle';
            case 'error': return 'fas fa-exclamation-circle';
            case 'warning': return 'fas fa-exclamation-triangle';
            default: return 'fas fa-info-circle';
        }
    }

    getNotificationColor(type) {
        switch(type) {
            case 'success': return 'linear-gradient(135deg, #28a745, #20c997)';
            case 'error': return 'linear-gradient(135deg, #dc3545, #e74c3c)';
            case 'warning': return 'linear-gradient(135deg, #ffc107, #f39c12)';
            default: return 'linear-gradient(135deg, #667eea, #764ba2)';
        }
    }

    getToken() {
        return localStorage.getItem('authToken') || 'demo_token';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Mock data for demo purposes
    getMockOrders() {
        return [
            {
                id: 'ORD-001',
                vendor: 'Tech Solutions Inc',
                items: 'Laptops (5)',
                amount: 7500,
                status: 'Completed',
                date: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 'ORD-002',
                vendor: 'Office Supplies Co',
                items: 'Stationery Bundle',
                amount: 250,
                status: 'Processing',
                date: new Date(Date.now() - 172800000).toISOString()
            },
            {
                id: 'ORD-003',
                vendor: 'Industrial Equipment Ltd',
                items: 'Manufacturing Tools',
                amount: 12000,
                status: 'Shipped',
                date: new Date(Date.now() - 259200000).toISOString()
            }
        ];
    }

    getMockRatings() {
        return {
            average: 4.8,
            total: 127,
            breakdown: [1, 1, 3, 20, 75], // 1-star to 5-star percentages
            recent: [
                {
                    reviewer: 'John Doe',
                    rating: 5,
                    text: 'Excellent service and fast delivery. Highly recommended!',
                    date: new Date(Date.now() - 172800000).toISOString()
                },
                {
                    reviewer: 'Jane Smith',
                    rating: 4,
                    text: 'Good quality products, will order again.',
                    date: new Date(Date.now() - 259200000).toISOString()
                },
                {
                    reviewer: 'Mike Johnson',
                    rating: 5,
                    text: 'Outstanding customer support and product quality.',
                    date: new Date(Date.now() - 345600000).toISOString()
                }
            ]
        };
    }

    // Action handlers
    viewOrder(orderId) {
        alert(`Viewing order: ${orderId}`);
        // Implement order detail view
    }

    viewAllOrders() {
        alert('Redirecting to orders page...');
        // Implement navigation to orders page
    }

    viewAllReviews() {
        alert('Redirecting to reviews page...');
        // Implement navigation to reviews page
    }

    updateInventory() {
        alert('Opening inventory management...');
        // Implement inventory management
    }

    viewAnalytics() {
        alert('Opening analytics dashboard...');
        // Implement analytics view
    }

    manageProducts() {
        alert('Opening product management...');
        // Implement product management
    }

    contactSupport() {
        alert('Opening support chat...');
        // Implement support system
    }

    editProfile() {
        alert('Opening profile editor...');
        // Implement profile editing
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
            window.location.href = 'signin.html';
        }
    }
}

// Global functions for onclick handlers
window.viewOrders = () => {
    console.log('Orders button clicked!');
    if (window.supplierDashboard) {
        window.supplierDashboard.viewOrders();
    } else {
        console.error('Supplier dashboard not initialized');
        alert('Dashboard not ready. Please refresh the page.');
    }
};

window.closeOrdersModal = () => {
    const modal = document.getElementById('ordersModal');
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
    }
};

window.respondToRequest = (index) => {
    console.log('Responding to request:', index);
    
    // Get the request data
    const requests = JSON.parse(localStorage.getItem('groceryRequests') || '[]');
    const request = requests[index];
    
    if (!request) {
        alert('Request not found!');
        return;
    }
    
    // Show supplier response form
    showSupplierResponseForm(request, index);
}

function viewRequestDetails(index) {
    console.log('Viewing request details:', index);
    // Implementation for viewing request details
}

function showSupplierResponseForm(request, requestIndex) {
    const vendorName = request.vendorInfo?.name || 'Unknown Vendor';
    
    const responseFormHTML = `
        <div id="responseModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-reply"></i> Respond to ${vendorName}'s Request</h3>
                    <button class="modal-close" onclick="closeResponseModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="supplierResponseForm">
                        <div class="form-group">
                            <label>Your Response Message:</label>
                            <textarea id="responseMessage" placeholder="Enter your response to the vendor..." rows="4" required></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>Estimated Price (₹):</label>
                            <input type="number" id="estimatedPrice" placeholder="Enter your price quote" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Delivery Timeline:</label>
                            <select id="deliveryTimeline" required>
                                <option value="">Select timeline</option>
                                <option value="same-day">Same Day</option>
                                <option value="1-2-days">1-2 Days</option>
                                <option value="3-5-days">3-5 Days</option>
                                <option value="1-week">1 Week</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Additional Notes:</label>
                            <textarea id="additionalNotes" placeholder="Any additional information..." rows="2"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closeResponseModal()">Cancel</button>
                            <button type="submit" class="btn-primary">Send Response</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', responseFormHTML);
    document.getElementById('responseModal').style.display = 'flex';
    
    // Handle form submission
    document.getElementById('supplierResponseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitSupplierResponse(request, requestIndex);
    });
}

function closeResponseModal() {
    const modal = document.getElementById('responseModal');
    if (modal) {
        modal.remove();
    }
}

function submitSupplierResponse(originalRequest, requestIndex) {
    const responseMessage = document.getElementById('responseMessage').value;
    const estimatedPrice = document.getElementById('estimatedPrice').value;
    const deliveryTimeline = document.getElementById('deliveryTimeline').value;
    const additionalNotes = document.getElementById('additionalNotes').value;
    
    if (!responseMessage || !estimatedPrice || !deliveryTimeline) {
        alert('Please fill in all required fields!');
        return;
    }
    
    // Get current supplier info (you might want to get this from localStorage)
    const supplierInfo = {
        name: 'Current Supplier', // Replace with actual supplier name
        email: 'supplier@example.com', // Replace with actual supplier email
        phone: '+91-9876543210' // Replace with actual supplier phone
    };
    
    // Create supplier response object
    const supplierResponse = {
        id: Date.now(),
        originalRequestId: originalRequest.id || requestIndex,
        vendorInfo: originalRequest.vendorInfo,
        supplierInfo: supplierInfo,
        responseMessage: responseMessage,
        estimatedPrice: parseFloat(estimatedPrice),
        deliveryTimeline: deliveryTimeline,
        additionalNotes: additionalNotes,
        status: 'pending',
        timestamp: new Date().toISOString(),
        originalRequest: originalRequest
    };
    
    // Save supplier response to localStorage for vendor to see
    let supplierResponses = JSON.parse(localStorage.getItem('supplierResponses') || '[]');
    supplierResponses.push(supplierResponse);
    localStorage.setItem('supplierResponses', JSON.stringify(supplierResponses));
    
    // Close modal and show success message
    closeResponseModal();
    alert(`Your response has been sent to ${originalRequest.vendorInfo?.name || 'the vendor'}! They will review and get back to you.`);
    
    // Optionally close the orders modal too
    closeOrdersModal();
}

window.viewRequestDetails = (index) => {
    console.log('Viewing request details:', index);
    // Implementation for viewing request details
    const requests = JSON.parse(localStorage.getItem('groceryRequests') || '[]');
    const request = requests[index];
    if (request) {
        alert(`Request Details:\n\nVendor: ${request.vendorName}\nEmail: ${request.contactEmail}\nPhone: ${request.phoneNumber}\nItems: ${request.items ? request.items.length : 0} items\nBudget: ₹${request.budgetMin || 0} - ₹${request.budgetMax || 0}`);
    }
};

window.updateInventory = () => {
    alert('Update Inventory feature coming soon!');
};

window.manageProducts = () => {
    alert('Manage Products feature coming soon!');
};

window.contactSupport = () => {
    alert('Contact Support feature coming soon!');
};

window.toggleUserMenu = () => {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
};

window.editProfile = () => {
    alert('Edit Profile feature coming soon!');
};

window.logout = () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userData');
        window.location.href = 'signin.html';
    }
};

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing supplier dashboard...');
    window.supplierDashboard = new SupplierDashboard();
    dashboard = window.supplierDashboard;
    console.log('Supplier dashboard initialized:', window.supplierDashboard);
});

// Add CSS for status badges and error notifications
const style = document.createElement('style');
style.textContent = `
    .status {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
        text-transform: uppercase;
    }
    
    .status.completed {
        background: #dcfce7;
        color: #166534;
    }
    
    .status.processing {
        background: #fef3c7;
        color: #92400e;
    }
    
    .status.shipped {
        background: #dbeafe;
        color: #1e40af;
    }
    
    .status.cancelled {
        background: #fee2e2;
        color: #991b1b;
    }
    
    .btn-sm {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: var(--transition);
    }
    
    .btn-sm:hover {
        background: var(--secondary-color);
    }
    
    .error-notification {
        animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
