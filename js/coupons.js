/**
 * StyleHub Admin Portal - Coupons Controller
 */

const Coupons = {
  list: [],

  async load() {
    await this.fetchCoupons();
  },

  async fetchCoupons() {
    const tbody = document.getElementById('coupons-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#94a3b8;"><span class="spinner"></span> Loading coupons...</td></tr>';

    try {
      const res = await API.get('/api/admin/coupons');
      if (res && res.data) {
        this.list = res.data || [];
        this.renderTable(this.list);
      }
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#ef4444;">Failed to load coupons.</td></tr>';
    }
  },

  renderTable(coupons) {
    const tbody = document.getElementById('coupons-table-body');
    if (!tbody) return;

    if (coupons.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding:40px; color:#94a3b8;">
            No coupons found. Click <strong>+ Create Coupon</strong> to add promotional discount codes.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = coupons.map(c => `
      <tr>
        <td><span class="badge" style="background:#d81b60; color:white; font-size:13px;">${c.code}</span></td>
        <td style="font-weight:700; color:#10b981;">${c.discountPercentage ? c.discountPercentage + '%' : '₹' + c.discountAmount} OFF</td>
        <td style="color:#94a3b8;">Min Order: ₹${c.minOrderAmount || 0}</td>
        <td>
          <span class="badge ${c.active !== false ? 'badge-delivered' : 'badge-cancelled'}">
            ${c.active !== false ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </td>
        <td>
          <button class="btn-icon delete" title="Delete Coupon" onclick="Coupons.deleteCoupon('${c.id}', '${c.code}')">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `).join('');
  },

  openAddModal() {
    document.getElementById('coupon-form').reset();
    document.getElementById('coupon-modal').classList.add('active');
  },

  closeModal() {
    document.getElementById('coupon-modal').classList.remove('active');
  },

  async handleFormSubmit(e) {
    e.preventDefault();
    const code = document.getElementById('coupon-code').value.trim().toUpperCase();
    const discount = parseFloat(document.getElementById('coupon-discount').value);
    const minOrder = parseFloat(document.getElementById('coupon-min-order').value) || 0;

    if (!code || isNaN(discount)) {
      Toast.error('Please enter valid coupon code and discount percentage.');
      return;
    }

    try {
      await API.post('/api/admin/coupons', {
        code,
        discountPercentage: discount,
        minOrderAmount: minOrder,
        active: true
      });
      Toast.success(`Coupon ${code} created successfully!`);
      this.closeModal();
      await this.fetchCoupons();
    } catch (err) {
      console.error('Failed to create coupon:', err);
    }
  },

  async deleteCoupon(id, code) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await API.delete(`/api/admin/coupons/${id}`);
      Toast.success('Coupon deleted.');
      await this.fetchCoupons();
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  }
};
