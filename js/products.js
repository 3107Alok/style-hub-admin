/**
 * StyleHub Admin Portal - Products Management Controller
 */

const Products = {
  list: [],
  categories: [],
  currentEditId: null,

  async load() {
    await Promise.all([
      this.fetchCategories(),
      this.fetchProducts()
    ]);
  },

  async fetchCategories() {
    try {
      const res = await API.get('/api/categories');
      if (res && res.data) {
        this.categories = res.data;
        this.populateCategoryDropdowns();
      }
    } catch (err) {
      console.warn('Could not fetch categories:', err);
    }
  },

  async fetchProducts() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;"><span class="spinner"></span> Loading products...</td></tr>';

    try {
      const res = await API.get('/api/products?size=100');
      if (res && res.data) {
        this.list = res.data.content || res.data || [];
        this.renderTable(this.list);
      }
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#ef4444;">Failed to load products. Please check server connection.</td></tr>';
    }
  },

  renderTable(products) {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    if (products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:40px; color:#94a3b8;">
            <i class="fas fa-box-open" style="font-size:32px; margin-bottom:12px; display:block;"></i>
            No products found. Click <strong>+ Add Product</strong> to add your first item!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = products.map(p => {
      const imgUrl = (p.images && p.images.length > 0) ? p.images[0] : 'https://placehold.co/100x100?text=Product';
      const stockBadge = p.stock > 0 
        ? `<span class="badge badge-stock">${p.stock} in stock</span>`
        : `<span class="badge badge-out">Out of stock</span>`;

      return `
        <tr>
          <td>
            <div class="product-cell">
              <img src="${imgUrl}" alt="${p.title}" class="product-thumb" onerror="this.src='https://placehold.co/100x100?text=Product'" />
              <div>
                <div style="font-weight:700;">${this.escapeHtml(p.title)}</div>
                <div style="font-size:12px; color:#64748b;">${p.brand || 'StyleHub'}</div>
              </div>
            </div>
          </td>
          <td><span class="badge" style="background:#1e293b; color:#cbd5e1;">${p.categoryName || 'General'}</span></td>
          <td style="font-weight:700; color:#10b981;">₹${(p.price || 0).toLocaleString('en-IN')}</td>
          <td style="color:#94a3b8;">${p.discountPrice ? '₹' + p.discountPrice.toLocaleString('en-IN') : '-'}</td>
          <td>${stockBadge}</td>
          <td>
            ${p.featured ? '<span class="badge badge-placed" style="margin-right:4px;">Featured</span>' : ''}
            ${p.flashSale ? '<span class="badge badge-processing">Sale</span>' : ''}
          </td>
          <td>
            <div class="action-btn-group">
              <button class="btn-icon" title="Edit Product" onclick="Products.openEditModal('${p.id}')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon delete" title="Delete Product" onclick="Products.deleteProduct('${p.id}', '${this.escapeHtml(p.title)}')">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  populateCategoryDropdowns() {
    const select = document.getElementById('prod-category');
    if (!select) return;

    select.innerHTML = '<option value="">Select Category</option>' + 
      this.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  },

  filterProducts(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.renderTable(this.list);
      return;
    }
    const filtered = this.list.filter(p => 
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q))
    );
    this.renderTable(filtered);
  },

  openAddModal() {
    this.currentEditId = null;
    document.getElementById('product-modal-title').textContent = 'Add New Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-modal').classList.add('active');
  },

  openEditModal(id) {
    const product = this.list.find(p => p.id === id);
    if (!product) return;

    this.currentEditId = id;
    document.getElementById('product-modal-title').textContent = 'Edit Product';
    
    document.getElementById('prod-title').value = product.title || '';
    document.getElementById('prod-description').value = product.description || '';
    document.getElementById('prod-brand').value = product.brand || '';
    document.getElementById('prod-price').value = product.price || '';
    document.getElementById('prod-discount').value = product.discountPrice || '';
    document.getElementById('prod-stock').value = product.stock !== undefined ? product.stock : 10;
    document.getElementById('prod-featured').checked = !!product.featured;
    document.getElementById('prod-flash-sale').checked = !!product.flashSale;

    // Set category if matched
    const catSelect = document.getElementById('prod-category');
    if (catSelect && product.categoryName) {
      const match = Array.from(catSelect.options).find(opt => opt.text === product.categoryName);
      if (match) catSelect.value = match.value;
    }

    document.getElementById('product-modal').classList.add('active');
  },

  closeModal() {
    document.getElementById('product-modal').classList.remove('active');
  },

  async handleFormSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('save-product-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const categoryId = document.getElementById('prod-category').value;
    const body = {
      title: document.getElementById('prod-title').value.trim(),
      description: document.getElementById('prod-description').value.trim(),
      brand: document.getElementById('prod-brand').value.trim() || 'StyleHub',
      price: parseFloat(document.getElementById('prod-price').value),
      discountPrice: document.getElementById('prod-discount').value ? parseFloat(document.getElementById('prod-discount').value) : null,
      stock: parseInt(document.getElementById('prod-stock').value, 10) || 0,
      categoryId: categoryId || null,
      featured: document.getElementById('prod-featured').checked,
      flashSale: document.getElementById('prod-flash-sale').checked
    };

    try {
      if (this.currentEditId) {
        // Edit
        await API.put(`/api/admin/products/${this.currentEditId}`, body);
        Toast.success('Product updated successfully!');
      } else {
        // Add
        await API.post('/api/admin/products', body);
        Toast.success('Product added successfully!');
      }
      this.closeModal();
      await this.fetchProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Product';
    }
  },

  async deleteProduct(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await API.delete(`/api/admin/products/${id}`);
      Toast.success('Product deleted.');
      await this.fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};
