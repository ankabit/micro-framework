/**
 * User Detail Module - Individual user profile and management
 * Demonstrates parameter handling and dynamic content
 */
export default {
    name: 'user-detail',
    version: '1.0.0',
    description: 'User detail module for individual user profiles',

    // Sample user data (in real app, would come from API)
    data: {
        users: [
            { id: 1, name: 'John Doe', email: 'john.doe@company.io', role: 'Admin', status: 'Active', joinDate: '2023-01-15', lastLogin: '2024-01-20' },
            { id: 2, name: 'Jane Smith', email: 'jane.smith@company.io', role: 'User', status: 'Active', joinDate: '2023-03-22', lastLogin: '2024-01-19' },
            { id: 3, name: 'Mike Johnson', email: 'mike.johnson@company.io', role: 'Editor', status: 'Inactive', joinDate: '2023-06-10', lastLogin: '2023-12-15' },
            { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@company.io', role: 'User', status: 'Active', joinDate: '2023-08-05', lastLogin: '2024-01-21' },
            { id: 5, name: 'Tom Brown', email: 'tom.brown@company.io', role: 'Moderator', status: 'Active', joinDate: '2023-09-18', lastLogin: '2024-01-18' }
        ]
    },

    // Helper methods
    methods: {
        getUserById(id) {
            return this.data.users.find(user => user.id === parseInt(id)) || {
                id: id,
                name: `User ${id}`,
                email: `user${id}@company.io`,
                role: 'User',
                status: 'Unknown',
                joinDate: '2024-01-01',
                lastLogin: 'Never'
            };
        },

        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },

        getRoleColor(role) {
            const colors = {
                'Admin': 'var(--mf-danger)',
                'Moderator': 'var(--mf-warning)',
                'Editor': 'var(--mf-info)',
                'User': 'var(--mf-secondary)'
            };
            return colors[role] || 'var(--mf-secondary)';
        },

        getStatusColor(status) {
            const colors = {
                'Active': 'var(--mf-success)',
                'Inactive': 'var(--mf-secondary)',
                'Unknown': 'var(--mf-warning)'
            };
            return colors[status] || 'var(--mf-secondary)';
        }
    },

    // Route guards
    beforeEnter(to, from) {
        console.log('👤 User detail beforeEnter guard');
        // Could validate user ID exists here
        return true;
    },

    // Lifecycle hooks
    beforeMount(params, context) {
        console.log(`👤 User detail module preparing to mount for user ${params.id}`);
    },

    afterMount(container, params, context) {
        console.log(`👤 User detail module mounted for user ${params.id}`);
        
        // Add global handler for user actions
        if (!window.handleUserAction) {
            window.handleUserAction = (action, userId) => {
                const user = this.methods.getUserById(userId);
                switch(action) {
                    case 'edit':
                        alert(`Edit user: ${user.name}\n\nIn a real app, this would open an edit form.`);
                        break;
                    case 'delete':
                        if (confirm(`Are you sure you want to delete user: ${user.name}?`)) {
                            alert(`User ${user.name} would be deleted in a real app.`);
                        }
                        break;
                    case 'toggle-status':
                        const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
                        alert(`User ${user.name} status would change to: ${newStatus}`);
                        break;
                    default:
                        alert(`Unknown action: ${action}`);
                }
            };
        }
    },

    // Main render method
    render(container, params, context) {
        const userId = params.id || 'unknown';
        const user = this.methods.getUserById(userId);
        const currentRoute = context.framework.getCurrentRoute();
        
        container.innerHTML = `
            <h1>👤 User Profile</h1>
            <p>Current route: <code>${currentRoute}</code></p>
            <p>User ID parameter: <code>${userId}</code></p>
            <p>Module loaded from: <code>modules/user-detail.js</code></p>
            
            <div class="mf-card">
                <div class="mf-card-content">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h3 style="margin: 0;">User Information</h3>
                        <div>
                            <span style="background: ${this.methods.getRoleColor(user.role)}; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem; margin-right: 0.5rem;">
                                ${user.role}
                            </span>
                            <span style="background: ${this.methods.getStatusColor(user.status)}; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem;">
                                ${user.status}
                            </span>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                        <div>
                            <h4 style="margin: 0 0 1rem 0; color: var(--mf-primary);">Basic Information</h4>
                            
                            <div class="mf-form-group">
                                <label>Full Name</label>
                                <div style="padding: 0.75rem; background: var(--mf-light); border-radius: var(--mf-border-radius); font-weight: 500;">
                                    ${user.name}
                                </div>
                            </div>
                            
                            <div class="mf-form-group">
                                <label>Email Address</label>
                                <div style="padding: 0.75rem; background: var(--mf-light); border-radius: var(--mf-border-radius);">
                                    ${user.email}
                                </div>
                            </div>
                            
                            <div class="mf-form-group">
                                <label>User ID</label>
                                <div style="padding: 0.75rem; background: var(--mf-light); border-radius: var(--mf-border-radius);">
                                    ${user.id}
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 style="margin: 0 0 1rem 0; color: var(--mf-primary);">Account Details</h4>
                            
                            <div class="mf-form-group">
                                <label>Role</label>
                                <div style="padding: 0.75rem; background: var(--mf-light); border-radius: var(--mf-border-radius);">
                                    ${user.role}
                                </div>
                            </div>
                            
                            <div class="mf-form-group">
                                <label>Status</label>
                                <div style="padding: 0.75rem; background: var(--mf-light); border-radius: var(--mf-border-radius);">
                                    ${user.status}
                                </div>
                            </div>
                            
                            <div class="mf-form-group">
                                <label>Join Date</label>
                                <div style="padding: 0.75rem; background: var(--mf-light); border-radius: var(--mf-border-radius);">
                                    ${this.methods.formatDate(user.joinDate)}
                                </div>
                            </div>
                            
                            <div class="mf-form-group">
                                <label>Last Login</label>
                                <div style="padding: 0.75rem; background: var(--mf-light); border-radius: var(--mf-border-radius);">
                                    ${user.lastLogin === 'Never' ? user.lastLogin : this.methods.formatDate(user.lastLogin)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--mf-border-color);">
                        <h4 style="margin: 0 0 1rem 0;">Actions</h4>
                        <button class="mf-btn mf-btn-primary" onclick="handleUserAction('edit', ${user.id})">
                            Edit User
                        </button>
                        <button class="mf-btn mf-btn-info" onclick="handleUserAction('toggle-status', ${user.id})">
                            Toggle Status
                        </button>
                        <button class="mf-btn mf-btn-danger" onclick="handleUserAction('delete', ${user.id})">
                            Delete User
                        </button>
                        <button class="mf-btn mf-btn-secondary" onclick="app.navigate('/users')">
                            Back to Users
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Cleanup
    destroy() {
        console.log('👤 User detail module destroyed');
        // Clean up global handlers
        delete window.handleUserAction;
    }
};