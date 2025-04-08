const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

class SariBooks {
  constructor() {
    this.initAuth();
    this.initTaxCalculator();
    this.initTransactionForm();
  }

  async initAuth() {
    await this.updateAuthUI();
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await supabase.auth.signOut();
      this.updateAuthUI();
      window.location.href = 'index.html';
    });

    // Route protection for authenticated pages
    const protectedPages = ['dashboard.html', 'transaction_input.html', 'tax_calculation.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (protectedPages.includes(currentPage) && !session) {
      window.location.href = 'login.html';
    }
  }

  async updateAuthUI() {
    const { data: { session } } = await supabase.auth.getSession();
    const authElements = document.querySelectorAll('.auth-only');
    const unauthElements = document.querySelectorAll('.unauth-only');
    
    if (session) {
      authElements.forEach(el => el.style.display = '');
      unauthElements.forEach(el => el.style.display = 'none');
      document.getElementById('usernameDisplay')?.textContent = session.user.email;
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
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  new SariBooks();
});