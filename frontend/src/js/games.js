// Games page
const renderGames = async () => {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div class="page-header flex-between">
            <h1><i class="fas fa-gamepad"></i> Games Management</h1>
            <div class="flex gap-10">
                <button class="btn btn-primary" onclick="showAddGameModal()">
                    <i class="fas fa-plus"></i> Add Game
                </button>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <div class="flex gap-10">
                    <input type="text" id="gameSearch" placeholder="Search games..." class="form-control" style="width: 250px;">
                    <select id="gameFilter" class="form-control" style="width: 150px;">
                        <option value="">All Types</option>
                        <option value="Console">Console</option>
                        <option value="PC">PC</option>
                        <option value="VR">VR</option>
                        <option value="Arcade">Arcade</option>
                    </select>
                    <button class="btn btn-primary btn-sm" onclick="filterGames()">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
                <div>
                    <button class="btn btn-success btn-sm" onclick="filterGames('available')">
                        <i class="fas fa-check"></i> Available
                    </button>
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Price/Hour</th>
                            <th>Max Players</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="gamesTableBody">
                        <tr><td colspan="6" class="text-center">Loading...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    await loadGames();

    // Setup search
    document.getElementById('gameSearch').addEventListener('input', debounce(filterGames, 300));
    document.getElementById('gameFilter').addEventListener('change', filterGames);
};

let allGames = [];

const loadGames = async () => {
    try {
        const result = await gameAPI.getAll();
        allGames = result.games || [];
        renderGamesTable(allGames);
    } catch (error) {
        showToast('Failed to load games: ' + error.message, 'error');
        document.getElementById('gamesTableBody').innerHTML = `
            <tr><td colspan="6" class="text-center">Failed to load games</td></tr>
        `;
    }
};

const renderGamesTable = (games) => {
    const tbody = document.getElementById('gamesTableBody');
    if (!tbody) return;

    if (games.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">No games found</td></tr>`;
        return;
    }

    tbody.innerHTML = games.map(game => `
        <tr>
            <td><strong>${game.name}</strong></td>
            <td><span class="badge badge-info">${game.type}</span></td>
            <td>$${parseFloat(game.price_per_hour).toFixed(2)}</td>
            <td>${game.max_players}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(game.status)}">
                    ${game.status}
                </span>
            </td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="showEditGameModal('${game.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteGame('${game.id}')">
                    <i class="fas fa-trash"></i>
                </button>
                ${game.status !== 'available' ? `
                    <button class="btn btn-success btn-sm" onclick="updateGameStatus('${game.id}', 'available')">
                        <i class="fas fa-check"></i>
                    </button>
                ` : `
                    <button class="btn btn-warning btn-sm" onclick="updateGameStatus('${game.id}', 'in-use')">
                        <i class="fas fa-play"></i>
                    </button>
                `}
            </td>
        </tr>
    `).join('');
};

const getStatusBadgeClass = (status) => {
    switch(status) {
        case 'available': return 'badge-success';
        case 'in-use': return 'badge-warning';
        case 'maintenance': return 'badge-danger';
        default: return 'badge-info';
    }
};

const filterGames = () => {
    const search = document.getElementById('gameSearch')?.value?.toLowerCase() || '';
    const type = document.getElementById('gameFilter')?.value || '';
    
    let filtered = allGames;
    
    if (search) {
        filtered = filtered.filter(g => 
            g.name.toLowerCase().includes(search) || 
            g.description?.toLowerCase().includes(search)
        );
    }
    
    if (type) {
        filtered = filtered.filter(g => g.type === type);
    }
    
    renderGamesTable(filtered);
};

const showAddGameModal = () => {
    showModal(`
        <h2>Add New Game</h2>
        <form id="addGameForm" onsubmit="addGame(event)">
            <div class="form-group">
                <label for="gameName">Name *</label>
                <input type="text" id="gameName" required>
            </div>
            <div class="form-group">
                <label for="gameDescription">Description</label>
                <textarea id="gameDescription" rows="3"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="gameType">Type *</label>
                    <select id="gameType" required>
                        <option value="Console">Console</option>
                        <option value="PC">PC</option>
                        <option value="VR">VR</option>
                        <option value="Arcade">Arcade</option>
                        <option value="Board">Board</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="gamePrice">Price per Hour ($) *</label>
                    <input type="number" id="gamePrice" step="0.01" min="0" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="gameMaxPlayers">Max Players</label>
                    <input type="number" id="gameMaxPlayers" value="1" min="1">
                </div>
                <div class="form-group">
                    <label for="gameStatus">Status</label>
                    <select id="gameStatus">
                        <option value="available">Available</option>
                        <option value="in-use">In Use</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="unavailable">Unavailable</option>
                    </select>
                </div>
            </div>
            <div class="flex gap-10 mt-20">
                <button type="submit" class="btn btn-primary">Add Game</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `);
};

const addGame = async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('gameName').value,
        description: document.getElementById('gameDescription').value,
        type: document.getElementById('gameType').value,
        pricePerHour: parseFloat(document.getElementById('gamePrice').value),
        maxPlayers: parseInt(document.getElementById('gameMaxPlayers').value) || 1,
        status: document.getElementById('gameStatus').value
    };

    try {
        const result = await gameAPI.create(data);
        if (result.success) {
            showToast('Game added successfully!', 'success');
            closeModal();
            loadGames();
        }
    } catch (error) {
        showToast('Failed to add game: ' + error.message, 'error');
    }
};

const showEditGameModal = async (id) => {
    try {
        const result = await gameAPI.getById(id);
        const game = result.game;
        if (!game) {
            showToast('Game not found', 'error');
            return;
        }

        showModal(`
            <h2>Edit Game</h2>
            <form id="editGameForm" onsubmit="updateGame(event, '${id}')">
                <div class="form-group">
                    <label for="editGameName">Name *</label>
                    <input type="text" id="editGameName" value="${game.name}" required>
                </div>
                <div class="form-group">
                    <label for="editGameDescription">Description</label>
                    <textarea id="editGameDescription" rows="3">${game.description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editGameType">Type *</label>
                        <select id="editGameType" required>
                            ${['Console', 'PC', 'VR', 'Arcade', 'Board', 'Other'].map(t => `
                                <option value="${t}" ${t === game.type ? 'selected' : ''}>${t}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editGamePrice">Price per Hour ($) *</label>
                        <input type="number" id="editGamePrice" step="0.01" min="0" value="${game.price_per_hour}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="editGameMaxPlayers">Max Players</label>
                        <input type="number" id="editGameMaxPlayers" value="${game.max_players}" min="1">
                    </div>
                    <div class="form-group">
                        <label for="editGameStatus">Status</label>
                        <select id="editGameStatus">
                            ${['available', 'in-use', 'maintenance', 'unavailable'].map(s => `
                                <option value="${s}" ${s === game.status ? 'selected' : ''}>${s}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                <div class="flex gap-10 mt-20">
                    <button type="submit" class="btn btn-primary">Update Game</button>
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        `);
    } catch (error) {
        showToast('Failed to load game: ' + error.message, 'error');
    }
};

const updateGame = async (e, id) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('editGameName').value,
        description: document.getElementById('editGameDescription').value,
        type: document.getElementById('editGameType').value,
        pricePerHour: parseFloat(document.getElementById('editGamePrice').value),
        maxPlayers: parseInt(document.getElementById('editGameMaxPlayers').value) || 1,
        status: document.getElementById('editGameStatus').value
    };

    try {
        const result = await gameAPI.update(id, data);
        if (result.success) {
            showToast('Game updated successfully!', 'success');
            closeModal();
            loadGames();
        }
    } catch (error) {
        showToast('Failed to update game: ' + error.message, 'error');
    }
};

const deleteGame = async (id) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    
    try {
        const result = await gameAPI.delete(id);
        if (result.success) {
            showToast('Game deleted successfully!', 'success');
            loadGames();
        }
    } catch (error) {
        showToast('Failed to delete game: ' + error.message, 'error');
    }
};

const updateGameStatus = async (id, status) => {
    try {
        const result = await gameAPI.updateStatus(id, status);
        if (result.success) {
            showToast(`Game status updated to ${status}`, 'success');
            loadGames();
        }
    } catch (error) {
        showToast('Failed to update status: ' + error.message, 'error');
    }
};