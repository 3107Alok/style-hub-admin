/**
 * StyleHub Admin Portal - Authentication & Session Management
 */

const Auth = {
  init() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    this.checkSession();
  },

  checkSession() {
    const token = API.getToken();
    const user = API.getUser();

    if (token && user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN')) {
      this.hideLogin();
      this.updateAdminHeader(user);
      App.loadCurrentView();
    } else {
      this.showLogin();
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const loginBtn = document.getElementById('login-submit-btn');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      Toast.error('Please enter both Email and Password.');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner"></span> Logging in...';

    try {
      const res = await API.post('/api/auth/login', {
        emailOrPhone: email,
        password: password
      });

      if (res && res.data) {
        const { accessToken, user } = res.data;

        // Verify Admin Role
        if (user.role !== 'ADMIN' && user.role !== 'ROLE_ADMIN') {
          Toast.error('Access Denied: This account does not have Admin privileges.');
          loginBtn.disabled = false;
          loginBtn.innerHTML = 'Sign In to Dashboard';
          return;
        }

        API.setToken(accessToken);
        API.setUser(user);

        Toast.success(`Welcome back, ${user.name || 'Admin'}!`);
        this.hideLogin();
        this.updateAdminHeader(user);
        App.loadCurrentView();
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = 'Sign In to Dashboard';
    }
  },

  handleLogout() {
    if (confirm('Are you sure you want to log out of the Admin Dashboard?')) {
      API.clearToken();
      this.showLogin();
      Toast.info('Logged out successfully.');
    }
  },

  showLogin() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.classList.remove('hidden');
  },

  hideLogin() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.classList.add('hidden');
  },

  updateAdminHeader(user) {
    const adminNameEl = document.getElementById('admin-display-name');
    if (adminNameEl && user) {
      adminNameEl.textContent = user.name || user.email || 'Admin';
    }
  }
};
