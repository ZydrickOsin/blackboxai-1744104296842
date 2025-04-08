class AuthService {
  static login(username, password) {
    // In a real app, this would call your backend API
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  }

  static logout() {
    localStorage.removeItem('currentUser');
  }

  static register(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.username === username)) {
      return false;
    }
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }

  static getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
  }
}

class SariBooks {
  constructor() {
    this.initAuth();
    this.initTaxCalculator();
    this.initTransactionForm();
  }

  initAuth() {
    this.updateAuthUI();
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      AuthService.logout();
      this.updateAuthUI();
      window.location.href = 'index.html';
    });

    // Route protection for authenticated pages
    const protectedPages = ['dashboard.html', 'transaction_input.html', 'tax_calculation.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !AuthService.getCurrentUser()) {
      window.location.href = 'login.html';
    }
  }

  updateAuthUI() {
    const user = AuthService.getCurrentUser();
    const authElements = document.querySelectorAll('.auth-only');
    const unauthElements = document.querySelectorAll('.unauth-only');
    
    if (user) {
      authElements.forEach(el => el.style.display = '');
      unauthElements.forEach(el => el.style.display = 'none');
      document.getElementById('usernameDisplay')?.textContent = user.username;
    } else {
      authElements.forEach(el => el.style.display = 'none');
      unauthElements.forEach(el => el.style.display = '');
    }
  }

  // Tax calculation based on 2023 BIR rates
  calculateTax(income) {
    if (income <= 250000) return 0;
    if (income <= 400000) return (income - 250000) * 0.15;
    if (income <= 800000) return 22500 + (income - 400000) * 0.20;
    if (income <= 2000000) return 102500 + (income - 800000) * 0.25;
    if (income <= 8000000) return 402500 + (income - 2000000) * 0.30;
    return 2202500 + (income - 8000000) * 0.35;
  }

  initTaxCalculator() {
    const taxForm = document.getElementById('taxCalculatorForm');
    if (taxForm) {
      taxForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const income = parseFloat(document.getElementById('grossIncome').value);
        const tax = this.calculateTax(income);
        const rate = (tax / income * 100).toFixed(2);
        
        document.getElementById('taxableIncome').textContent = `₱${income.toLocaleString()}`;
        document.getElementById('taxDue').textContent = `₱${tax.toLocaleString()}`;
        document.getElementById('taxRate').textContent = `${rate}%`;
        document.getElementById('taxResult').classList.remove('d-none');
      });
    }
  }

  initTransactionForm() {
    const form = document.getElementById('transactionForm');
    if (form) {
      // Add event listeners for real-time calculations
      document.getElementById('debitAmount')?.addEventListener('input', this.updateTransactionTotals.bind(this));
      document.getElementById('creditAmount')?.addEventListener('input', this.updateTransactionTotals.bind(this));

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const debit = parseFloat(document.getElementById('debitAmount').value) || 0;
        const credit = parseFloat(document.getElementById('creditAmount').value) || 0;
        
        if (debit === 0 && credit === 0) {
          alert('Please enter either a debit or credit amount');
          return;
        }

        const transaction = {
          date: document.getElementById('transactionDate').value,
          debit: debit,
          credit: credit,
          type: debit > 0 ? 'debit' : 'credit',
          category: document.querySelector('input[name="category"]:checked')?.value,
          description: document.getElementById('transactionDescription').value
        };
        this.saveTransaction(transaction);
      });
    }
  }

  updateTransactionTotals() {
    const debit = parseFloat(document.getElementById('debitAmount').value) || 0;
    const credit = parseFloat(document.getElementById('creditAmount').value) || 0;
    
    document.getElementById('totalDebit').textContent = debit.toFixed(2);
    document.getElementById('totalCredit').textContent = credit.toFixed(2);
  }

  saveTransaction(transaction) {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    alert('Transaction saved successfully!');
    document.getElementById('transactionForm').reset();
  }

  // Password strength validation
  checkPasswordStrength(password) {
    const strengthBar = document.getElementById('passwordStrengthBar');
    const lengthHint = document.getElementById('lengthHint');
    const numberHint = document.getElementById('numberHint');
    const specialHint = document.getElementById('specialHint');

    // Reset all classes
    strengthBar.className = 'password-strength-bar';
    lengthHint.className = '';
    numberHint.className = '';
    specialHint.className = '';

    // Check password requirements
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Update hints
    if (hasMinLength) lengthHint.classList.add('text-success');
    if (hasNumber) numberHint.classList.add('text-success');
    if (hasSpecialChar) specialHint.classList.add('text-success');

    // Calculate strength
    let strength = 0;
    if (hasMinLength) strength += 1;
    if (hasNumber) strength += 1;
    if (hasSpecialChar) strength += 1;

    // Update strength meter
    switch(strength) {
      case 1:
        strengthBar.classList.add('password-strength-weak');
        break;
      case 2:
        strengthBar.classList.add('password-strength-fair');
        break;
      case 3:
        strengthBar.classList.add('password-strength-strong');
        break;
      default:
        strengthBar.style.width = '0%';
    }
  }

  // Password match validation
  validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageElement = document.getElementById('passwordMatchMessage');

    if (confirmPassword.length === 0) {
      messageElement.textContent = '';
      return;
    }

    if (password === confirmPassword) {
      messageElement.textContent = 'Passwords match!';
      messageElement.className = 'form-text text-success';
    } else {
      messageElement.textContent = 'Passwords do not match';
      messageElement.className = 'form-text text-danger';
    }
  }

  // Toggle password visibility
  togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.nextElementSibling;
    const icon = button.querySelector('i');

    if (field.type === 'password') {
      field.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
      button.setAttribute('aria-label', 'Hide password');
    } else {
      field.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
      button.setAttribute('aria-label', 'Show password');
    }
  }

  // Validate registration form before submission
  async validateRegistration(event) {
    event.preventDefault();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const strengthBar = document.getElementById('passwordStrengthBar');

    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return false;
    }

    // Check password strength (at least "fair")
    if (!strengthBar.classList.contains('password-strength-fair') && 
        !strengthBar.classList.contains('password-strength-strong')) {
      alert('Password is too weak! Please choose a stronger password.');
      return false;
    }

    // Hash passwords before submission
    const hashedPassword = await this.hashPassword(password);
    document.getElementById('password').value = hashedPassword;
    document.getElementById('confirmPassword').value = hashedPassword;

    // Submit the form programmatically
    event.target.submit();
    return true;
  }

  // Validate login form before submission
  async validateLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username) {
      alert('Please enter your username');
      return false;
    }

    if (!password) {
      alert('Please enter your password');
      return false;
    }

    // Hash password before sending
    const hashedPassword = await this.hashPassword(password);
    document.getElementById('password').value = hashedPassword;
    return true;
  }

  // Hash password using SHA-256
  async hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  new SariBooks();
});