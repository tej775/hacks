// DOM Content Loaded
document.addEventListener("DOMContentLoaded", function () {
  // UI initialization only
  console.log('Sign-in page loaded');
});

// Password Toggle Function
function togglePassword() {
  const passwordField = document.getElementById('password');
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

// Backend API URL
const API_URL = 'https://b2b-backend-u7k0.onrender.com/api';

// Form Submission Handlers
document.addEventListener("DOMContentLoaded", function () {
  // Login form submission
  const loginForm = document.querySelector("#signinForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      
      // Basic validation
      if (!email || !password) {
        showNotification("Please fill in all fields", "error");
        return;
      }
      
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Signing in...";
      submitBtn.disabled = true;
      
      try {
        // Call backend API
        const response = await fetch(`${API_URL}/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Store user data and token
          localStorage.setItem('userToken', data.data.token);
          localStorage.setItem('userData', JSON.stringify(data.data.user));
          
          showNotification("Login successful! Redirecting...", "success");
          
          // Redirect based on role
          setTimeout(() => {
            if (data.data.user.role === 'vendor') {
              window.location.href = 'vendor-dashboard.html';
            } else {
              window.location.href = 'supplier-dashboard.html'; // You can create this later
            }
          }, 1500);
        } else {
          showNotification(data.message || "Login failed", "error");
        }
      } catch (error) {
        console.error('Login error:', error);
        showNotification("Connection error. Please check if the backend server is running.", "error");
      } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});

// Notification System
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;

  // Add to page
  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);

  // Add click to close
  notification.addEventListener("click", function () {
    this.remove();
  });
}
