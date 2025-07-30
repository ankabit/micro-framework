/**
 * Dashboard Module Example
 * Demonstrates a complete module with lifecycle hooks
 */

export default {
    name: 'dashboard',
    
    // Module metadata
    version: '1.0.0',
    description: 'Main dashboard with system overview',
    
    // Lifecycle hooks
    beforeMount(params, context) {
        console.log('Dashboard: beforeMount hook called');
        // Initialize data, setup listeners, etc.
        this.data = {
            metrics: {
                users: Math.floor(Math.random() * 10000),
                modules: Math.floor(Math.random() * 100),
                performance: Math.floor(Math.random() * 40 + 60) // 60-100%
            }
        };
    },
    
    render(container, params, context) {
        const { metrics } = this.data;
        
        container.innerHTML = `
            <div class="dashboard-header">
                <h1>📊 Dashboard</h1>
                <p class="mf-text-muted">Welcome back! Here's what's happening with your application.</p>
            </div>
            
            <!-- Metrics Cards -->
            <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
                <div class="metric-card mf-card">
                    <div class="mf-card-content mf-text-center">
                        <div class="metric-value" style="font-size: 3rem; font-weight: bold; color: var(--mf-primary);">
                            ${metrics.users.toLocaleString()}
                        </div>
                        <div class="metric-label mf-text-muted">Total Users</div>
                        <div class="metric-change" style="color: var(--mf-success); font-size: 0.875rem; margin-top: 0.5rem;">
                            ↗ +12% from last month
                        </div>
                    </div>
                </div>
                
                <div class="metric-card mf-card">
                    <div class="mf-card-content mf-text-center">
                        <div class="metric-value" style="font-size: 3rem; font-weight: bold; color: var(--mf-success);">
                            ${metrics.modules}
                        </div>
                        <div class="metric-label mf-text-muted">Active Modules</div>
                        <div class="metric-change" style="color: var(--mf-success); font-size: 0.875rem; margin-top: 0.5rem;">
                            ↗ +3 new this week
                        </div>
                    </div>
                </div>
                
                <div class="metric-card mf-card">
                    <div class="mf-card-content mf-text-center">
                        <div class="metric-value" style="font-size: 3rem; font-weight: bold; color: var(--mf-info);">
                            ${metrics.performance}%
                        </div>
                        <div class="metric-label mf-text-muted">Performance Score</div>
                        <div class="metric-change" style="color: ${metrics.performance > 90 ? 'var(--mf-success)' : 'var(--mf-warning)'}; font-size: 0.875rem; margin-top: 0.5rem;">
                            ${metrics.performance > 90 ? '✓ Excellent' : '⚠ Good'}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="mf-card">
                <div class="mf-card-content">
                    <h3>Quick Actions</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem;">
                        <button class="mf-btn mf-btn-primary" onclick="dashboard.refreshMetrics()">
                            🔄 Refresh Metrics
                        </button>
                        <button class="mf-btn mf-btn-info" onclick="context.navigate('/users')">
                            👥 Manage Users
                        </button>
                        <button class="mf-btn mf-btn-success" onclick="context.navigate('/analytics')">
                            📈 View Analytics
                        </button>
                        <button class="mf-btn mf-btn-warning" onclick="dashboard.exportData()">
                            📊 Export Data
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Recent Activity -->
            <div class="mf-card">
                <div class="mf-card-content">
                    <h3>Recent Activity</h3>
                    <div class="activity-list" style="margin-top: 1rem;">
                        <div class="activity-item" style="display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid var(--mf-border-color);">
                            <div class="activity-icon" style="width: 40px; height: 40px; background: var(--mf-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 1rem;">
                                👤
                            </div>
                            <div class="activity-content" style="flex: 1;">
                                <div class="activity-title">New user registered</div>
                                <div class="activity-time mf-text-muted" style="font-size: 0.875rem;">2 minutes ago</div>
                            </div>
                        </div>
                        
                        <div class="activity-item" style="display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid var(--mf-border-color);">
                            <div class="activity-icon" style="width: 40px; height: 40px; background: var(--mf-success); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 1rem;">
                                ✅
                            </div>
                            <div class="activity-content" style="flex: 1;">
                                <div class="activity-title">Module updated successfully</div>
                                <div class="activity-time mf-text-muted" style="font-size: 0.875rem;">15 minutes ago</div>
                            </div>
                        </div>
                        
                        <div class="activity-item" style="display: flex; align-items: center; padding: 1rem;">
                            <div class="activity-icon" style="width: 40px; height: 40px; background: var(--mf-info); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 1rem;">
                                📊
                            </div>
                            <div class="activity-content" style="flex: 1;">
                                <div class="activity-title">Analytics report generated</div>
                                <div class="activity-time mf-text-muted" style="font-size: 0.875rem;">1 hour ago</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Make module methods available globally for button clicks
        window.dashboard = this;
    },
    
    afterMount(container, params, context) {
        console.log('Dashboard: afterMount hook called');
        // Setup any post-render functionality
        this.setupAutoRefresh();
    },
    
    // Custom methods
    setupAutoRefresh() {
        // Auto-refresh metrics every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.refreshMetrics();
        }, 30000);
    },
    
    refreshMetrics() {
        // Simulate API call
        console.log('Refreshing dashboard metrics...');
        
        this.data.metrics = {
            users: Math.floor(Math.random() * 10000),
            modules: Math.floor(Math.random() * 100),
            performance: Math.floor(Math.random() * 40 + 60)
        };
        
        // Update the displayed values
        const metricValues = document.querySelectorAll('.metric-value');
        if (metricValues.length >= 3) {
            metricValues[0].textContent = this.data.metrics.users.toLocaleString();
            metricValues[1].textContent = this.data.metrics.modules;
            metricValues[2].textContent = this.data.metrics.performance + '%';
        }
        
        // Show success message
        this.showNotification('Metrics refreshed successfully!', 'success');
    },
    
    exportData() {
        console.log('Exporting dashboard data...');
        
        const data = {
            timestamp: new Date().toISOString(),
            metrics: this.data.metrics,
            activities: [
                { type: 'user_registration', time: '2 minutes ago' },
                { type: 'module_update', time: '15 minutes ago' },
                { type: 'report_generation', time: '1 hour ago' }
            ]
        };
        
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!', 'info');
    },
    
    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `mf-alert mf-alert-${type}`;
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    },
    
    // Cleanup when module is destroyed
    destroy() {
        console.log('Dashboard: destroy hook called');
        
        // Clear intervals
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Remove global references
        delete window.dashboard;
        
        // Clean up any event listeners, etc.
    },
    
    // Route guards
    beforeEnter(to, from) {
        console.log('Dashboard: beforeEnter guard');
        // You can add authentication checks here
        return true; // Allow navigation
    },
    
    afterEnter(to, from) {
        console.log('Dashboard: afterEnter hook');
        // Track page view, update breadcrumbs, etc.
    }
};
