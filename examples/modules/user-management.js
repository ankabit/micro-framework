/**
 * User Management Module Example
 * Demonstrates CRUD operations and data management
 */

export default {
    name: 'user-management',
    
    beforeMount(params, context) {
        // Initialize mock data
        this.users = [
            { id: 1, name: 'John Doe', email: 'john.doe@company.io', role: 'Admin', status: 'Active', created: '2024-01-15' },
            { id: 2, name: 'Jane Smith', email: 'jane.smith@company.io', role: 'Editor', status: 'Active', created: '2024-01-20' },
            { id: 3, name: 'Mike Johnson', email: 'mike.johnson@company.io', role: 'User', status: 'Inactive', created: '2024-02-01' },
            { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@company.io', role: 'User', status: 'Active', created: '2024-02-10' },
            { id: 5, name: 'David Brown', email: 'david.brown@company.io', role: 'Editor', status: 'Active', created: '2024-02-15' }
        ];
        
        this.currentFilter = 'all';
        this.searchQuery = '';
    },
    
    render(container, params, context) {
        container.innerHTML = `
            <div class="user-management-header">
                <h1>👥 User Management</h1>
                <p class="mf-text-muted">Manage your application users and their permissions.</p>
            </div>
            
            <!-- Actions Bar -->
            <div class="mf-card">
                <div class="mf-card-content">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <div class="mf-form-group" style="margin-bottom: 0;">
                                <input type="text" class="mf-form-control" placeholder="Search users..." 
                                       id="userSearch" onkeyup="userManagement.filterUsers()" style="min-width: 250px;">
                            </div>
                            
                            <div class="mf-form-group" style="margin-bottom: 0;">
                                <select class="mf-form-control" id="statusFilter" onchange="userManagement.filterUsers()">
                                    <option value="all">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            
                            <div class="mf-form-group" style="margin-bottom: 0;">
                                <select class="mf-form-control" id="roleFilter" onchange="userManagement.filterUsers()">
                                    <option value="all">All Roles</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Editor">Editor</option>
                                    <option value="User">User</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <button class="mf-btn mf-btn-success" onclick="userManagement.showAddUserModal()">
                                ➕ Add User
                            </button>
                            <button class="mf-btn mf-btn-info" onclick="userManagement.exportUsers()">
                                📊 Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Users Table -->
            <div class="mf-card">
                <div class="mf-card-content">
                    <div style="overflow-x: auto;">
                        <table id="usersTable" style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: var(--mf-light);">
                                    <th style="padding: 1rem; text-align: left; border-bottom: 2px solid var(--mf-border-color); cursor: pointer;" onclick="userManagement.sortBy('id')">
                                        ID ↕
                                    </th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 2px solid var(--mf-border-color); cursor: pointer;" onclick="userManagement.sortBy('name')">
                                        Name ↕
                                    </th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 2px solid var(--mf-border-color); cursor: pointer;" onclick="userManagement.sortBy('email')">
                                        Email ↕
                                    </th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 2px solid var(--mf-border-color); cursor: pointer;" onclick="userManagement.sortBy('role')">
                                        Role ↕
                                    </th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 2px solid var(--mf-border-color); cursor: pointer;" onclick="userManagement.sortBy('status')">
                                        Status ↕
                                    </th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 2px solid var(--mf-border-color);">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="usersTableBody">
                                ${this.renderUsersTable()}
                            </tbody>
                        </table>
                    </div>
                    
                    <div id="userStats" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--mf-border-color);">
                        ${this.renderUserStats()}
                    </div>
                </div>
            </div>
            
            <!-- Add User Modal -->
            <div id="addUserModal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999;">
                <div class="modal-content" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 2rem; border-radius: var(--mf-border-radius); max-width: 500px; width: 90%;">
                    <h3 style="margin-top: 0;">Add New User</h3>
                    
                    <form class="mf-form" onsubmit="userManagement.addUser(event)">
                        <div class="mf-form-group">
                            <label>Full Name *</label>
                            <input type="text" class="mf-form-control" name="name" required>
                        </div>
                        
                        <div class="mf-form-group">
                            <label>Email Address *</label>
                            <input type="email" class="mf-form-control" name="email" required>
                        </div>
                        
                        <div class="mf-form-group">
                            <label>Role</label>
                            <select class="mf-form-control" name="role">
                                <option value="User">User</option>
                                <option value="Editor">Editor</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        
                        <div class="mf-form-group">
                            <label>Status</label>
                            <select class="mf-form-control" name="status">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        
                        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                            <button type="button" class="mf-btn mf-btn-secondary" onclick="userManagement.hideAddUserModal()">
                                Cancel
                            </button>
                            <button type="submit" class="mf-btn mf-btn-primary">
                                Add User
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Make module available globally
        window.userManagement = this;
    },
    
    renderUsersTable() {
        const filteredUsers = this.getFilteredUsers();
        
        return filteredUsers.map(user => `
            <tr>
                <td style="padding: 1rem; border-bottom: 1px solid var(--mf-border-color);">${user.id}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--mf-border-color);">
                    <strong>${user.name}</strong>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--mf-border-color);">
                    <a href="mailto:${user.email}" style="color: var(--mf-primary);">${user.email}</a>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--mf-border-color);">
                    <span class="role-badge" style="padding: 0.25rem 0.75rem; background: ${this.getRoleColor(user.role)}; color: white; border-radius: 1rem; font-size: 0.875rem;">
                        ${user.role}
                    </span>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--mf-border-color);">
                    <span class="status-badge" style="padding: 0.25rem 0.75rem; background: ${user.status === 'Active' ? 'var(--mf-success)' : 'var(--mf-secondary)'}; color: white; border-radius: 1rem; font-size: 0.875rem;">
                        ${user.status}
                    </span>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--mf-border-color);">
                    <button class="mf-btn mf-btn-info" onclick="window.app.navigate('/user/${user.id}')" 
                            style="margin: 0; padding: 0.25rem 0.75rem; font-size: 0.875rem;">
                        View
                    </button>
                    <button class="mf-btn mf-btn-warning" onclick="userManagement.editUser(${user.id})" 
                            style="margin: 0 0 0 0.5rem; padding: 0.25rem 0.75rem; font-size: 0.875rem;">
                        Edit
                    </button>
                    <button class="mf-btn mf-btn-danger" onclick="userManagement.deleteUser(${user.id})" 
                            style="margin: 0 0 0 0.5rem; padding: 0.25rem 0.75rem; font-size: 0.875rem;">
                        Delete
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    renderUserStats() {
        const total = this.users.length;
        const active = this.users.filter(u => u.status === 'Active').length;
        const admins = this.users.filter(u => u.role === 'Admin').length;
        const filtered = this.getFilteredUsers().length;
        
        return `
            <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                <div>
                    <strong>Total Users:</strong> ${total}
                </div>
                <div>
                    <strong>Active Users:</strong> ${active}
                </div>
                <div>
                    <strong>Administrators:</strong> ${admins}
                </div>
                <div>
                    <strong>Showing:</strong> ${filtered} of ${total}
                </div>
            </div>
        `;
    },
    
    getFilteredUsers() {
        let filtered = [...this.users];
        
        // Search filter
        const searchQuery = document.getElementById('userSearch')?.value.toLowerCase() || '';
        if (searchQuery) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchQuery) ||
                user.email.toLowerCase().includes(searchQuery)
            );
        }
        
        // Status filter
        const statusFilter = document.getElementById('statusFilter')?.value || 'all';
        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }
        
        // Role filter
        const roleFilter = document.getElementById('roleFilter')?.value || 'all';
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }
        
        return filtered;
    },
    
    getRoleColor(role) {
        const colors = {
            'Admin': 'var(--mf-danger)',
            'Editor': 'var(--mf-warning)',
            'User': 'var(--mf-info)'
        };
        return colors[role] || 'var(--mf-secondary)';
    },
    
    filterUsers() {
        const tableBody = document.getElementById('usersTableBody');
        const userStats = document.getElementById('userStats');
        
        if (tableBody) {
            tableBody.innerHTML = this.renderUsersTable();
        }
        
        if (userStats) {
            userStats.innerHTML = this.renderUserStats();
        }
    },
    
    sortBy(field) {
        this.users.sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];
            
            if (typeof aVal === 'string') {
                return aVal.localeCompare(bVal);
            }
            
            return aVal - bVal;
        });
        
        this.filterUsers();
    },
    
    showAddUserModal() {
        document.getElementById('addUserModal').style.display = 'block';
    },
    
    hideAddUserModal() {
        document.getElementById('addUserModal').style.display = 'none';
    },
    
    addUser(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const userData = Object.fromEntries(formData);
        
        const newUser = {
            id: Math.max(...this.users.map(u => u.id)) + 1,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            status: userData.status,
            created: new Date().toISOString().split('T')[0]
        };
        
        this.users.push(newUser);
        this.filterUsers();
        this.hideAddUserModal();
        
        // Reset form
        event.target.reset();
        
        this.showNotification(`User "${newUser.name}" added successfully!`, 'success');
    },
    
    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            const newName = prompt('Enter new name:', user.name);
            if (newName && newName.trim()) {
                user.name = newName.trim();
                this.filterUsers();
                this.showNotification(`User updated successfully!`, 'success');
            }
        }
    },
    
    deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user && confirm(`Are you sure you want to delete user "${user.name}"?`)) {
            this.users = this.users.filter(u => u.id !== userId);
            this.filterUsers();
            this.showNotification(`User "${user.name}" deleted successfully!`, 'info');
        }
    },
    
    exportUsers() {
        const data = {
            timestamp: new Date().toISOString(),
            users: this.getFilteredUsers(),
            total: this.users.length
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Users exported successfully!', 'info');
    },
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `mf-alert mf-alert-${type}`;
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    },
    
    destroy() {
        // Clean up global references
        delete window.userManagement;
        
        // Remove any event listeners
        const modal = document.getElementById('addUserModal');
        if (modal) {
            modal.remove();
        }
    }
};
