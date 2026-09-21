/**
 * StyleHub Admin Portal - Coupons Controller
 * Full support for PERCENTAGE & FLAT discount types, min order values, and active limits
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
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#ef4444;">Failed to load coupons. Ensure you have Admin privileges.</td></tr>';
    }
  },

  renderTable(coupons) {
    const tbody = document.getElementById('coupons-table-body');
    if (!tbody) return;

    if (coupons.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding:40px; color:#94a3b8;">
            <i class="fas fa-ticket-alt" style="font-size:36px; color:#fbcfe8; margin-bottom:12px; display:block;"></i>
            No coupons found. Click <strong>+ Create Coupon</strong> to add promotional discount codes.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = coupons.map(c => {
      const isPercent = (c.discountType || '').toUpperCase() === 'PERCENTAGE';
      const discountText = isPercent ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`;
      const minOrderText = c.minOrderValue ? `Min Order: ₹${c.minOrderValue}` : 'No Min Order';

      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge" style="background:#d81b60; color:white; font-size:13px; font-weight:800; letter-spacing:1px;">
                <i class="fas fa-tag"></i> ${this.escapeHtml(c.code)}
              </span>
            </div>
            <div style="font-size:11px; color:#64748b; margin-top:4px;">${this.escapeHtml(c.description || '')}</div>
          </td>
          <td style="font-weight:800; color:#0f8a5f; font-size:14px;">${discountText}</td>
          <td style="color:#64748b; font-weight:600;">${minOrderText}</td>
          <td>
            <span class="badge ${c.active !== false ? 'badge-delivered' : 'badge-cancelled'}">
              ${c.active !== false ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </td>
          <td>
            <button class="btn-icon delete" title="Delete Coupon" onclick="Coupons.deleteCoupon('${c.id}', '${this.escapeHtml(c.code)}')">
              <i class="fas fa-trash-alt" style="color:#e11d48;"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  onTypeChange(type) {
    const label = document.getElementById('coupon-val-label');
    const input = document.getElementById('coupon-discount');
    if (type === 'PERCENTAGE') {
      label.textContent = 'Discount Value (%) *';
      input.placeholder = '20';
      input.max = '100';
    } else {
      label.textContent = 'Flat Discount Amount (₹) *';
      input.placeholder = '200';
      input.removeAttribute('max');
    }
  },

  openAddModal() {
    document.getElementById('coupon-form').reset();
    document.getElementById('coupon-type').value = 'PERCENTAGE';
    this.onTypeChange('PERCENTAGE');
    document.getElementById('coupon-min-order').value = '499';
    document.getElementById('coupon-max-discount').value = '500';
    document.getElementById('coupon-modal').classList.add('active');
  },

  closeModal() {
    document.getElementById('coupon-modal').classList.remove('active');
  },

  async handleFormSubmit(e) {
    e.preventDefault();
    const code = document.getElementById('coupon-code').value.trim().toUpperCase();
    const discountType = document.getElementById('coupon-type').value;
    const discountValue = parseFloat(document.getElementById('coupon-discount').value);
    const minOrderValue = parseFloat(document.getElementById('coupon-min-order').value) || 0;
    const maxDiscountAmount = parseFloat(document.getElementById('coupon-max-discount').value) || 500;
    const description = document.getElementById('coupon-desc').value.trim() || `${discountValue}${discountType === 'PERCENTAGE' ? '%' : '₹'} OFF on orders above ₹${minOrderValue}`;

    if (!code || isNaN(discountValue)) {
      Toast.error('Please enter valid coupon code and discount amount.');
      return;
    }

    const payload = {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      usageLimit: 1000,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    };

    try {
      await API.post('/api/admin/coupons', payload);
      Toast.success(`Coupon "${code}" created successfully!`);
      this.closeModal();
      await this.fetchCoupons();
    } catch (err) {
      console.error('Failed to create coupon:', err);
    }
  },

  async deleteCoupon(id, code) {
    if (!confirm(`Are you sure you want to deactivate coupon "${code}"?`)) return;
    try {
      await API.delete(`/api/admin/coupons/${id}`);
      Toast.success(`Coupon "${code}" deactivated.`);
      await this.fetchCoupons();
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};
