/**
 * StyleHub Admin Portal - Master Application Controller
 */

const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
  },

  show(message, type = 'info') {
    if (!this.container) this.init();
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-triangle';

    el.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
    this.container.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(100%)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, 4000);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  info(msg) { this.show(msg, 'info'); }
};

const App = {
  currentTab: 'dashboard',

  init() {
    Toast.init();
    Auth.init();
    this.setupNavigation();
    this.setupForms();
  },

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = item.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });
  },

  setupForms() {
    const prodForm = document.getElementById('product-form');
    if (prodForm) prodForm.addEventListener('submit', (e) => Products.handleFormSubmit(e));

    const catForm = document.getElementById('category-form');
    if (catForm) catForm.addEventListener('submit', (e) => Categories.handleFormSubmit(e));

    const coupForm = document.getElementById('coupon-form');
    if (coupForm) coupForm.addEventListener('submit', (e) => Coupons.handleFormSubmit(e));

    const searchInput = document.getElementById('product-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => Products.filterProducts(e.target.value));
    }
  },

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update Sidebar Active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabName);
    });

    // Update Views visibility
    document.querySelectorAll('.tab-view').forEach(view => {
      view.style.display = view.id === `view-${tabName}` ? 'block' : 'none';
    });

    // Update Page Header Title
    const titles = {
      dashboard: 'Analytics & Overview',
      products: 'Product Management',
      orders: 'Customer Orders',
      categories: 'Store Categories',
      coupons: 'Promotional Coupons',
      users: 'User & Customer Management'
    };
    const titleEl = document.getElementById('header-title-text');
    if (titleEl) titleEl.textContent = titles[tabName] || 'Dashboard';

    this.loadCurrentView();
  },

  loadCurrentView() {
    switch (this.currentTab) {
      case 'dashboard':
        Dashboard.load();
        break;
      case 'products':
        Products.load();
        break;
      case 'orders':
        Orders.load();
        break;
      case 'categories':
        Categories.load();
        break;
      case 'coupons':
        Coupons.load();
        break;
      case 'users':
        Users.load();
        break;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
