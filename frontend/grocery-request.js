// Grocery Request Form JavaScript
class GroceryRequestForm {
    constructor() {
        this.apiBaseUrl = 'https://b2b-backend-u7k0.onrender.com/api';
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.setMinDate();
        this.populateUserInfo();
    }

    loadUserData() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    populateUserInfo() {
        if (this.currentUser) {
            document.getElementById('vendorName').value = this.currentUser.name || '';
            document.getElementById('contactEmail').value = this.currentUser.email || '';
            document.getElementById('phoneNumber').value = this.currentUser.phone || '';
        }
    }

    setMinDate() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const minDate = tomorrow.toISOString().split('T')[0];
        document.getElementById('preferredDate').min = minDate;
        document.getElementById('preferredDate').value = minDate;
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('groceryRequestForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });

        // Real-time validation
        const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Auto-save draft every 2 minutes
        setInterval(() => {
            this.autoSaveDraft();
        }, 120000);
    }

    addItem() {
        const itemsList = document.getElementById('itemsList');
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        
        itemRow.innerHTML = `
            <div class="form-group">
                <label>Item Category</label>
                <select name="category[]" class="item-category">
                    <option value="">Select Category</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains & Cereals</option>
                    <option value="dairy">Dairy Products</option>
                    <option value="meat">Meat & Poultry</option>
                    <option value="seafood">Seafood</option>
                    <option value="spices">Spices & Condiments</option>
                    <option value="beverages">Beverages</option>
                    <option value="snacks">Snacks & Packaged Foods</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Item Name *</label>
                <input type="text" name="itemName[]" placeholder="e.g., Tomatoes, Rice, Milk" required>
            </div>
            <div class="form-group">
                <label>Quantity *</label>
                <input type="text" name="quantity[]" placeholder="e.g., 10 kg, 5 liters" required>
            </div>
            <div class="form-group">
                <label>Quality/Grade</label>
                <select name="quality[]">
                    <option value="">Select Quality</option>
                    <option value="premium">Premium</option>
                    <option value="standard">Standard</option>
                    <option value="economy">Economy</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <input type="text" name="notes[]" placeholder="Special requirements">
            </div>
            <button type="button" class="btn-remove-item" onclick="removeItem(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        itemsList.appendChild(itemRow);
        
        // Add validation to new fields
        const newRequiredInputs = itemRow.querySelectorAll('input[required]');
        newRequiredInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
        
        // Animate the new item
        itemRow.style.opacity = '0';
        itemRow.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            itemRow.style.transition = 'all 0.3s ease';
            itemRow.style.opacity = '1';
            itemRow.style.transform = 'translateY(0)';
        }, 10);
    }

    removeItem(button) {
        const itemRow = button.closest('.item-row');
        const itemsList = document.getElementById('itemsList');
        
        // Don't allow removing the last item
        if (itemsList.children.length <= 1) {
            this.showNotification('At least one item is required', 'warning');
            return;
        }
        
        // Animate removal
        itemRow.style.transition = 'all 0.3s ease';
        itemRow.style.opacity = '0';
        itemRow.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            itemRow.remove();
        }, 300);
    }

    validateField(field) {
        const formGroup = field.closest('.form-group');
        this.clearFieldError(formGroup);
        
        let isValid = true;
        let errorMessage = '';
        
        // Required field validation
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation
        if (field.type === 'tel' && field.value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }
        
        // Date validation
        if (field.type === 'date' && field.value) {
            const selectedDate = new Date(field.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate <= today) {
                isValid = false;
                errorMessage = 'Please select a future date';
            }
        }
        
        if (!isValid) {
            this.showFieldError(formGroup, errorMessage);
        }
        
        return isValid;
    }

    showFieldError(formGroup, message) {
        formGroup.classList.add('error');
        
        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }

    clearFieldError(formGroup) {
        if (typeof formGroup === 'object' && formGroup.closest) {
            formGroup = formGroup.closest('.form-group');
        }
        
        formGroup.classList.remove('error');
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    validateForm() {
        const form = document.getElementById('groceryRequestForm');
        const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        // Clear all previous errors
        document.querySelectorAll('.form-group.error').forEach(group => {
            this.clearFieldError(group);
        });
        
        // Validate each required field
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Validate that at least one item is added
        const itemRows = document.querySelectorAll('.item-row');
        if (itemRows.length === 0) {
            isValid = false;
            this.showNotification('Please add at least one grocery item', 'error');
        }
        
        return isValid;
    }

    collectFormData() {
        const form = document.getElementById('groceryRequestForm');
        const formData = new FormData(form);
        
        // Collect basic form data
        const data = {
            vendorInfo: {
                name: formData.get('vendorName'),
                email: formData.get('contactEmail'),
                phone: formData.get('phoneNumber'),
                businessType: formData.get('businessType')
            },
            deliveryInfo: {
                address: formData.get('deliveryAddress'),
                preferredDate: formData.get('preferredDate'),
                urgency: formData.get('urgency')
            },
            budgetInfo: {
                range: formData.get('budgetRange'),
                paymentTerms: formData.get('paymentTerms')
            },
            specialRequirements: formData.get('specialRequirements'),
            preferences: {
                organic: formData.get('organicPreferred') === '1',
                bulkDiscount: formData.get('bulkDiscount') === '1',
                regularSupply: formData.get('regularSupply') === '1'
            },
            items: [],
            timestamp: new Date().toISOString()
        };
        
        // Collect items data
        const categories = formData.getAll('category[]');
        const itemNames = formData.getAll('itemName[]');
        const quantities = formData.getAll('quantity[]');
        const qualities = formData.getAll('quality[]');
        const notes = formData.getAll('notes[]');
        
        for (let i = 0; i < itemNames.length; i++) {
            if (itemNames[i].trim()) {
                data.items.push({
                    category: categories[i] || '',
                    name: itemNames[i].trim(),
                    quantity: quantities[i].trim(),
                    quality: qualities[i] || '',
                    notes: notes[i] || ''
                });
            }
        }
        
        return data;
    }

    async submitForm() {
        if (!this.validateForm()) {
            this.showNotification('Please fix the errors in the form', 'error');
            return;
        }
        
        const formData = this.collectFormData();
        
        try {
            this.showLoading();
            
            // Add unique ID and timestamp to the request
            const groceryRequest = {
                ...formData,
                id: 'GR-' + Date.now(),
                submittedAt: new Date().toISOString(),
                status: 'pending'
            };
            
            // Save to localStorage so all suppliers can see it
            this.saveGroceryRequestForSuppliers(groceryRequest);
            
            this.hideLoading();
            this.showSuccessModal(groceryRequest.id);
            this.clearDraft();
            
            console.log('Grocery request submitted successfully:', groceryRequest);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            this.hideLoading();
            this.showNotification('Failed to submit request. Please try again.', 'error');
        }
    }
    
    saveGroceryRequestForSuppliers(request) {
        // Get existing grocery requests from localStorage
        const existingRequests = JSON.parse(localStorage.getItem('groceryRequests') || '[]');
        
        // Add the new request
        existingRequests.push(request);
        
        // Save back to localStorage
        localStorage.setItem('groceryRequests', JSON.stringify(existingRequests));
        
        console.log('Grocery request saved for suppliers:', request);
        console.log('Total requests now:', existingRequests.length);
    }

    saveDraft() {
        const formData = this.collectFormData();
        localStorage.setItem('groceryRequestDraft', JSON.stringify(formData));
        this.showNotification('Draft saved successfully', 'success');
    }

    autoSaveDraft() {
        const form = document.getElementById('groceryRequestForm');
        const hasData = Array.from(form.elements).some(element => element.value.trim());
        
        if (hasData) {
            const formData = this.collectFormData();
            localStorage.setItem('groceryRequestDraft', JSON.stringify(formData));
        }
    }

    loadDraft() {
        const draft = localStorage.getItem('groceryRequestDraft');
        if (draft) {
            try {
                const data = JSON.parse(draft);
                this.populateFormWithData(data);
                this.showNotification('Draft loaded', 'info');
            } catch (error) {
                console.error('Error loading draft:', error);
            }
        }
    }

    clearDraft() {
        localStorage.removeItem('groceryRequestDraft');
    }

    populateFormWithData(data) {
        // Populate vendor info
        if (data.vendorInfo) {
            document.getElementById('vendorName').value = data.vendorInfo.name || '';
            document.getElementById('contactEmail').value = data.vendorInfo.email || '';
            document.getElementById('phoneNumber').value = data.vendorInfo.phone || '';
            document.getElementById('businessType').value = data.vendorInfo.businessType || '';
        }
        
        // Populate delivery info
        if (data.deliveryInfo) {
            document.getElementById('deliveryAddress').value = data.deliveryInfo.address || '';
            document.getElementById('preferredDate').value = data.deliveryInfo.preferredDate || '';
            document.getElementById('urgency').value = data.deliveryInfo.urgency || '';
        }
        
        // Populate budget info
        if (data.budgetInfo) {
            document.getElementById('budgetRange').value = data.budgetInfo.range || '';
            document.getElementById('paymentTerms').value = data.budgetInfo.paymentTerms || '';
        }
        
        // Populate other fields
        document.getElementById('specialRequirements').value = data.specialRequirements || '';
        
        // Populate preferences
        if (data.preferences) {
            document.querySelector('input[name="organicPreferred"]').checked = data.preferences.organic || false;
            document.querySelector('input[name="bulkDiscount"]').checked = data.preferences.bulkDiscount || false;
            document.querySelector('input[name="regularSupply"]').checked = data.preferences.regularSupply || false;
        }
    }

    showSuccessModal(requestId) {
        document.getElementById('requestId').textContent = requestId;
        document.getElementById('successModal').classList.add('show');
    }

    closeModal() {
        document.getElementById('successModal').classList.remove('show');
        setTimeout(() => {
            window.location.href = 'vendor-dashboard.html';
        }, 500);
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('show');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('show');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#2563eb'
        };
        return colors[type] || '#2563eb';
    }

    goBack() {
        if (confirm('Are you sure you want to go back? Any unsaved changes will be lost.')) {
            window.location.href = 'vendor-dashboard.html';
        }
    }

    getToken() {
        return localStorage.getItem('authToken') || 'demo_token';
    }
}

// Global functions for onclick handlers
window.addItem = () => groceryForm.addItem();
window.removeItem = (button) => groceryForm.removeItem(button);
window.saveDraft = () => groceryForm.saveDraft();
window.closeModal = () => groceryForm.closeModal();
window.goBack = () => groceryForm.goBack();

// Initialize form when DOM is loaded
let groceryForm;
document.addEventListener('DOMContentLoaded', () => {
    groceryForm = new GroceryRequestForm();
    
    // Check for draft on load
    const hasDraft = localStorage.getItem('groceryRequestDraft');
    if (hasDraft) {
        setTimeout(() => {
            if (confirm('You have a saved draft. Would you like to load it?')) {
                groceryForm.loadDraft();
            }
        }, 1000);
    }
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
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
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
