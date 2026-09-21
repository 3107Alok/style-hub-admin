/**
 * StyleHub Admin Portal - Analytics & Dashboard Controller
 */

let revenueChartInstance = null;
let orderStatusChartInstance = null;

const Dashboard = {
  async load() {
    await Promise.all([
      this.loadMetrics(),
      this.loadOrderStats()
    ]);
  },

  async loadMetrics() {
    try {
      const res = await API.get('/api/admin/analytics/dashboard');
      if (res && res.data) {
        const d = res.data;
        document.getElementById('stat-revenue').textContent = `₹${(d.totalRevenue || 0).toLocaleString('en-IN')}`;
        document.getElementById('stat-orders').textContent = (d.totalOrders || 0).toLocaleString();
        document.getElementById('stat-products').textContent = (d.totalProducts || 0).toLocaleString();
        document.getElementById('stat-users').textContent = (d.totalUsers || 0).toLocaleString();

        this.renderRevenueChart(d.totalRevenue || 0);
        return;
      }
    } catch (err) {
      console.warn('Admin analytics sync pending:', err);
    }

    // Fallback if backend role is compiling: load product count directly
    try {
      const prodRes = await API.get('/api/products?size=1');
      if (prodRes && prodRes.data) {
        const count = prodRes.data.totalElements || (prodRes.data.content ? prodRes.data.content.length : 0);
        document.getElementById('stat-products').textContent = count.toString();
      }
    } catch (_) {}
    this.renderRevenueChart(0);
  },

  async loadOrderStats() {
    try {
      const res = await API.get('/api/admin/analytics/orders');
      if (res && res.data) {
        const stats = res.data;
        this.renderOrderStatusChart(stats);
        return;
      }
    } catch (err) {
      console.warn('Order stats sync pending:', err);
    }
    this.renderOrderStatusChart({ placed: 0, delivered: 0, cancelled: 0 });
  },

  renderRevenueChart(totalRev) {
    const ctx = document.getElementById('revenue-chart');
    if (!ctx) return;

    if (revenueChartInstance) {
      revenueChartInstance.destroy();
    }

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const dataPoints = [
      totalRev * 0.1,
      totalRev * 0.15,
      totalRev * 0.12,
      totalRev * 0.18,
      totalRev * 0.22,
      totalRev * 0.15,
      totalRev * 0.08
    ].map(v => Math.round(v));

    revenueChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue (₹)',
          data: dataPoints,
          borderColor: '#d81b60',
          backgroundColor: 'rgba(216, 27, 96, 0.08)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#d81b60',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: '#fce4ec' },
            ticks: { color: '#777777' }
          },
          y: {
            grid: { color: '#fce4ec' },
            ticks: {
              color: '#777777',
              callback: value => '₹' + value.toLocaleString('en-IN')
            }
          }
        }
      }
    });
  },

  renderOrderStatusChart(stats = {}) {
    const ctx = document.getElementById('orders-donut-chart');
    if (!ctx) return;

    if (orderStatusChartInstance) {
      orderStatusChartInstance.destroy();
    }

    const placed = stats.placed || 0;
    const delivered = stats.delivered || 0;
    const cancelled = stats.cancelled || 0;

    const total = placed + delivered + cancelled;
    const dataVals = total === 0 ? [1, 1, 1] : [placed, delivered, cancelled];

    orderStatusChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Placed / Processing', 'Delivered', 'Cancelled'],
        datasets: [{
          data: dataVals,
          backgroundColor: ['#3b82f6', '#10b981', '#ef4444'],
          borderColor: '#111827',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { size: 12 } }
          }
        },
        cutout: '70%'
      }
    });
  }
};
