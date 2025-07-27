// Backend API URL
const API_URL = 'http://localhost:5000/api';

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", function () {
  // UI initialization only
  console.log('Signup page loaded');
  
  // Show main signup form by default
  showMainSignup();
});

// Initialize Google Sign-In (disabled for now)
function initializeGoogleSignIn() {
  // Google Sign-In disabled - remove client_id error
  console.log('Google Sign-In disabled');
}

// Form Display Functions
function showMainSignup() {
  const signupForm = document.getElementById("signupForm");
  const vendorSignupForm = document.getElementById("vendorSignupForm");
  const supplierSignupForm = document.getElementById("supplierSignupForm");
  const roleModal = document.getElementById("roleModal");

  // Show main signup form
  if (signupForm) signupForm.classList.remove("hidden");
  
  // Hide other forms
  if (vendorSignupForm) vendorSignupForm.classList.add("hidden");
  if (supplierSignupForm) supplierSignupForm.classList.add("hidden");
  if (roleModal) roleModal.classList.remove("active");
}

// Role Selection Functions
function showRoleSelection() {
  const roleModal = document.getElementById("roleModal");
  if (roleModal) {
    roleModal.classList.add("active");
  }
}

function hideRoleSelection() {
  const roleModal = document.getElementById("roleModal");
  if (roleModal) {
    roleModal.classList.remove("active");
  }
}

function selectRole(role) {
  const vendorSignupForm = document.getElementById("vendorSignupForm");
  const supplierSignupForm = document.getElementById("supplierSignupForm");
  const signupForm = document.getElementById("signupForm");
  const roleModal = document.getElementById("roleModal");

  // Hide main signup form and role modal
  if (signupForm) signupForm.classList.add("hidden");
  if (roleModal) roleModal.classList.remove("active");

  // Hide both forms first
  if (vendorSignupForm) vendorSignupForm.classList.add("hidden");
  if (supplierSignupForm) supplierSignupForm.classList.add("hidden");

  // Show the appropriate form based on role
  if (role === "vendor" && vendorSignupForm) {
    vendorSignupForm.classList.remove("hidden");
    updateMaterialOptions(); // Update material options for vendors
    showNotification("Please complete your vendor business information", "info");
    
  } else if (role === "supplier" && supplierSignupForm) {
    supplierSignupForm.classList.remove("hidden");
    showNotification("Please complete your supplier business information", "info");
  }
}

// Form Submission Handlers
document.addEventListener("DOMContentLoaded", function () {
  // Main signup form submission
  const signupForm = document.querySelector("#signupFormMain");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      
      const name = document.getElementById("firstName").value + " " + document.getElementById("lastName").value;
      const email = document.getElementById("signupEmail").value;
      const phone = document.getElementById("signupPhone").value;
      const password = document.getElementById("signupPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      
      // Basic validation
      if (!name.trim() || !email || !phone || !password || !confirmPassword) {
        showNotification("Please fill in all fields", "error");
        return;
      }
      
      if (password !== confirmPassword) {
        showNotification("Passwords do not match", "error");
        return;
      }
      
      // Store form data temporarily for role selection
      sessionStorage.setItem('signupData', JSON.stringify({
        name: name.trim(),
        email,
        phone,
        password
      }));
      
      // Show role selection modal
      showRoleSelection();
    });
  }

  // Vendor signup form submission
  const vendorForm = document.querySelector("#vendorRegisterForm");
  if (vendorForm) {
    vendorForm.addEventListener("submit", function (e) {
      e.preventDefault();
      
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Creating Account...";
      submitBtn.disabled = true;
      
      // Get main signup data and vendor data
      const mainSignupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
      const formData = new FormData(this);
      
      // Create account via backend API with all form data
      const vendorData = {
        businessName: formData.get('businessName'),
        businessType: formData.get('businessType'),
        businessAddress: formData.get('businessAddress')
      };
      createAccountViaAPI(mainSignupData, vendorData, 'vendor', submitBtn, originalText);
    });
  }

  // Supplier signup form submission
  const supplierForm = document.querySelector("#supplierRegisterForm");
  if (supplierForm) {
    supplierForm.addEventListener("submit", function (e) {
      e.preventDefault();
      
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Creating Account...";
      submitBtn.disabled = true;
      
      // Get main signup data and supplier data
      const mainSignupData = JSON.parse(sessionStorage.getItem('signupData') || '{}');
      const formData = new FormData(this);
      
      // Create account via backend API with all form data
      const supplierData = {
        companyName: formData.get('companyName'),
        industryType: formData.get('industryType'),
        companyAddress: formData.get('companyAddress')
      };
      createAccountViaAPI(mainSignupData, supplierData, 'supplier', submitBtn, originalText);
    });
  }
});

// Back button functionality
function goBack() {
  showMainSignup();
}

// Password Toggle Function
function togglePassword(fieldId) {
  const passwordField = document.getElementById(fieldId);
  const toggleIcon = passwordField.parentElement.querySelector('.toggle-password');
  
  if (passwordField.type === 'password') {
    passwordField.type = 'text';
    toggleIcon.classList.remove('fa-eye');
    toggleIcon.classList.add('fa-eye-slash');
  } else {
    passwordField.type = 'password';
    toggleIcon.classList.remove('fa-eye-slash');
    toggleIcon.classList.add('fa-eye');
  }
}

// Update material options - now shows general material types regardless of business type
function updateMaterialOptions() {
  const businessType = document.getElementById('businessType').value;
  const materialOptions = document.getElementById('materialOptions');
  
  if (!businessType) {
    materialOptions.innerHTML = '<p class="no-selection">Please select a business type above to see material options.</p>';
    return;
  }
  
  // General material types for all food stalls
  const materials = [
    { value: 'fruits', label: 'Fruits', icon: 'fas fa-apple-alt' },
    { value: 'vegetables', label: 'Vegetables', icon: 'fas fa-carrot' },
    { value: 'grains', label: 'Grains & Flour', icon: 'fas fa-seedling' },
    { value: 'spices', label: 'Spices & Seasonings', icon: 'fas fa-pepper-hot' },
    { value: 'oil', label: 'Cooking Oil', icon: 'fas fa-tint' },
    { value: 'dairy', label: 'Dairy Products', icon: 'fas fa-glass-whiskey' },
    { value: 'plates', label: 'Plates & Bowls', icon: 'fas fa-utensils' },
    { value: 'cups', label: 'Cups & Glasses', icon: 'fas fa-coffee' },
    { value: 'napkins', label: 'Napkins & Tissues', icon: 'fas fa-tissue' },
    { value: 'packaging', label: 'Food Packaging', icon: 'fas fa-box' },
    { value: 'gas', label: 'LPG Gas', icon: 'fas fa-fire' },
    { value: 'water', label: 'Drinking Water', icon: 'fas fa-water' },
    { value: 'cleaning', label: 'Cleaning Supplies', icon: 'fas fa-spray-can' },
    { value: 'other', label: 'Other Materials', icon: 'fas fa-plus' }
  ];
  
  let html = '';
  materials.forEach(material => {
    if (material.value === 'other') {
      html += `
        <label class="checkbox-item">
          <input type="checkbox" name="preferredMaterials" value="${material.value}" onchange="toggleCustomMaterialInput(this)" />
          <span class="checkmark"></span>
          <i class="${material.icon}"></i>
          ${material.label}
        </label>
      `;
    } else {
      html += `
        <label class="checkbox-item">
          <input type="checkbox" name="preferredMaterials" value="${material.value}" />
          <span class="checkmark"></span>
          <i class="${material.icon}"></i>
          ${material.label}
        </label>
      `;
    }
  });
  
  // Add custom material input field (initially hidden)
  html += `
    <div id="customMaterialInput" class="custom-material-input" style="display: none; margin-top: 15px;">
      <div class="form-group">
        <label for="customMaterials">Enter Custom Materials (comma-separated):</label>
        <textarea id="customMaterials" name="customMaterials" rows="3" placeholder="e.g., Special spice mix, Custom packaging, Unique ingredients..."></textarea>
        <i class="fas fa-edit input-icon"></i>
      </div>
    </div>
  `;
  
  materialOptions.innerHTML = html;
}

// Toggle custom material input for vendors
function toggleCustomMaterialInput(checkbox) {
  const customGroup = document.getElementById('customMaterialGroup');
  const customTextarea = document.getElementById('customMaterials');
  
  if (checkbox.checked) {
    customGroup.style.display = 'block';
    customTextarea.required = true;
  } else {
    customGroup.style.display = 'none';
    customTextarea.required = false;
    customTextarea.value = '';
  }
}

// Toggle custom material input for suppliers
function toggleSupplierCustomMaterialInput(checkbox) {
  const customGroup = document.getElementById('supplierCustomMaterialGroup');
  const customTextarea = document.getElementById('supplierCustomMaterials');
  
  if (checkbox.checked) {
    customGroup.style.display = 'block';
    customTextarea.required = true;
  } else {
    customGroup.style.display = 'none';
    customTextarea.required = false;
    customTextarea.value = '';
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

// Close modal when clicking outside
document.addEventListener("click", function (e) {
  const roleModal = document.getElementById("roleModal");
  if (roleModal && e.target === roleModal) {
    hideRoleSelection();
  }
});

// API Function to create account via backend
async function createAccountViaAPI(mainSignupData, roleSpecificData, role, submitBtn, originalText) {
  try {
    // Combine main signup data with role-specific data
    const requestData = {
      name: mainSignupData.name,
      email: mainSignupData.email,
      phone: mainSignupData.phone,
      password: mainSignupData.password,
      role: role,
      ...roleSpecificData
    };

    console.log('Sending signup request:', requestData);

    // Make API call to backend
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    console.log('Signup response:', result);

    if (response.ok && result.success) {
      // Success - clear stored data and show success message
      sessionStorage.removeItem('signupData');
      showNotification(`${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`, "success");
      
      // Store user data and token if provided
      if (result.data && result.data.token) {
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('userData', JSON.stringify(result.data.user));
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        if (role === 'vendor') {
          window.location.href = 'vendor-dashboard.html';
        } else {
          window.location.href = 'supplier-dashboard.html';
        }
      }, 2000);
      
    } else {
      // Handle API errors
      const errorMessage = result.message || 'Registration failed. Please try again.';
      showNotification(errorMessage, "error");
      console.error('Signup failed:', result);
    }
    
  } catch (error) {
    console.error('Network error during signup:', error);
    showNotification('Network error. Please check your connection and try again.', "error");
  } finally {
    // Reset button state
    if (submitBtn) {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
}
