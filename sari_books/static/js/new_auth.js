class NewAuth {
  constructor() {
    this.initPasswordToggle();
    this.initFormValidation();
  }

  initPasswordToggle() {
    const toggleBtns = document.querySelectorAll('.toggle-password');
    
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.closest('.input-group').querySelector('input');
        const icon = btn.querySelector('i');
        const type = input.type === 'password' ? 'text' : 'password';
        
        input.type = type;
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
        btn.setAttribute('aria-label', 
          type === 'password' ? 'Show password' : 'Hide password');
      });
    });
  }

  initFormValidation() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Basic validation
        if (!this.validateEmail(email)) {
          alert('Please enter a valid email address');
          return;
        }

        if (password.length < 8) {
          alert('Password must be at least 8 characters');
          return;
        }

        // Hash password before submission
        const hashedPassword = await this.hashPassword(password);
        
        // Here you would typically send to your backend
        console.log('Login attempt:', { email, password: hashedPassword });
        alert('Login successful! Redirecting...');
        // window.location.href = 'dashboard.html';
      });
    }
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  async hashPassword(password) {
    // Simple SHA-256 hashing (in a real app, use proper server-side hashing)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new NewAuth();
});