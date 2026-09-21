/**
 * StyleHub Admin Portal - User Management Controller
 * Handles user listing, role upgrades (ADMIN/CUSTOMER), and account block/unblock controls
 */

const Users = {
  list: [],
  filtered: [],
  currentRoleFilter: 'ALL',

  async load() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#777777;"><span class="spinner"></span> Loading registered users...</td></tr>';

    try {
      const res = await API.get('/api/admin/users?size=100');
      if (res && res.data) {
        this.list = res.data.content || res.data || [];
        this.applyFilters();
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#e11d48;">Failed to load users. Ensure you have Admin privileges.</td></tr>';
    }
  },

  applyFilters() {
    let result = [...this.list];
    
    // Apply role filter
    if (this.currentRoleFilter !== 'ALL') {
      result = result.filter(u => (u.role || 'CUSTOMER').toUpperCase() === this.currentRoleFilter);
    }

    // Apply search filter
    const searchInput = document.getElementById('users-search');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (query) {
      result = result.filter(u => 
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.phone && u.phone.includes(query))
      );
    }

    this.filtered = result;
    this.renderTable(this.filtered);
  },

  filterUsers(query) {
    this.applyFilters();
  },

  filterByRole(role) {
    this.currentRoleFilter = role;
    this.applyFilters();
  },

  renderTable(users) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:40px; color:#777777;">
            <i class="fas fa-users-slash" style="font-size:36px; color:#cbd5e1; margin-bottom:12px; display:block;"></i>
            No registered users match your search criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = users.map(u => {
      const name = u.name || 'Anonymous User';
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
      const role = u.role || 'CUSTOMER';
      const isAdmin = role.toUpperCase() === 'ADMIN';
      const isBlocked = !!u.blocked;
      const joinedDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently';

      const roleBadge = isAdmin
        ? '<span class="badge" style="background:#f3e8ff; color:#7e22ce; font-weight:800; border:1px solid #d8b4fe;"><i class="fas fa-shield-alt"></i> ADMIN</span>'
        : '<span class="badge" style="background:#eff6ff; color:#1d4ed8; font-weight:700; border:1px solid #bfdbfe;"><i class="fas fa-user"></i> CUSTOMER</span>';

      const statusBadge = isBlocked
        ? '<span class="badge badge-cancelled"><i class="fas fa-ban"></i> Blocked</span>'
        : '<span class="badge badge-delivered"><i class="fas fa-check-circle"></i> Active</span>';

      const emailVerifyBadge = u.emailVerified
        ? '<span title="Email Verified" style="color:#0f8a5f; font-size:14px; margin-right:6px;"><i class="fas fa-check-circle"></i> Email</span>'
        : '<span title="Email Pending" style="color:#94a3b8; font-size:14px; margin-right:6px;"><i class="far fa-circle"></i> Email</span>';

      const phoneVerifyBadge = u.phoneVerified
        ? '<span title="Phone Verified" style="color:#0f8a5f; font-size:14px;"><i class="fas fa-check-circle"></i> Phone</span>'
        : '<span title="Phone Pending" style="color:#94a3b8; font-size:14px;"><i class="far fa-circle"></i> Phone</span>';

      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, #d81b60, #ec4899); color:#ffffff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; flex-shrink:0; box-shadow:0 2px 6px rgba(216,27,96,0.25);">
                ${initials}
              </div>
              <div>
                <div style="font-weight:700; color:#1e293b; font-size:14px;">${this.escapeHtml(name)}</div>
                <div style="font-size:12px; color:#64748b;">${this.escapeHtml(u.email || '-')}</div>
              </div>
            </div>
          </td>
          <td style="font-weight:600; color:#334155; font-size:13px;">${u.phone || '-'}</td>
          <td>${roleBadge}</td>
          <td>
            <div style="display:flex; align-items:center; font-size:12px;">
              ${emailVerifyBadge}
              ${phoneVerifyBadge}
            </div>
          </td>
          <td>${statusBadge}</td>
          <td style="font-size:12px; color:#64748b;">${joinedDate}</td>
          <td>
            <div class="action-btn-group">
              <button class="btn-icon" title="${isAdmin ? 'Demote to Customer' : 'Promote to Admin'}" onclick="Users.toggleRole('${u.id}', '${role}', '${this.escapeHtml(name)}')">
                <i class="fas fa-user-shield" style="color:${isAdmin ? '#7e22ce' : '#3b82f6'};"></i>
              </button>
              <button class="btn-icon" title="${isBlocked ? 'Unblock User' : 'Block User'}" onclick="Users.toggleBlockStatus('${u.id}', ${isBlocked}, '${this.escapeHtml(name)}')">
                <i class="fas ${isBlocked ? 'fa-unlock' : 'fa-lock'}" style="color:${isBlocked ? '#0f8a5f' : '#e11d48'};"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async toggleRole(userId, currentRole, name) {
    const newRole = currentRole.toUpperCase() === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    const confirmMsg = `Are you sure you want to change role for "${name}" from ${currentRole} to ${newRole}?`;
    if (!confirm(confirmMsg)) return;

    try {
      await API.put(`/api/admin/users/${userId}`, { role: newRole });
      Toast.success(`User "${name}" role updated to ${newRole}!`);
      await this.load();
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  },

  async toggleBlockStatus(userId, currentBlockedStatus, name) {
    const newStatus = !currentBlockedStatus;
    const actionName = newStatus ? 'BLOCK' : 'UNBLOCK';
    if (!confirm(`Are you sure you want to ${actionName} user "${name}"?`)) return;

    try {
      await API.patch(`/api/admin/users/${userId}/status`, { blocked: newStatus });
      Toast.success(`User "${name}" has been ${newStatus ? 'blocked' : 'unblocked'}.`);
      await this.load();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};
