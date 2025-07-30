import { EVENTS } from './constants.js';
import { EventManager } from './EventManager.js';
import { ModuleManager } from './ModuleManager.js';
import { Router } from './Router.js';

export class MicroFramework {
    constructor(options = {}) {
        // Configuration
        this.config = {
            container: options.container || '#app',
            loadingSpinner: options.loadingSpinner || null, // Optional loading spinner element/selector
            ...options
        };

        // Initialize event system first
        this.eventListeners = new Map();
        this.eventManager = new EventManager(this, {
            enableLogging: options.enableEventLogging || false,
            logPrefix: options.eventLogPrefix || '[MicroFramework Event]'
        });

        // Initialize subcomponents
        this.moduleManager = new ModuleManager(this, {
            moduleBase: options.moduleBase,
            lazy: options.lazy
        });

        this.router = new Router(this, {
            mode: options.router?.mode || options.mode || 'history',
            base: options.router?.base || options.base || '',
            hashbang: options.router?.hashbang || options.hashbang || false,
            beforeEnter: options.router?.beforeEnter || null,
            afterEnter: options.router?.afterEnter || null,
            notFoundHandler: options.router?.notFoundHandler || options.notFoundHandler || null
        });
        
        // DOM elements
        this.moduleContainer = null;  // Where modules render
        this.loadingSpinner = null;   // Optional loading spinner

        // State
        this.isStarted = false;
        this.isLoading = false;

        // Bind methods
        this.handleLinkClick = this.handleLinkClick.bind(this);
    }

    /**
     * Initialize and start the framework
     */
    start() {
        if (this.isStarted) {
            console.warn('MicroFramework already started');
            return;
        }

        this.initializeContainer();
        this.router.initialize();
        this.setupEventListeners();
        this.handleInitialRoute();
        
        this.isStarted = true;
        this.emit(EVENTS.FRAMEWORK_READY);
        
        console.log('🚀 MicroFramework started');
    }

    /**
     * Initialize the module container and optional loading spinner
     */
    initializeContainer() {
        // Get module container
        if (typeof this.config.container === 'string') {
            this.moduleContainer = document.querySelector(this.config.container);
        } else {
            this.moduleContainer = this.config.container;
        }

        if (!this.moduleContainer) {
            throw new Error('Module container not found');
        }

        // Get optional loading spinner
        if (this.config.loadingSpinner) {
            if (typeof this.config.loadingSpinner === 'string') {
                this.loadingSpinner = document.querySelector(this.config.loadingSpinner);
            } else {
                this.loadingSpinner = this.config.loadingSpinner;
            }
        }
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Handle navigation clicks
        document.addEventListener('click', this.handleLinkClick);
    }

    /**
     * Handle link clicks for navigation
     */
    handleLinkClick(event) {
        const link = event.target.closest('[data-route]');
        if (link) {
            event.preventDefault();
            const route = link.dataset.route;
            this.router.navigate(route);
        }
    }

    /**
     * Handle initial route on startup
     */
    handleInitialRoute() {
        const initialPath = this.router.getCurrentRoute();
        this.router.navigate(initialPath, { skipHistory: true });
    }

    /**
     * Register a module
     */
    registerModule(name, module) {
        return this.moduleManager.registerModule(name, module);
    }

    /**
     * Unregister a module
     */
    unregisterModule(name) {
        return this.moduleManager.unregisterModule(name);
    }

    /**
     * Register a route
     */
    registerRoute(path, options = {}) {
        return this.router.registerRoute(path, options);
    }

    /**
     * Navigate to a route
     */
    async navigate(path, options = {}) {
        return this.router.navigate(path, options);
    }

    /**
     * Load a module
     */
    async loadModule(name, params = {}) {
        return this.moduleManager.loadModule(name, params);
    }

    /**
     * Get current route
     */
    getCurrentRoute() {
        return this.router.getCurrentRoute();
    }

    // Getter properties for backward compatibility
    get modules() {
        return this.moduleManager.getModules();
    }

    get routes() {
        return this.router.getRoutes();
    }

    get currentModule() {
        return this.moduleManager.getCurrentModule();
    }

    get currentRoute() {
        return this.router.currentRoute;
    }

    /**
     * Show loading state
     */
    showLoading(show) {
        this.isLoading = show;
        
        // Only manipulate spinner if one is configured
        if (this.loadingSpinner) {
            this.loadingSpinner.style.display = show ? 'flex' : 'none';
        }
        
        // Always emit the event
        this.emit(EVENTS.LOADING_CHANGE, show);
    }

    /**
     * Show error message
     */
    showError(message, error = null) {
        this.moduleContainer.innerHTML = `
            <div class="mf-error">
                <h1>Error</h1>
                <p>${message}</p>
                ${error ? `<pre>${error.message}</pre>` : ''}
                <button class="mf-btn mf-btn-primary" onclick="location.reload()">
                    Reload
                </button>
            </div>
        `;
        this.emit(EVENTS.ERROR, { message, error });
    }

    /**
     * Get context object for modules
     */
    getContext() {
        return {
            framework: this,
            navigate: this.navigate.bind(this),
            emit: this.emit.bind(this),
            filter: this.filter.bind(this),
            on: this.on.bind(this),
            off: this.off.bind(this)
        };
    }

    /**
     * Event system - Add listener
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Event system - Remove listener
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Event system - Emit event (fire and forget)
     * @param {string} event - The event name
     * @param {*} data - The event data
     */
    emit(event, data = null) {
        this.eventManager.emit(event, data, 'framework');
    }

    /**
     * Event system - Filter data through listeners sequentially
     * @param {string} event - The event name
     * @param {*} data - The event data
     * @returns {Promise<*>} - Final filtered/transformed data
     */
    async filter(event, data = null) {
        return await this.eventManager.filter(event, data, 'framework');
    }

    /**
     * Event system - Raw emit (used by EventManager)
     */
    emitRaw(event, data = null) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for '${event}':`, error);
                }
            });
        }
    }

    /**
     * Event system - Filter that processes data through listeners sequentially
     */
    async filterRaw(event, data = null) {
        if (!this.eventListeners.has(event)) {
            return data; // No listeners, return original data
        }

        const listeners = this.eventListeners.get(event);
        let currentData = data;

        // Process listeners sequentially
        for (const callback of listeners) {
            try {
                const result = callback(currentData);
                
                // Check if the result is a Promise (async)
                if (result && typeof result.then === 'function') {
                    currentData = await result;
                } else {
                    currentData = result;
                }

                // If listener returns undefined, keep current data unchanged
                if (currentData === undefined) {
                    currentData = data;
                }
            } catch (error) {
                console.error(`Error in filter listener for '${event}':`, error);
                // On error, continue with current data
            }
        }

        return currentData;
    }

    /**
     * Plugin system - Use plugin
     */
    use(plugin) {
        if (typeof plugin.install === 'function') {
            plugin.install(this);
            this.emit(EVENTS.PLUGIN_INSTALLED, plugin);
        } else {
            console.warn('Plugin must have an install method');
        }
    }

    /**
     * Destroy the framework
     */
    destroy() {
        // Remove event listeners
        this.router.destroy();
        document.removeEventListener('click', this.handleLinkClick);

        // Destroy current module
        const currentModule = this.moduleManager.getCurrentModule();
        if (currentModule && currentModule.destroy) {
            currentModule.destroy();
        }

        // Clear container
        if (this.container) {
            this.container.innerHTML = '';
        }

        // Clear references
        this.eventListeners.clear();

        this.isStarted = false;
        this.emit(EVENTS.FRAMEWORK_DESTROYED);
    }

    // Expose debugging methods
    getEventHistory() {
        return this.eventManager.getHistory();
    }

    clearEventHistory() {
        this.eventManager.clearHistory();
    }

    getEventNames() {
        return this.eventManager.getEventNames();
    }
}