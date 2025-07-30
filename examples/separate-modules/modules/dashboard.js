/**
 * Dashboard Module - Main dashboard with metrics and overview
 * Demonstrates module with multiple routes and data handling
 */
export default {
    name: 'dashboard',
    version: '1.2.0',
    description: 'Main dashboard module with system metrics',

    // Module routes with different handler types
    routes: {
        '/dashboard': {},  // Uses module render method
        '/dashboard/stats': {
            handler: (params, context) => {
                const stats = {
                    users: Math.floor(Math.random() * 1000) + 500,
                    modules: 12,
                    performance: Math.floor(Math.random() * 20) + 80,
                    uptime: '99.9%'
                };

                context.framework.moduleContainer.innerHTML = `
                    <h1>📊 System Statistics</h1>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
                        <div style="background: var(--mf-white); padding: 2rem; border-radius: var(--mf-border-radius); text-align: center; box-shadow: var(--mf-shadow);">
                            <div style="font-size: 2.5rem; font-weight: bold; color: var(--mf-primary);">${stats.users}</div>
                            <div style="color: var(--mf-secondary);">Active Users</div>
                        </div>
                        <div style="background: var(--mf-white); padding: 2rem; border-radius: var(--mf-border-radius); text-align: center; box-shadow: var(--mf-shadow);">
                            <div style="font-size: 2.5rem; font-weight: bold; color: var(--mf-success);">${stats.modules}</div>
                            <div style="color: var(--mf-secondary);">Loaded Modules</div>
                        </div>
                        <div style="background: var(--mf-white); padding: 2rem; border-radius: var(--mf-border-radius); text-align: center; box-shadow: var(--mf-shadow);">
                            <div style="font-size: 2.5rem; font-weight: bold; color: var(--mf-info);">${stats.performance}%</div>
                            <div style="color: var(--mf-secondary);">Performance</div>
                        </div>
                        <div style="background: var(--mf-white); padding: 2rem; border-radius: var(--mf-border-radius); text-align: center; box-shadow: var(--mf-shadow);">
                            <div style="font-size: 2.5rem; font-weight: bold; color: var(--mf-success);">${stats.uptime}</div>
                            <div style="color: var(--mf-secondary);">Uptime</div>
                        </div>
                    </div>
                    <button class="mf-btn mf-btn-secondary" onclick="app.navigate('/dashboard')">
                        Back to Dashboard
                    </button>
                `;
            }
        }
    },

    // Called immediately when module is registered
    onRegister(context) {
        console.log('📊 Dashboard module registered - setting up global listeners');
        
        // Set up global event listeners that persist across route changes
        context.on('system:refresh', () => {
            console.log('Dashboard received system refresh signal');
        });
        
        // Register global keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard);
        
        // Initialize any global state
        if (!window.dashboardStats) {
            window.dashboardStats = {
                pageViews: 0,
                lastVisit: Date.now()
            };
        }
    },

    // Lifecycle hooks
    beforeMount(params, context) {
        console.log('📊 Dashboard module preparing to mount');
        // Could load data here
    },

    afterMount(container, params, context) {
        console.log('📊 Dashboard module mounted');
        // Could initialize charts or other components here
    },

    // Route guards
    beforeEnter(to, from) {
        console.log('📊 Dashboard beforeEnter guard');
        // Could check permissions here
        return true;
    },

    afterEnter(to, from) {
        console.log('📊 Dashboard afterEnter hook');
        // Could track analytics here
    },

    // Main render method
    render(container, params, context) {
        const currentRoute = context.framework.getCurrentRoute();
        
        container.innerHTML = `
            <h1>📊 Dashboard</h1>
            <p>Current route: <code>${currentRoute}</code></p>
            <p>Module loaded from: <code>modules/dashboard.js</code></p>
            
            <div class="mf-card">
                <div class="mf-card-content">
                    <h3>System Overview</h3>
                    <p>This dashboard module is loaded from a separate file, demonstrating modular architecture.</p>
                    
                    <div style="background: var(--mf-light); padding: 2rem; border-radius: var(--mf-border-radius); margin: 1rem 0;">
                        <h4>Sample Metrics</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
                            <div style="text-align: center; padding: 1rem; background: var(--mf-white); border-radius: var(--mf-border-radius);">
                                <div style="font-size: 2rem; font-weight: bold; color: var(--mf-primary);">1,234</div>
                                <div style="color: var(--mf-secondary);">Users</div>
                            </div>
                            <div style="text-align: center; padding: 1rem; background: var(--mf-white); border-radius: var(--mf-border-radius);">
                                <div style="font-size: 2rem; font-weight: bold; color: var(--mf-success);">56</div>
                                <div style="color: var(--mf-secondary);">Modules</div>
                            </div>
                            <div style="text-align: center; padding: 1rem; background: var(--mf-white); border-radius: var(--mf-border-radius);">
                                <div style="font-size: 2rem; font-weight: bold; color: var(--mf-info);">89%</div>
                                <div style="color: var(--mf-secondary);">Performance</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 2rem;">
                        <button class="mf-btn mf-btn-primary" onclick="app.navigate('/dashboard/stats')">
                            View Detailed Stats
                        </button>
                        <button class="mf-btn mf-btn-success" onclick="alert('Dashboard action executed!')">
                            Execute Action
                        </button>
                        <button class="mf-btn mf-btn-info" onclick="app.navigate('/users')">
                            View Users
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Helper methods
    handleKeyboard(event) {
        if (event.ctrlKey && event.key === 'd') {
            event.preventDefault();
            console.log('Dashboard keyboard shortcut triggered');
            // Could navigate to dashboard or refresh data
        }
    },

    // Cleanup
    destroy() {
        console.log('📊 Dashboard module destroyed');
        // Clean up global listeners added in onRegister
        document.removeEventListener('keydown', this.handleKeyboard);
        // Could clean up timers, event listeners, etc.
    }
};