/**
 * StyleHub Admin Portal - Categories Controller
 */

const Categories = {
  list: [],

  async load() {
    await this.fetchCategories();
  },

  async fetchCategories() {
    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:#94a3b8;"><span class="spinner"></span> Loading categories...</td></tr>';

    try {
      const res = await API.get('/api/categories');
      if (res && res.data) {
        this.list = res.data || [];
        this.renderTable(this.list);
      }
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:#ef4444;">Failed to load categories.</td></tr>';
    }
  },

  renderTable(categories) {
    const tbody = document.getElementById('categories-table-body');
    if (!tbody) return;

    if (categories.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; padding:40px; color:#94a3b8;">
            No categories found. Click <strong>+ Add Category</strong> to create one.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = categories.map(c => `
      <tr>
        <td style="font-weight:700; color:#cbd5e1;">${c.name}</td>
        <td style="color:#94a3b8; font-size:13px;">${c.slug || c.name.toLowerCase().replace(/\s+/g, '-')}</td>
        <td>
          ${c.imageUrl ? `<img src="${c.imageUrl}" style="width:36px; height:36px; border-radius:6px; object-fit:cover;" onerror="this.style.display='none'" />` : '-'}
        </td>
        <td>
          <button class="btn-icon delete" title="Delete Category" onclick="Categories.deleteCategory('${c.id}', '${c.name}')">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `).join('');
  },

  openAddModal() {
    document.getElementById('category-form').reset();
    document.getElementById('category-modal').classList.add('active');
  },

  closeModal() {
    document.getElementById('category-modal').classList.remove('active');
  },

  async handleFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('cat-name').value.trim();
    const imageUrl = document.getElementById('cat-image').value.trim();

    if (!name) {
      Toast.error('Please enter category name.');
      return;
    }

    try {
      await API.post('/api/admin/categories', { name, imageUrl });
      Toast.success('Category created successfully!');
      this.closeModal();
      await this.fetchCategories();
      await Products.fetchCategories();
    } catch (err) {
      console.error('Failed to add category:', err);
    }
  },

  async deleteCategory(id, name) {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await API.delete(`/api/admin/categories/${id}`);
      Toast.success('Category deleted.');
      await this.fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  }
};
