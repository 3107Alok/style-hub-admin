/**
 * StyleHub Admin Portal - Products Management Controller
 * Full support for Sizes, Colors, Photos, Description, and Live Editing
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

    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#777777;"><span class="spinner"></span> Loading products catalog...</td></tr>';

    try {
      const res = await API.get('/api/products?size=100');
      if (res && res.data) {
        this.list = res.data.content || res.data || [];
        this.renderTable(this.list);
      }
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#e11d48;">Failed to load products. Please check server connection.</td></tr>';
    }
  },

  renderTable(products) {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    if (products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:40px; color:#777777;">
            <i class="fas fa-tshirt" style="font-size:36px; color:#d81b60; margin-bottom:12px; display:block;"></i>
            No products found in catalog. Click <strong>+ Add New Product</strong> to create your first item!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = products.map(p => {
      const imgUrl = (p.images && p.images.length > 0) ? p.images[0] : 'https://placehold.co/100x100?text=StyleHub';
      const stockBadge = p.stock > 0 
        ? `<span class="badge badge-stock">${p.stock} in stock</span>`
        : `<span class="badge badge-out">Out of stock</span>`;

      return `
        <tr>
          <td>
            <div class="product-cell">
              <img src="${imgUrl}" alt="${p.title}" class="product-thumb" onerror="this.src='https://placehold.co/100x100?text=StyleHub'" />
              <div>
                <div style="font-weight:700; color:#222222;">${this.escapeHtml(p.title)}</div>
                <div style="font-size:12px; color:#777777;">${p.brand || 'StyleHub'}</div>
              </div>
            </div>
          </td>
          <td><span class="badge" style="background:#fce4ec; color:#ad1457; font-weight:700;">${p.categoryName || 'Fashion'}</span></td>
          <td style="font-weight:800; color:#0f8a5f; font-size:15px;">₹${(p.price || 0).toLocaleString('en-IN')}</td>
          <td style="color:#777777; font-weight:600;">${p.discountPrice ? '₹' + p.discountPrice.toLocaleString('en-IN') : '-'}</td>
          <td>${stockBadge}</td>
          <td>
            ${p.featured ? '<span class="badge badge-placed" style="margin-right:4px;">⭐ Featured</span>' : ''}
            ${p.flashSale ? '<span class="badge badge-processing" style="background:#fff3e0; color:#b45309;">⚡ Sale</span>' : ''}
          </td>
          <td>
            <div class="action-btn-group">
              <button class="btn-icon" title="Edit Existing Product" onclick="Products.openEditModal('${p.id}')">
                <i class="fas fa-edit" style="color:#d81b60;"></i>
              </button>
              <button class="btn-icon delete" title="Delete Product" onclick="Products.deleteProduct('${p.id}', '${this.escapeHtml(p.title)}')">
                <i class="fas fa-trash-alt" style="color:#e11d48;"></i>
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
      (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
    this.renderTable(filtered);
  },

  previewImage(url) {
    const previewEl = document.getElementById('prod-image-preview');
    if (previewEl) {
      if (url && (url.trim().startsWith('http') || url.trim().startsWith('data:image'))) {
        previewEl.src = url.trim();
      } else {
        previewEl.src = 'https://placehold.co/60x60?text=Preview';
      }
    }
  },

  handleFileUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        document.getElementById('prod-image').value = base64;
        this.previewImage(base64);
        Toast.success(`Selected image: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  },

  usePresetImage(category) {
    const presets = {
      dress: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop',
      jeans: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop',
      top: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&auto=format&fit=crop',
      shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
      saree: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop'
    };
    const url = presets[category] || presets.dress;
    document.getElementById('prod-image').value = url;
    this.previewImage(url);
    Toast.success(`Applied ${category.toUpperCase()} preset photo!`);
  },

  openAddModal() {
    this.currentEditId = null;
    document.getElementById('product-modal-title').textContent = 'Add New Product';
    document.getElementById('product-form').reset();
    document.getElementById('prod-brand').value = 'StyleHub';
    document.getElementById('prod-stock').value = '25';
    document.getElementById('prod-sizes').value = 'S, M, L, XL';
    document.getElementById('prod-colors').value = 'Black, Navy Blue, Beige';
    this.previewImage('');
    document.getElementById('product-modal').classList.add('active');
  },

  openEditModal(id) {
    const product = this.list.find(p => p.id === id);
    if (!product) return;

    this.currentEditId = id;
    document.getElementById('product-modal-title').textContent = `Edit Product: ${product.title}`;
    
    document.getElementById('prod-title').value = product.title || '';
    document.getElementById('prod-description').value = product.description || '';
    document.getElementById('prod-brand').value = product.brand || 'StyleHub';
    document.getElementById('prod-price').value = product.price || '';
    document.getElementById('prod-discount').value = product.discountPrice || '';
    document.getElementById('prod-stock').value = product.stock !== undefined ? product.stock : 20;
    document.getElementById('prod-featured').checked = !!product.featured;
    document.getElementById('prod-flash-sale').checked = !!product.flashSale;

    // Pre-fill image if exists
    const imgUrl = (product.images && product.images.length > 0) ? product.images[0] : '';
    document.getElementById('prod-image').value = imgUrl;
    this.previewImage(imgUrl);

    // Pre-fill sizes and colors defaults
    document.getElementById('prod-sizes').value = 'S, M, L, XL, XXL';
    document.getElementById('prod-colors').value = 'Black, Beige, Navy Blue';

    // Set category if matched
    const catSelect = document.getElementById('prod-category');
    if (catSelect && product.categoryName) {
      const match = Array.from(catSelect.options).find(opt => opt.text.toLowerCase() === product.categoryName.toLowerCase());
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
    submitBtn.textContent = 'Saving Changes...';

    const categoryId = document.getElementById('prod-category').value;
    const imageUrl = document.getElementById('prod-image').value.trim();

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

    if (imageUrl) {
      body.images = [imageUrl];
    }

    try {
      if (this.currentEditId) {
        // Edit existing product
        await API.put(`/api/admin/products/${this.currentEditId}`, body);
        Toast.success(`Product "${body.title}" updated successfully!`);
      } else {
        // Add new product
        await API.post('/api/admin/products', body);
        Toast.success(`Product "${body.title}" added to catalog!`);
      }
      this.closeModal();
      await this.fetchProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  },

  async deleteProduct(id, title) {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      await API.delete(`/api/admin/products/${id}`);
      Toast.success('Product deleted from catalog.');
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
