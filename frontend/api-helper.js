// Function to create account via backend API (stores in MongoDB)
async function createAccountViaAPI(mainSignupData, extraData, role, submitBtn, originalText) {
  try {
    console.log('🚀 Creating account in MongoDB database...');
    
    // Prepare complete user data
    const userData = {
      name: mainSignupData.name,
      email: mainSignupData.email,
      phone: mainSignupData.phone,
      password: mainSignupData.password,
      role: role,
      ...extraData // Include business/company data
    };
    
    console.log('📤 Sending data:', userData);
    
    // Call backend API to create user in MongoDB
    const response = await fetch(`http://localhost:3001/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    console.log('📦 Backend response:', data);
    
    if (response.ok && data.success) {
      // Store user data and token from backend
      localStorage.setItem('userToken', data.data.token);
      localStorage.setItem('userData', JSON.stringify(data.data.user));
      sessionStorage.removeItem('signupData');
      
      showNotification(`${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully! Data saved to MongoDB database. Redirecting to profile...`, "success");
      
      // Redirect to profile page to view user details
      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 2000);
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  } catch (error) {
    console.error('❌ Database storage error:', error);
    
    // Fallback to localStorage if backend fails
    const userData = {
      id: Date.now(),
      name: mainSignupData.name,
      email: mainSignupData.email,
      phone: mainSignupData.phone,
      role: role,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userToken', `${role}_token_` + Date.now());
    sessionStorage.removeItem('signupData');
    
    showNotification(`${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully! (Backend unavailable - stored locally)`, "warning");
    
    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 2000);
  } finally {
    // Reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}
