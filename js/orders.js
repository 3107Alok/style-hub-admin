/**
 * StyleHub Admin Portal - Orders Management Controller
 */

const Orders = {
  list: [],

  async load() {
    await this.fetchOrders();
  },

  async fetchOrders() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;"><span class="spinner"></span> Loading orders...</td></tr>';

    try {
      const res = await API.get('/api/admin/orders');
      if (res && res.data) {
        this.list = res.data.content || res.data || [];
        this.renderTable(this.list);
      }
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#ef4444;">Failed to load orders.</td></tr>';
    }
  },

  renderTable(orders) {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:40px; color:#94a3b8;">
            <i class="fas fa-shopping-bag" style="font-size:32px; margin-bottom:12px; display:block;"></i>
            No orders found yet.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : '-';

      const status = o.status || 'PLACED';
      const statusBadge = this.getStatusBadge(status);

      return `
        <tr>
          <td style="font-weight:700; color:#3b82f6;">#${(o.id || '').substring(0, 8)}</td>
          <td>
            <div style="font-weight:600;">${o.userName || 'Customer'}</div>
            <div style="font-size:12px; color:#64748b;">${o.userPhone || o.userEmail || ''}</div>
          </td>
          <td style="color:#94a3b8; font-size:13px;">${dateStr}</td>
          <td style="font-weight:700; color:#10b981;">₹${(o.total || 0).toLocaleString('en-IN')}</td>
          <td>
            <span class="badge ${o.paid ? 'badge-delivered' : 'badge-cancelled'}">
              ${o.paid ? 'PAID' : 'PENDING'}
            </span>
          </td>
          <td>${statusBadge}</td>
          <td>
            <select class="form-control" style="padding:6px 10px; font-size:12px; width:auto;" onchange="Orders.updateStatus('${o.id}', this.value)">
              <option value="PLACED" ${status === 'PLACED' ? 'selected' : ''}>PLACED</option>
              <option value="PROCESSING" ${status === 'PROCESSING' ? 'selected' : ''}>PROCESSING</option>
              <option value="SHIPPED" ${status === 'SHIPPED' ? 'selected' : ''}>SHIPPED</option>
              <option value="DELIVERED" ${status === 'DELIVERED' ? 'selected' : ''}>DELIVERED</option>
              <option value="CANCELLED" ${status === 'CANCELLED' ? 'selected' : ''}>CANCELLED</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');
  },

  getStatusBadge(status) {
    switch (status) {
      case 'PLACED': return '<span class="badge badge-placed">Placed</span>';
      case 'PROCESSING': return '<span class="badge badge-processing">Processing</span>';
      case 'SHIPPED': return '<span class="badge badge-shipped">Shipped</span>';
      case 'DELIVERED': return '<span class="badge badge-delivered">Delivered</span>';
      case 'CANCELLED': return '<span class="badge badge-cancelled">Cancelled</span>';
      default: return `<span class="badge">${status}</span>`;
    }
  },

  async updateStatus(orderId, newStatus) {
    try {
      await API.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      Toast.success(`Order #${orderId.substring(0, 8)} status updated to ${newStatus}`);
      await this.fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  }
};
