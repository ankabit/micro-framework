/**
 * Settings Module - Application configuration and preferences
 * Demonstrates form handling and local storage
 */
export default {
    name: 'settings',
    version: '1.0.0',
    description: 'Application settings and configuration module',

    // Default settings
    data: {
        settings: {
            appName: 'MicroFramework Demo',
            routerMode: 'history',
            theme: 'default',
            language: 'en',
            notifications: true,
            debugMode: false,
            autoSave: true
        }
    },

    // Helper methods
    methods: {
        loadSettings() {
            const saved = localStorage.getItem('mf-settings');
            if (saved) {
                this.data.settings = { ...this.data.settings, ...JSON.parse(saved) };
            }
        },

        saveSettings(newSettings) {
            this.data.settings = { ...this.data.settings, ...newSettings };
            localStorage.setItem('mf-settings', JSON.stringify(this.data.settings));
        },

        resetSettings() {
            localStorage.removeItem('mf-settings');
            this.loadSettings(); // Reload defaults
        }
    },

    // Route guards
    beforeEnter(to, from) {
        console.log('⚙️ Settings beforeEnter guard');
        // Could check if user has permission to access settings
        if (from && !confirm('Are you sure you want to go to settings? Any unsaved changes will be lost.')) {
            return false;
        }
        return true;
    },

    // Lifecycle hooks
    beforeMount(params, context) {
        console.log('⚙️ Settings module preparing to mount');
        this.methods.loadSettings();
    },

    afterMount(container, params, context) {
        console.log('⚙️ Settings module mounted');
        
        // Add global form handler
        if (!window.handleSettingsSubmit) {
            window.handleSettingsSubmit = (event) => {
                event.preventDefault();
                const formData = new FormData(event.target);
                const data = Object.fromEntries(formData);
                
                // Convert string checkboxes to booleans
                data.notifications = data.notifications === 'on';
                data.debugMode = data.debugMode === 'on';
                data.autoSave = data.autoSave === 'on';
                
                this.methods.saveSettings(data);
                
                alert(`Settings saved successfully!\n${JSON.stringify(data, null, 2)}`);
                
                // Apply router mode change if needed
                if (data.routerMode !== context.framework.router.config.mode) {
                    alert(`Router mode changed to ${data.routerMode}. In a real app, this would require a page reload.`);
                }
            };
        }

        if (!window.handleResetSettings) {
            window.handleResetSettings = () => {
                if (confirm('Are you sure you want to reset all settings to defaults?')) {
                    this.methods.resetSettings();
                    alert('Settings reset to defaults!');
                    // Re-render the module to show updated values
                    context.framework.loadModule('settings');
                }
            };
        }

        if (!window.handleExportSettings) {
            window.handleExportSettings = () => {
                const dataStr = JSON.stringify(this.data.settings, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'microframework-settings.json';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            };
        }
    },

    // Main render method
    render(container, params, context) {
        const currentRoute = context.framework.getCurrentRoute();
        const settings = this.data.settings;
        
        container.innerHTML = `
            <h1>⚙️ Settings</h1>
            <p>Current route: <code>${currentRoute}</code></p>
            <p>Module loaded from: <code>modules/settings.js</code></p>
            
            <div class="mf-card">
                <div class="mf-card-content">
                    <h3>Application Settings</h3>
                    <p>Configure your application preferences. Settings are automatically saved to local storage.</p>
                    
                    <form class="mf-form" onsubmit="handleSettingsSubmit(event)">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                            <div>
                                <h4 style="margin: 0 0 1rem 0; color: var(--mf-primary);">General</h4>
                                
                                <div class="mf-form-group">
                                    <label>Application Name</label>
                                    <input type="text" class="mf-form-control" value="${settings.appName}" name="appName">
                                    <small style="color: var(--mf-secondary);">The name displayed in the application header</small>
                                </div>
                                
                                <div class="mf-form-group">
                                    <label>Language</label>
                                    <select class="mf-form-control" name="language">
                                        <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
                                        <option value="es" ${settings.language === 'es' ? 'selected' : ''}>Spanish</option>
                                        <option value="fr" ${settings.language === 'fr' ? 'selected' : ''}>French</option>
                                        <option value="de" ${settings.language === 'de' ? 'selected' : ''}>German</option>
                                    </select>
                                </div>
                                
                                <div class="mf-form-group">
                                    <label>Theme</label>
                                    <select class="mf-form-control" name="theme">
                                        <option value="default" ${settings.theme === 'default' ? 'selected' : ''}>Default</option>
                                        <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                                        <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <h4 style="margin: 0 0 1rem 0; color: var(--mf-primary);">Technical</h4>
                                
                                <div class="mf-form-group">
                                    <label>Router Mode</label>
                                    <select class="mf-form-control" name="routerMode">
                                        <option value="history" ${settings.routerMode === 'history' ? 'selected' : ''}>History Mode</option>
                                        <option value="hash" ${settings.routerMode === 'hash' ? 'selected' : ''}>Hash Mode</option>
                                        <option value="hashbang" ${settings.routerMode === 'hashbang' ? 'selected' : ''}>Hash Bang Mode</option>
                                    </select>
                                    <small style="color: var(--mf-secondary);">Changes require page reload to take effect</small>
                                </div>
                                
                                <div class="mf-form-group">
                                    <label style="display: flex; align-items: center; cursor: pointer;">
                                        <input type="checkbox" name="notifications" ${settings.notifications ? 'checked' : ''} style="margin-right: 0.5rem;">
                                        Enable Notifications
                                    </label>
                                </div>
                                
                                <div class="mf-form-group">
                                    <label style="display: flex; align-items: center; cursor: pointer;">
                                        <input type="checkbox" name="debugMode" ${settings.debugMode ? 'checked' : ''} style="margin-right: 0.5rem;">
                                        Debug Mode
                                    </label>
                                    <small style="color: var(--mf-secondary);">Shows additional console logging</small>
                                </div>
                                
                                <div class="mf-form-group">
                                    <label style="display: flex; align-items: center; cursor: pointer;">
                                        <input type="checkbox" name="autoSave" ${settings.autoSave ? 'checked' : ''} style="margin-right: 0.5rem;">
                                        Auto-save Settings
                                    </label>
                                    <small style="color: var(--mf-secondary);">Automatically save changes as you type</small>
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--mf-border-color);">
                            <button type="submit" class="mf-btn mf-btn-success">Save Settings</button>
                            <button type="button" class="mf-btn mf-btn-warning" onclick="handleResetSettings()">
                                Reset to Defaults
                            </button>
                            <button type="button" class="mf-btn mf-btn-info" onclick="handleExportSettings()">
                                Export Settings
                            </button>
                            <button type="button" class="mf-btn mf-btn-secondary" onclick="app.navigate('/dashboard')">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div class="mf-card">
                <div class="mf-card-content">
                    <h3>Current Settings</h3>
                    <p>Preview of your current configuration:</p>
                    <pre style="background: var(--mf-light); padding: 1rem; border-radius: var(--mf-border-radius); overflow-x: auto; font-size: 0.875rem;">${JSON.stringify(settings, null, 2)}</pre>
                </div>
            </div>
        `;
    },

    // Cleanup
    destroy() {
        console.log('⚙️ Settings module destroyed');
        // Clean up global handlers
        delete window.handleSettingsSubmit;
        delete window.handleResetSettings;
        delete window.handleExportSettings;
    }
};