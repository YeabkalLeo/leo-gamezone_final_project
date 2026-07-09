// Snacks page
const renderSnacks = async () => {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="page-header flex-between">
            <h1><i class="fas fa-utensils"></i> Snack Management</h1>
            <div class="flex gap-10">
                <button class="btn btn-primary" onclick="showAddSnackModal()">
                    <i class="fas fa-plus"></i> Add Snack
                </button>
                <button class="btn btn-warning" onclick="showLowStock()">
                    <i class="fas fa-exclamation-triangle"></i> Low Stock
                </button>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <div class="flex gap-10">
                    <input type="text" id="snackSearch" placeholder="Search snacks..." class="form-control" style="width: 250px;">
                    <button class="btn btn-primary btn-sm" onclick="searchSnacks()">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Category</th>
                            <th>Supplier</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="snacksTableBody">
                        <tr><td colspan="7" class="text-center">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    await loadSnacks();
    document.getElementById('snackSearch').addEventListener('input', debounce(searchSnacks, 300));
};

let allSnacks = [];

const loadSnacks = async () => {
    try {
        const result = await snackAPI.getAll();
        allSnacks = result.snacks || [];
        renderSnacksTable(allSnacks);
    } catch (error) {
        showToast('Failed to load snacks: ' + error.message, 'error');
        document.getElementById('snacksTableBody').innerHTML = `
            <tr><td colspan="7" class="text-center">Failed to load snacks</td></tr>
        `;
    }
};

const renderSnacksTable = (snacks) => {
    const tbody = document.getElementById('snacksTableBody');
    if (!tbody) return;

    if (snacks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center">No snacks found</td></tr>`;
        return;
    }

    tbody.innerHTML = snacks.map(snack => `
        <tr>
            <td><strong>${snack.name}</strong></td>
            <td>${snack.description || '-'}</td>
            <td>$${parseFloat(snack.price).toFixed(2)}</td>
            <td>
                <span class="${snack.quantity <= 10 ? (snack.quantity === 0 ? 'text-danger' : 'text-warning') : ''}">
                    ${snack.quantity}
                </span>
                ${snack.quantity <= 10 ? ` <span class="badge ${snack.quantity === 0 ? 'badge-danger' : 'badge-warning'}">${snack.quantity === 0 ? 'Out of Stock' : 'Low'}</span>` : ''}
            </td>
            <td>${snack.category || '-'}</td>
            <td>${snack.supplier || '-'}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="showEditSnackModal('${snack.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-info btn-sm" onclick="showUpdateQuantityModal('${snack.id}')">
                    <i class="fas fa-box"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteSnack('${snack.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
};

const searchSnacks = () => {
    const search = document.getElementById('snackSearch')?.value?.toLowerCase() || '';
    if (!search) {
        renderSnacksTable(allSnacks);
        return;
    }
    
    const filtered = allSnacks.filter(s => 
        s.name.toLowerCase().includes(search) || 
        s.description?.toLowerCase().includes(search) ||
        s.category?.toLowerCase().includes(search) ||
        s.supplier?.toLowerCase().includes(search)
    );
    renderSnacksTable(filtered);
};

const showLowStock = async () => {
    try {
        const result = await snackAPI.getLowStock(10);
        renderSnacksTable(result.snacks || []);
        showToast(`Showing ${result.snacks?.length || 0} low stock items`, 'warning');
    } catch (error) {
        showToast('Failed to load low stock: ' + error.message, 'error');
    }
};

const showAddSnackModal = () => {
    showModal(`
        <h2>Add New Snack</h2>
        <form id="addSnackForm" onsubmit="addSnack(event)">
            <div class="form-group">
                <label for="snackName">Name *</label>
                <input type="text" id="snackName" required>
            </div>
            <div class="form-group">
                <label for="snackDescription">Description</label>
                <textarea id="snackDescription" rows="2"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="snackPrice">Price ($) *</label>
                    <input type="number" id="snackPrice" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="snackQuantity">Quantity *</label>
                    <input type="number" id="snackQuantity" min="0" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="snackCategory">Category</label>
                    <select id="snackCategory">
                        <option value="">Select category</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Beverages">Beverages</option>
                        <option value="Sweets">Sweets</option>
                        <option value="Food">Food</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="snackSupplier">Supplier</label>
                    <input type="text" id="snackSupplier">
                </div>
            </div>
            <div class="flex gap-10 mt-20">
                <button type="submit" class="btn btn-primary">Add Snack</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);
};

const addSnack = async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('snackName').value,
        description: document.getElementById('snackDescription').value,
        price: parseFloat(document.getElementById('snackPrice').value),
        quantity: parseInt(document.getElementById('snackQuantity').value),
        category: document.getElementById('snackCategory').value,
        supplier: document.getElementById('snackSupplier').value
    };

    try {
        const result = await snackAPI.create(data);
        if (result.success) {
            showToast('Snack added successfully!', 'success');
            closeModal();
            loadSnacks();
        }
    } catch (error) {
        showToast('Failed to add snack: ' + error.message, 'error');
    }
};

const showEditSnackModal = async (id) => {
    try {
        const result = await snackAPI.getById(id);
        const snack = result.snack;
        if (!snack) {
            showToast('Snack not found', 'error');
            return;
        }

        showModal(`
            <h2>Edit Snack</h2>
            <form id="editSnackForm" onsubmit="updateSnack(event, '${id}')">
                <div class="form-group">
                    <label for="editSnackName">Name *</label>
                    <input type="text" id="editSnackName" value="${snack.name}" required>
                </div>
                <div class="form-group">
                    <label for="editSnackDescription">Description</label>
                    <textarea id="editSnackDescription" rows="2">${snack.description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editSnackPrice">Price ($) *</label>
                        <input type="number" id="editSnackPrice" step="0.01" min="0" value="${snack.price}" required>
                    </div>
                    <div class="form-group">
                        <label for="editSnackQuantity">Quantity *</label>
                        <input type="number" id="editSnackQuantity" min="0" value="${snack.quantity}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editSnackCategory">Category</label>
                        <select id="editSnackCategory">
                            <option value="">Select category</option>
                            ${['Snacks', 'Beverages', 'Sweets', 'Food', 'Other'].map(c => `
                                <option value="${c}" ${c === snack.category ? 'selected' : ''}>${c}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editSnackSupplier">Supplier</label>
                        <input type="text" id="editSnackSupplier" value="${snack.supplier || ''}">
                    </div>
                </div>
                <div class="flex gap-10 mt-20">
                    <button type="submit" class="btn btn-primary">Update Snack</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        `);
    } catch (error) {
        showToast('Failed to load snack: ' + error.message, 'error');
    }
};

const updateSnack = async (e, id) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('editSnackName').value,
        description: document.getElementById('editSnackDescription').value,
        price: parseFloat(document.getElementById('editSnackPrice').value),
        quantity: parseInt(document.getElementById('editSnackQuantity').value),
        category: document.getElementById('editSnackCategory').value,
        supplier: document.getElementById('editSnackSupplier').value
    };

    try {
        const result = await snackAPI.update(id, data);
        if (result.success) {
            showToast('Snack updated successfully!', 'success');
            closeModal();
            loadSnacks();
        }
    } catch (error) {
        showToast('Failed to update snack: ' + error.message, 'error');
    }
};

const showUpdateQuantityModal = (id) => {
    showModal(`
        <h2>Update Quantity</h2>
        <form id="updateQuantityForm" onsubmit="updateQuantity(event, '${id}')">
            <div class="form-group">
                <label for="newQuantity">New Quantity *</label>
                <input type="number" id="newQuantity" min="0" required>
            </div>
            <div class="flex gap-10 mt-20">
                <button type="submit" class="btn btn-primary">Update</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);
};

const updateQuantity = async (e, id) => {
    e.preventDefault();
    const quantity = parseInt(document.getElementById('newQuantity').value);

    if (quantity < 0) {
        showToast('Quantity cannot be negative', 'error');
        return;
    }

    try {
        const result = await snackAPI.updateQuantity(id, quantity);
        if (result.success) {
            showToast('Quantity updated successfully!', 'success');
            closeModal();
            loadSnacks();
        }
    } catch (error) {
        showToast('Failed to update quantity: ' + error.message, 'error');
    }
};

const deleteSnack = async (id) => {
    if (!confirm('Are you sure you want to delete this snack?')) return;
    
    try {
        const result = await snackAPI.delete(id);
        if (result.success) {
            showToast('Snack deleted successfully!', 'success');
            loadSnacks();
        }
    } catch (error) {
        showToast('Failed to delete snack: ' + error.message, 'error');
    }
};