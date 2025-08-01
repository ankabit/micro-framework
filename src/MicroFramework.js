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
        this.containerObserver = null; // MutationObserver for container changes

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
     * Validate if the current moduleContainer is still connected to the DOM
     */
    isContainerValid() {
        return this.moduleContainer && 
               this.moduleContainer.isConnected && 
               document.contains(this.moduleContainer);
    }

    /**
     * Get the container, re-initializing if necessary
     */
    getContainer() {
        if (!this.isContainerValid()) {
            console.warn('Container is stale, attempting to re-initialize...');
            try {
                this.initializeContainer();
                this.emit(EVENTS.CONTAINER_REINITIALIZED);
            } catch (error) {
                console.error('Failed to re-initialize container:', error);
                this.emit(EVENTS.CONTAINER_ERROR, error);
                throw error;
            }
        }
        return this.moduleContainer;
    }

    /**
     * Render content to the container
     */
    render(content) {
        const container = this.getContainer();
        if (typeof content === 'string') {
            container.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            container.innerHTML = '';
            container.appendChild(content);
        } else if (typeof content === 'function') {
            container.innerHTML = '';
            content(container);
        }
    }

    /**
     * Initialize the module container and optional loading spinner
     */
    initializeContainer() {
        // Clean up existing observer
        if (this.containerObserver) {
            this.containerObserver.disconnect();
            this.containerObserver = null;
        }

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

        // Set up container monitoring
        this.setupContainerObserver();
    }

    /**
     * Set up MutationObserver to detect container removal/changes
     */
    setupContainerObserver() {
        if (!this.moduleContainer || !this.moduleContainer.parentNode) {
            return;
        }

        this.containerObserver = new MutationObserver((mutations) => {
            let containerRemoved = false;
            
            for (const mutation of mutations) {
                // Check if our container was removed
                for (const removedNode of mutation.removedNodes) {
                    if (removedNode === this.moduleContainer || 
                        (removedNode.contains && removedNode.contains(this.moduleContainer))) {
                        containerRemoved = true;
                        break;
                    }
                }
                if (containerRemoved) break;
            }

            if (containerRemoved) {
                console.warn('Container was removed from DOM');
                this.emit(EVENTS.CONTAINER_REMOVED);
                this.moduleContainer = null;
                
                // Attempt to recover if framework is still started
                if (this.isStarted) {
                    setTimeout(() => this.attemptContainerRecovery(), 100);
                }
            }
        });

        // Observe the parent node for child list changes
        this.containerObserver.observe(this.moduleContainer.parentNode, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Attempt to recover from container removal
     */
    attemptContainerRecovery() {
        try {
            console.log('Attempting container recovery...');
            this.initializeContainer();
            
            // Re-render current module if one exists
            const currentModule = this.moduleManager.getCurrentModule();
            if (currentModule && currentModule.render) {
                console.log('Re-rendering current module after container recovery');
                currentModule.render(this.moduleContainer);
            }
            
            this.emit(EVENTS.CONTAINER_RECOVERED);
        } catch (error) {
            console.error('Container recovery failed:', error);
            this.emit(EVENTS.CONTAINER_RECOVERY_FAILED, error);
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
        try {
            this.render(`
                <div class="mf-error">
                    <h1>Error</h1>
                    <p>${message}</p>
                    ${error ? `<pre>${error.message}</pre>` : ''}
                    <button class="mf-btn mf-btn-primary" onclick="location.reload()">
                        Reload
                    </button>
                </div>
            `);
        } catch (containerError) {
            console.error('Failed to show error in container:', containerError);
            console.error('Original error:', message, error);
            // Fallback: try to show error in document body or create alert
            this.showFallbackError(message, error);
        }
        this.emit(EVENTS.ERROR, { message, error });
    }

    /**
     * Fallback error display when container is unavailable
     */
    showFallbackError(message, error = null) {
        const errorHtml = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: #f8d7da; color: #721c24; padding: 20px; border: 1px solid #f5c6cb; 
                        border-radius: 4px; z-index: 10000; max-width: 500px;">
                <h2>MicroFramework Error</h2>
                <p><strong>Container Error:</strong> ${message}</p>
                ${error ? `<pre style="background: #f1f1f1; padding: 10px; border-radius: 3px;">${error.message}</pre>` : ''}
                <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; 
                        background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">
                    Reload Page
                </button>
            </div>
        `;
        
        // Try to append to body
        if (document.body) {
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = errorHtml;
            document.body.appendChild(errorDiv);
        } else {
            // Ultimate fallback
            alert(`MicroFramework Error: ${message}${error ? '\n\n' + error.message : ''}`);
        }
    }

    /**
     * Get context object for modules
     */
    getContext() {
        return {
            framework: this,
            navigate: this.navigate.bind(this),
            render: this.render.bind(this),
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

        // Disconnect container observer
        if (this.containerObserver) {
            this.containerObserver.disconnect();
            this.containerObserver = null;
        }

        // Destroy current module
        const currentModule = this.moduleManager.getCurrentModule();
        if (currentModule && currentModule.destroy) {
            currentModule.destroy();
        }

        // Clear container
        try {
            this.render('');
        } catch (error) {
            // Container already invalid during destroy, which is expected
            console.log('Container not available during destroy - this is normal');
        }

        // Clear references
        this.eventListeners.clear();
        this.moduleContainer = null;
        this.loadingSpinner = null;

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