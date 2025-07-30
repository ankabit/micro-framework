/**
 * Users Module - User management with CRUD operations
 * Demonstrates data handling and complex routing
 */
export default {
    name: 'users',
    version: '1.1.0',
    description: 'User management module with CRUD operations',

    // Sample data (in real app, this would come from API)
    data: {
        users: [
            { id: 1, name: 'John Doe', email: 'john.doe@company.io', role: 'Admin', status: 'Active' },
            { id: 2, name: 'Jane Smith', email: 'jane.smith@company.io', role: 'User', status: 'Active' },
            { id: 3, name: 'Mike Johnson', email: 'mike.johnson@company.io', role: 'Editor', status: 'Inactive' },
            { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@company.io', role: 'User', status: 'Active' },
            { id: 5, name: 'Tom Brown', email: 'tom.brown@company.io', role: 'Moderator', status: 'Active' }
        ]
    },

    // Module routes
    routes: {
        '/users': {},  // Uses module render method
        '/users/create': {
            handler: (params, context) => {
                context.framework.moduleContainer.innerHTML = `
                    <h1>👥 Create New User</h1>
                    <div class="mf-card">
                        <div class="mf-card-content">
                            <form class="mf-form" onsubmit="handleCreateUser(event)">
                                <div class="mf-form-group">
                                    <label>Full Name *</label>
                                    <input type="text" class="mf-form-control" name="name" required placeholder="Enter full name">
                                </div>
                                <div class="mf-form-group">
                                    <label>Email Address *</label>
                                    <input type="email" class="mf-form-control" name="email" required placeholder="user@company.io">
                                </div>
                                <div class="mf-form-group">
                                    <label>Role</label>
                                    <select class="mf-form-control" name="role">
                                        <option>User</option>
                                        <option>Editor</option>
                                        <option>Moderator</option>
                                        <option>Admin</option>
                                    </select>
                                </div>
                                <div class="mf-form-group">
                                    <label>Status</label>
                                    <select class="mf-form-control" name="status">
                                        <option>Active</option>
                                        <option>Inactive</option>
                                    </select>
                                </div>
                                <button type="submit" class="mf-btn mf-btn-success">Create User</button>
                                <button type="button" class="mf-btn mf-btn-secondary" onclick="app.navigate('/users')">
                                    Cancel
                                </button>
                            </form>
                        </div>
                    </div>
                `;
            }
        }
    },

    // Helper methods
    methods: {
        getUserById(id) {
            return this.data.users.find(user => user.id === parseInt(id));
        },

        formatUserTable(users) {
            return users.map(user => `
                <tr>
                    <td style="padding: 1rem; border-bottom: 1px solid var(--mf-border-color);">${user.id}</td>
                    <td style="padding: 1rem; border-bottom: 1px solid var(--mf-border-color);">${user.name}</td>
                    <td style="padding: 1rem; border-bottom: 1px solid var(--mf-border-color);">${user.email}</td>
                    <td style="padding: 1rem; border-bottom: 1px solid var(--mf-border-color);">
                        <span class="badge badge-${user.role.toLowerCase()}">${user.role}</span>
                    </td>
                    <td style="padding: 1rem; border-bottom: 1px solid var(--mf-border-color);">
                        <span class="badge badge-${user.status.toLowerCase()}">${user.status}</span>
                    </td>
                    <td style="padding: 1rem; border-bottom: 1px solid var(--mf-border-color);">
                        <button class="mf-btn mf-btn-info" onclick="app.navigate('/user/${user.id}')" style="margin: 0; padding: 0.25rem 0.5rem; font-size: 0.875rem;">View</button>
                    </td>
                </tr>
            `).join('');
        }
    },

    // Lifecycle hooks
    beforeMount(params, context) {
        console.log('👥 Users module preparing to mount');
    },

    afterMount(container, params, context) {
        console.log('👥 Users module mounted');
        
        // Add global form handler
        if (!window.handleCreateUser) {
            window.handleCreateUser = (event) => {
                event.preventDefault();
                const formData = new FormData(event.target);
                const data = Object.fromEntries(formData);
                
                // Generate new ID
                const maxId = Math.max(...this.data.users.map(u => u.id));
                data.id = maxId + 1;
                
                // Add to users array (in real app, would POST to API)
                this.data.users.push(data);
                
                alert(`User created successfully!\n${JSON.stringify(data, null, 2)}`);
                context.framework.navigate('/users');
            };
        }
    },

    // Main render method
    render(container, params, context) {
        const currentRoute = context.framework.getCurrentRoute();
        const userCount = this.data.users.length;
        const activeUsers = this.data.users.filter(u => u.status === 'Active').length;

        container.innerHTML = `
            <h1>👥 User Management</h1>
            <p>Current route: <code>${currentRoute}</code></p>
            <p>Module loaded from: <code>modules/users.js</code></p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0;">
                <div style="background: var(--mf-white); padding: 1.5rem; border-radius: var(--mf-border-radius); text-align: center; box-shadow: var(--mf-shadow);">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--mf-primary);">${userCount}</div>
                    <div style="color: var(--mf-secondary);">Total Users</div>
                </div>
                <div style="background: var(--mf-white); padding: 1.5rem; border-radius: var(--mf-border-radius); text-align: center; box-shadow: var(--mf-shadow);">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--mf-success);">${activeUsers}</div>
                    <div style="color: var(--mf-secondary);">Active Users</div>
                </div>
            </div>
            
            <div class="mf-card">
                <div class="mf-card-content">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="margin: 0;">User List</h3>
                        <button class="mf-btn mf-btn-primary" onclick="app.navigate('/users/create')">Add User</button>
                    </div>
                    
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: var(--mf-light);">
                                    <th style="padding: 1rem; text-align: left; border-bottom: 1px solid var(--mf-border-color);">ID</th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 1px solid var(--mf-border-color);">Name</th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 1px solid var(--mf-border-color);">Email</th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 1px solid var(--mf-border-color);">Role</th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 1px solid var(--mf-border-color);">Status</th>
                                    <th style="padding: 1rem; text-align: left; border-bottom: 1px solid var(--mf-border-color);">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.methods.formatUserTable(this.data.users)}
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="margin-top: 1rem;">
                        <button class="mf-btn mf-btn-secondary" onclick="app.navigate('/analytics')">
                            View User Analytics
                        </button>
                    </div>
                </div>
            </div>

            <style>
                .badge {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 500;
                    border-radius: 0.25rem;
                    text-transform: uppercase;
                }
                .badge-admin { background: var(--mf-danger); color: white; }
                .badge-moderator { background: var(--mf-warning); color: var(--mf-dark); }
                .badge-editor { background: var(--mf-info); color: white; }
                .badge-user { background: var(--mf-secondary); color: white; }
                .badge-active { background: var(--mf-success); color: white; }
                .badge-inactive { background: var(--mf-light); color: var(--mf-dark); border: 1px solid var(--mf-border-color); }
            </style>
        `;
    },

    // Cleanup
    destroy() {
        console.log('👥 Users module destroyed');
        // Clean up global handlers
        delete window.handleCreateUser;
    }
};