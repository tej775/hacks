// Manage Orders Page JavaScript
class ManageOrdersPage {
    constructor() {
        this.vendorRequests = [];
        this.supplierResponses = [];
        this.filteredRequests = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        try {
            this.loadUserData();
            this.loadOrdersData();
            this.updateStats();
            this.renderOrders();
            this.hideLoading();
        } catch (error) {
            console.error('Failed to initialize manage orders page:', error);
            this.showError('Failed to load orders data');
        }
    }

    loadUserData() {
        // Get user data from localStorage
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            document.getElementById('vendorName').textContent = user.name || 'Vendor';
        } else {
            document.getElementById('vendorName').textContent = 'Vendor';
        }
    }

    loadOrdersData() {
        // Load vendor's original requests
        const requests = localStorage.getItem('groceryRequests');
        this.vendorRequests = requests ? JSON.parse(requests) : [];

        // Load supplier responses
        const responses = localStorage.getItem('supplierResponses');
        this.supplierResponses = responses ? JSON.parse(responses) : [];

        // Group requests with their supplier responses
        this.filteredRequests = this.vendorRequests.map((request, requestIndex) => {
            const responses = this.supplierResponses.filter(response => 
                response.originalRequestId === (request.id || requestIndex)
            );
            return {
                ...request,
                requestIndex,
                supplierResponses: responses
            };
        });

        console.log('Loaded orders data:', {
            requests: this.vendorRequests.length,
            responses: this.supplierResponses.length
        });
    }

    updateStats() {
        const totalRequests = this.vendorRequests.length;
        const totalResponses = this.supplierResponses.length;
        const pendingResponses = this.supplierResponses.filter(r => r.status === 'pending').length;
        const acceptedResponses = this.supplierResponses.filter(r => r.status === 'accepted').length;

        document.getElementById('totalRequests').textContent = totalRequests;
        document.getElementById('totalResponses').textContent = totalResponses;
        document.getElementById('pendingResponses').textContent = pendingResponses;
        document.getElementById('acceptedResponses').textContent = acceptedResponses;
    }

    renderOrders() {
        const container = document.getElementById('ordersContainer');
        
        if (this.filteredRequests.length === 0) {
            container.innerHTML = this.getEmptyStateHTML();
            return;
        }

        const ordersHTML = this.filteredRequests.map((request, index) => 
            this.generateRequestHTML(request, index)
        ).join('');

        container.innerHTML = ordersHTML;
    }

    generateRequestHTML(request, requestIndex) {
        const vendorName = request.vendorInfo?.name || 'Unknown Vendor';
        const requestItems = request.items?.map(item => `${item.name} (${item.quantity})`).join(', ') || 'No items specified';
        const budgetRange = request.budgetInfo?.range || 'Not specified';
        const deliveryDate = request.deliveryInfo?.preferredDate || 'Not specified';
        const deliveryAddress = request.deliveryInfo?.address || 'Not specified';
        const requestDate = new Date(request.timestamp || Date.now()).toLocaleDateString();
        
        return `
            <div class="request-card">
                <div class="request-header">
                    <div class="request-info">
                        <h4><i class="fas fa-clipboard-list"></i> Request #${request.id || (requestIndex + 1)}</h4>
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
                        <h5><i class="fas fa-shopping-list"></i> Request Details</h5>
                        <p><strong>Items Requested:</strong> ${requestItems}</p>
                        <p><strong>Budget Range:</strong> ${budgetRange}</p>
                        <p><strong>Preferred Delivery Date:</strong> ${deliveryDate}</p>
                        <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
                        ${request.specialRequirements ? `<p><strong>Special Requirements:</strong> ${request.specialRequirements}</p>` : ''}
                    </div>
                    
                    ${request.supplierResponses.length > 0 ? `
                        <div class="supplier-responses">
                            <h5><i class="fas fa-reply"></i> Supplier Responses</h5>
                            ${request.supplierResponses.map((response, responseIndex) => 
                                this.generateSupplierResponseHTML(response, requestIndex, responseIndex)
                            ).join('')}
                        </div>
                    ` : `
                        <div class="no-responses">
                            <i class="fas fa-clock"></i>
                            <p>No supplier responses yet. Suppliers will see your request and respond soon.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    generateSupplierResponseHTML(response, requestIndex, responseIndex) {
        const statusClass = response.status === 'accepted' ? 'accepted' : 
                           response.status === 'rejected' ? 'rejected' : 'pending';
        
        return `
            <div class="supplier-response-item ${statusClass}">
                <div class="supplier-header">
                    <div class="supplier-info">
                        <h6><i class="fas fa-store"></i> ${response.supplierInfo?.name || 'Supplier'}</h6>
                        <div class="supplier-contact">
                            <span><i class="fas fa-envelope"></i> ${response.supplierInfo?.email || 'No email'}</span>
                            <span><i class="fas fa-phone"></i> ${response.supplierInfo?.phone || 'No phone'}</span>
                        </div>
                    </div>
                    <div class="response-status">
                        <span class="status-badge ${statusClass}">
                            ${response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                        </span>
                    </div>
                </div>
                
                <div class="supplier-details">
                    <p><strong>Response Message:</strong> ${response.responseMessage}</p>
                    <p><strong>Quoted Price:</strong> ₹${response.estimatedPrice}</p>
                    <p><strong>Delivery Timeline:</strong> ${response.deliveryTimeline}</p>
                    <p><strong>Response Date:</strong> ${new Date(response.timestamp).toLocaleDateString()}</p>
                    ${response.additionalNotes ? `<p><strong>Additional Notes:</strong> ${response.additionalNotes}</p>` : ''}
                </div>
                
                ${response.status === 'pending' ? `
                <div class="response-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="btn-success" onclick="window.manageOrdersPage.acceptSupplierResponse(${requestIndex}, ${responseIndex})" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-check"></i> Accept Offer
                    </button>
                    <button class="btn-danger" onclick="window.manageOrdersPage.rejectSupplierResponse(${requestIndex}, ${responseIndex})" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-times"></i> Reject Offer
                    </button>
                </div>
            ` : `
                <div class="response-status-info" style="margin-top: 15px; padding: 10px; background: ${response.status === 'accepted' ? '#d4edda' : '#f8d7da'}; border-radius: 4px;">
                    <strong>Status:</strong> ${response.status === 'accepted' ? 'Offer Accepted' : 'Offer Rejected'}
                    ${response.acceptedAt ? `<br><small>Accepted on: ${new Date(response.acceptedAt).toLocaleDateString()}</small>` : ''}
                    ${response.rejectedAt ? `<br><small>Rejected on: ${new Date(response.rejectedAt).toLocaleDateString()}</small>` : ''}
                    ${response.rejectionReason ? `<br><small>Reason: ${response.rejectionReason}</small>` : ''}
                </div>
            `}
            </div>
        `;
    }

    getEmptyStateHTML() {
        return `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No Requests Found</h3>
                <p>You haven't submitted any grocery requests yet. Start by creating your first request to connect with suppliers.</p>
                <a href="vendor-dashboard.html" class="btn-primary">
                    <i class="fas fa-plus"></i> Create First Request
                </a>
            </div>
        `;
    }

    acceptSupplierResponse(requestIndex, responseIndex) {
        try {
            const request = this.filteredRequests[requestIndex];
            const response = request.supplierResponses[responseIndex];
            
            if (!response) {
                alert('Response not found!');
                return;
            }
            
            // Find and update the response in the main array
            const responseToUpdate = this.supplierResponses.find(r => r.id === response.id);
            if (responseToUpdate) {
                responseToUpdate.status = 'accepted';
                responseToUpdate.acceptedAt = new Date().toISOString();
                
                // Add vendor information to the response for supplier dashboard
                responseToUpdate.vendorInfo = {
                    name: request.vendorInfo?.name || request.vendorName || 'Unknown Vendor',
                    email: request.vendorInfo?.email || request.contactEmail || 'No email provided',
                    phone: request.vendorInfo?.phone || request.phoneNumber || 'No phone provided'
                };
                
                // Ensure original request data is preserved (avoid circular reference)
                responseToUpdate.originalRequest = {
                    id: request.id,
                    vendorName: request.vendorName,
                    contactEmail: request.contactEmail,
                    phoneNumber: request.phoneNumber,
                    items: request.items || [],
                    groceryItems: request.groceryItems || 'No items specified',
                    budgetMin: request.budgetMin,
                    budgetMax: request.budgetMax,
                    deliveryAddress: request.deliveryAddress,
                    timestamp: request.timestamp
                    // Exclude supplierResponses to avoid circular reference
                };
                
                // Save updated responses
                localStorage.setItem('supplierResponses', JSON.stringify(this.supplierResponses));
                
                // Show success message
                alert(`You have accepted the offer from ${response.supplierInfo?.name || 'the supplier'}! They will be notified and can see this in their accepted orders.`);
                
                // Refresh the page
                this.refreshOrders();
            }
        } catch (error) {
            console.error('Error accepting response:', error);
            alert('Failed to accept response. Please try again.');
        }
    }
    rejectSupplierResponse(requestIndex, responseIndex) {
        try {
            const request = this.filteredRequests[requestIndex];
            const response = request.supplierResponses[responseIndex];
            
            if (!response) {
                alert('Response not found!');
                return;
            }
            
            const reason = prompt('Please provide a reason for rejection (optional):');
            
            // Find and update the response in the main array
            const responseToUpdate = this.supplierResponses.find(r => r.id === response.id);
            if (responseToUpdate) {
                responseToUpdate.status = 'rejected';
                responseToUpdate.rejectedAt = new Date().toISOString();
                responseToUpdate.rejectionReason = reason || 'No reason provided';
                
                // Save updated responses
                localStorage.setItem('supplierResponses', JSON.stringify(this.supplierResponses));
                
                // Show success message
                alert(`You have rejected the offer from ${response.supplierInfo?.name || 'the supplier'}. They will be notified.`);
                
                // Refresh the page
                this.refreshOrders();
            }
        } catch (error) {
            console.error('Error rejecting response:', error);
            alert('Failed to reject response. Please try again.');
        }
    }

    refreshOrders() {
        this.showLoading();
        setTimeout(() => {
            this.loadOrdersData();
            this.updateStats();
            this.renderOrders();
            this.hideLoading();
        }, 500);
    }

    filterOrders() {
        const filter = document.getElementById('statusFilter').value;
        this.currentFilter = filter;
        
        if (filter === 'all') {
            this.filteredRequests = this.vendorRequests.map((request, requestIndex) => {
                const responses = this.supplierResponses.filter(response => 
                    response.originalRequestId === (request.id || requestIndex)
                );
                return {
                    ...request,
                    requestIndex,
                    supplierResponses: responses
                };
            });
        } else {
            this.filteredRequests = this.vendorRequests.map((request, requestIndex) => {
                const responses = this.supplierResponses.filter(response => 
                    response.originalRequestId === (request.id || requestIndex) && 
                    response.status === filter
                );
                return {
                    ...request,
                    requestIndex,
                    supplierResponses: responses
                };
            }).filter(request => request.supplierResponses.length > 0);
        }
        
        this.renderOrders();
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }

    showError(message) {
        alert(`Error: ${message}`);
    }
}

// Global functions
function goBack() {
    window.location.href = 'vendor-dashboard.html';
}

function filterOrders() {
    if (window.manageOrdersPage) {
        window.manageOrdersPage.filterOrders();
    }
}

function refreshOrders() {
    if (window.manageOrdersPage) {
        window.manageOrdersPage.refreshOrders();
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.manageOrdersPage = new ManageOrdersPage();
});
