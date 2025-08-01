/**
 * MicroFramework - A lightweight micro-frontend framework
 * 
 * Features:
 * - Framework-agnostic architecture
 * - SPA routing with history/hash modes
 * - Dynamic module loading with lifecycle management
 * - Event system with filtering/pipeline capabilities
 * - TypeScript support
 * 
 * @version 1.0.1
 * @author Aramics <npm@ankabit.com>
 * @license MIT
 * @homepage https://github.com/ankabit/micro-framework#readme
 */
/**
 * Centralized Event Registry - All framework events defined here
 */
const EVENTS = {
    // Framework lifecycle
    FRAMEWORK_READY: 'framework:ready',
    FRAMEWORK_DESTROYED: 'framework:destroyed',
    
    // Module events  
    MODULE_REGISTERED: 'module:registered',
    MODULE_UNREGISTERED: 'module:unregistered',
    MODULE_LOAD: 'module:load',
    MODULE_ERROR: 'module:error',
    
    // Route events
    ROUTE_REGISTERED: 'route:registered',
    ROUTE_WILL_CHANGE: 'route:will_change',
    ROUTE_CHANGE: 'route:change',
    ROUTE_ERROR: 'route:error',
    ROUTE_404: 'route:404',
    
    // UI events
    LOADING_CHANGE: 'loading:change',
    ERROR: 'error',
    
    // Container events
    CONTAINER_REINITIALIZED: 'container:reinitialized',
    CONTAINER_REMOVED: 'container:removed',
    CONTAINER_RECOVERED: 'container:recovered',
    CONTAINER_RECOVERY_FAILED: 'container:recovery_failed',
    CONTAINER_ERROR: 'container:error',
    
    // Plugin events
    PLUGIN_INSTALLED: 'plugin:installed'
};

/**
 * Event Manager - Handles centralized event emission with debugging
 */
class EventManager {
    constructor(framework, options = {}) {
        this.framework = framework;
        this.config = {
            enableLogging: options.enableLogging || false,
            logPrefix: options.logPrefix || '[Event]',
            ...options
        };
        this.eventHistory = [];
        this.maxHistorySize = 100;
    }

    /**
     * Emit an event (fire and forget - no response handling)
     * @param {string} eventName - The event name
     * @param {*} data - The event data
     * @param {string} source - The source of the event
     */
    emit(eventName, data = null, source = 'framework') {
        // Validate event name
        if (!this.isValidEvent(eventName)) {
            console.warn(`Unknown event emitted: ${eventName}`);
        }

        // Log event if enabled
        if (this.config.enableLogging) {
            console.log(`${this.config.logPrefix} EMIT ${eventName}`, data);
        }

        // Track in history
        this.addToHistory(eventName, data, source);

        // Fire and forget - no response handling
        this.framework.emitRaw(eventName, data);
    }

    /**
     * Emit an event and process data through listeners as a filter chain
     * @param {string} eventName - The event name
     * @param {*} data - The event data
     * @param {string} source - The source of the event
     * @returns {Promise<*>} - Final filtered/transformed data
     */
    async filter(eventName, data = null, source = 'framework') {
        // Validate event name
        if (!this.isValidEvent(eventName)) {
            console.warn(`Unknown event emitted: ${eventName}`);
        }

        // Log event if enabled
        if (this.config.enableLogging) {
            console.log(`${this.config.logPrefix} FILTER ${eventName}`, data);
        }

        // Track in history
        this.addToHistory(`${eventName}:filter`, data, source);

        // Process data through filter chain
        const finalData = await this.framework.filterRaw(eventName, data);

        // Log final data if enabled
        if (this.config.enableLogging) {
            console.log(`${this.config.logPrefix} FILTER RESULT ${eventName}`, finalData);
        }

        // Track final data in history
        this.addToHistory(`${eventName}:filter-result`, finalData, source);

        return finalData;
    }

    /**
     * Check if event name is registered
     */
    isValidEvent(eventName) {
        return Object.values(EVENTS).includes(eventName);
    }

    /**
     * Add event to history for debugging
     */
    addToHistory(eventName, data, source) {
        const event = {
            name: eventName,
            data,
            source,
            timestamp: Date.now(),
            time: new Date().toISOString()
        };

        this.eventHistory.push(event);
        
        // Keep history size manageable
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    /**
     * Get event history for debugging
     */
    getHistory() {
        return [...this.eventHistory];
    }

    /**
     * Get all registered event names
     */
    getEventNames() {
        return Object.values(EVENTS);
    }

    /**
     * Clear event history
     */
    clearHistory() {
        this.eventHistory = [];
    }
}

/**
 * ModuleManager - Handles module registration, loading, and lifecycle
 */
class ModuleManager {
    constructor(framework, options = {}) {
        this.framework = framework;
        this.modules = new Map();
        this.currentModule = null;
        this.config = {
            moduleBase: options.moduleBase || './modules/',
            lazy: options.lazy !== false
        };
    }

    /**
     * Register a module
     */
    registerModule(name, module) {
        if (typeof module !== 'object' || !module.render) {
            throw new Error('Module must be an object with a render method');
        }

        this.modules.set(name, {
            name,
            ...module
        });

        // Call onRegister lifecycle hook if defined
        if (module.onRegister) {
            try {
                module.onRegister(this.framework.getContext());
                console.log(`Module '${name}' onRegister hook executed`);
            } catch (error) {
                console.error(`Error in onRegister hook for module '${name}':`, error);
            }
        }

        // Auto-register routes if module defines them
        if (module.routes) {
            let routeCount = 0;
            
            if (Array.isArray(module.routes)) {
                // Legacy array format - still supported
                module.routes.forEach(routeConfig => {
                    if (typeof routeConfig === 'string') {
                        this.framework.router.registerRoute(routeConfig, { 
                            module: name,
                            handler: 'default'
                        });
                        routeCount++;
                    } else if (routeConfig.path) {
                        const options = {
                            module: name,
                            handler: routeConfig.handler || 'default',
                            ...routeConfig
                        };
                        delete options.path;
                        this.framework.router.registerRoute(routeConfig.path, options);
                        routeCount++;
                    }
                });
            } else if (typeof module.routes === 'object') {
                // New object format: { '/path': options }
                Object.entries(module.routes).forEach(([path, routeOptions]) => {
                    const normalizedOptions = this.normalizeRouteOptions(routeOptions);
                    const options = {
                        module: name,
                        ...normalizedOptions
                    };
                    
                    // If useModuleRender is true, don't provide a handler - module loading is enough
                    if (normalizedOptions.useModuleRender) {
                        delete options.useModuleRender;
                        // Don't set options.handler - module loading is sufficient
                    }
                    
                    this.framework.router.registerRoute(path, options);
                    routeCount++;
                });
            }
            
            if (routeCount > 0) {
                console.log(`Auto-registered ${routeCount} routes for module '${name}'`);
            }
        }

        this.framework.emit(EVENTS.MODULE_REGISTERED, { name, module });
        console.log(`Module '${name}' registered`);
    }

    /**
     * Normalize different route option formats into standard options object
     */
    normalizeRouteOptions(routeOptions) {
        if (typeof routeOptions === 'string') {
            // String shorthand: template string
            return { handler: routeOptions };
        } else if (typeof routeOptions === 'function') {
            // Function shorthand: handler function
            return { handler: routeOptions };
        } else if (typeof routeOptions === 'object' && routeOptions !== null) {
            // Full options object - if empty object or no handler, use module render
            if (Object.keys(routeOptions).length === 0 || !routeOptions.handler) {
                return { ...routeOptions, useModuleRender: true };
            }
            return routeOptions;
        } else {
            // Fallback to module render
            return { useModuleRender: true };
        }
    }

    /**
     * Unregister a module
     */
    unregisterModule(name) {
        const module = this.modules.get(name);
        if (module) {
            this.modules.delete(name);
            this.framework.emit(EVENTS.MODULE_UNREGISTERED, { name, module });
            console.log(`Module '${name}' unregistered`);
        }
    }

    /**
     * Load a module
     */
    async loadModule(name, params = {}) {
        this.framework.showLoading(true);

        try {
            let module = this.modules.get(name);

            // Try dynamic import if module not found
            if (!module && this.config.lazy) {
                module = await this.dynamicImport(name);
            }

            if (!module) {
                throw new Error(`Module '${name}' not found`);
            }

            // Call beforeMount hook
            if (module.beforeMount) {
                await module.beforeMount(params, this.framework.getContext());
            }

            // Destroy current module
            if (this.currentModule && this.currentModule.destroy) {
                await this.currentModule.destroy();
            }

            // Clear container and render new module
            const container = this.framework.getContainer();
            container.innerHTML = '';
            await module.render(container, params, this.framework.getContext());

            // Call afterMount hook
            if (module.afterMount) {
                await module.afterMount(container, params, this.framework.getContext());
            }

            this.currentModule = module;
            this.framework.emit(EVENTS.MODULE_LOAD, { name, module, params });
            
        } catch (error) {
            this.framework.emit(EVENTS.MODULE_ERROR, { name, error });
            this.framework.showError(`Failed to load module: ${name}`, error);
        } finally {
            this.framework.showLoading(false);
        }
    }

    /**
     * Dynamic module import
     */
    async dynamicImport(name) {
        try {
            const modulePath = `${this.config.moduleBase}${name}.js`;
            const moduleExport = await import(modulePath);
            const module = moduleExport.default || moduleExport;
            
            if (module) {
                this.registerModule(name, module);
                return this.modules.get(name);
            }
        } catch (error) {
            console.warn(`Could not dynamically import module: ${name}`, error);
        }
        return null;
    }

    /**
     * Get current module
     */
    getCurrentModule() {
        return this.currentModule;
    }

    /**
     * Get all registered modules
     */
    getModules() {
        return this.modules;
    }
}

/**
 * Router - Handles route registration, navigation, and guards
 */
class Router {
    constructor(framework, options = {}) {
        this.framework = framework;
        this.routes = new Map();
        this.currentRoute = null;
        this.config = {
            mode: options.mode || 'history',
            base: options.base || '',
            hashbang: options.hashbang || false,
            beforeEnter: options.beforeEnter || null,
            afterEnter: options.afterEnter || null,
            notFoundHandler: options.notFoundHandler || null // Custom 404 handler
        };

        // Bind methods
        this.handleRouteChange = this.handleRouteChange.bind(this);
    }

    /**
     * Initialize the router system
     */
    initialize() {
        if (this.config.mode === 'history') {
            window.addEventListener('popstate', this.handleRouteChange);
        } else {
            window.addEventListener('hashchange', this.handleRouteChange);
        }
    }

    /**
     * Handle route changes (browser back/forward)
     */
    handleRouteChange() {
        const currentPath = this.getCurrentRoute();
        this.navigate(currentPath, { skipHistory: true });
    }

    /**
     * Register a route
     */
    registerRoute(path, options = {}) {
        // Handler is required unless module is provided (then module render is used)
        if (!options.handler && !options.module) {
            throw new Error('Route must specify either a handler or module in options');
        }

        // Simplified single signature: registerRoute(path, options)
        const route = {
            path,
            exact: options.exact !== false,
            beforeEnter: options.beforeEnter,
            afterEnter: options.afterEnter,
            module: options.module || null,
            handler: options.handler || null,
            ...options
        };

        this.routes.set(path, route);
        this.framework.emit(EVENTS.ROUTE_REGISTERED, route);
        
        let description = '';
        if (route.module && route.handler) {
            description = `module '${route.module}' with handler`;
        } else if (route.module && !route.handler) {
            description = `module '${route.module}' (render only)`;
        } else if (typeof route.handler === 'function') {
            description = 'function handler';
        } else if (typeof route.handler === 'string') {
            description = 'template handler';
        }
        
        console.log(`Route '${path}' registered with ${description}`);
    }

    /**
     * Navigate to a route
     */
    async navigate(path, options = {}) {
        const route = this.findMatchingRoute(path);
        
        if (!route) {
            this.handle404(path);
            return;
        }

        // Emit will change event before any guards or handlers
        this.framework.emit(EVENTS.ROUTE_WILL_CHANGE, { 
            to: route, 
            from: this.currentRoute,
            path 
        });

        // Execute global beforeEnter guard
        if (this.config.beforeEnter) {
            const result = await this.config.beforeEnter(route, this.currentRoute);
            if (result === false) {
                return; // Navigation cancelled
            }
        }

        // Execute route-specific beforeEnter guard
        if (route.beforeEnter) {
            const result = await route.beforeEnter(route, this.currentRoute);
            if (result === false) {
                return; // Navigation cancelled
            }
        }

        // Update browser URL
        if (!options.skipHistory) {
            this.updateBrowserUrl(path);
        }

        // Handle the route based on its type
        try {
            await this.handleRoute(route);
            
            // Execute route-specific afterEnter hook
            if (route.afterEnter) {
                route.afterEnter(route, this.currentRoute);
            }

            // Execute global afterEnter hook
            if (this.config.afterEnter) {
                this.config.afterEnter(route, this.currentRoute);
            }

            this.currentRoute = route;
            this.framework.emit(EVENTS.ROUTE_CHANGE, route);
        } catch (error) {
            this.framework.emit(EVENTS.ROUTE_ERROR, { route, error });
            console.error('Navigation error:', error);
        }
    }

    /**
     * Handle a route based on its configuration
     */
    async handleRoute(route) {
        // Load module first if specified
        if (route.module) {
            await this.framework.moduleManager.loadModule(route.module, route.params);
        }

        // Execute handler if specified
        if (route.handler) {
            if (typeof route.handler === 'function') {
                // Function handler
                await route.handler(route.params, this.framework.getContext(), route);
            } else if (typeof route.handler === 'string') {
                // Template handler - render string as HTML
                this.framework.render(this.processTemplate(route.handler, route.params, this.framework.getContext()));
            }
        }
        // If no handler but module is loaded, that's fine - module.render was called during loadModule
    }

    /**
     * Process template string with basic variable substitution
     */
    processTemplate(template, params, context) {
        // Simple template processing - replace {{variable}} with values
        return template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
            if (params.hasOwnProperty(variable)) {
                return params[variable];
            }
            if (context.hasOwnProperty(variable)) {
                return context[variable];
            }
            return match; // Leave unchanged if no replacement found
        });
    }

    /**
     * Get current route
     */
    getCurrentRoute() {
        if (this.config.mode === 'history') {
            let path = window.location.pathname;
            if (this.config.base) {
                path = path.replace(new RegExp(`^${this.config.base}`), '');
            }
            return path || '/';
        } else {
            let hash = window.location.hash;
            if (this.config.hashbang && hash.startsWith('#!')) {
                return hash.substring(2) || '/';
            } else if (hash.startsWith('#')) {
                return hash.substring(1) || '/';
            }
            return '/';
        }
    }

    /**
     * Find matching route
     */
    findMatchingRoute(path) {
        // Try exact match first
        if (this.routes.has(path)) {
            return { ...this.routes.get(path), params: {} };
        }

        // Try pattern matching
        for (const [routePath, route] of this.routes) {
            const match = this.matchRoute(routePath, path);
            if (match) {
                return { ...route, params: match.params };
            }
        }

        return null;
    }

    /**
     * Match route with parameters
     */
    matchRoute(routePath, actualPath) {
        const routeParts = routePath.split('/');
        const actualParts = actualPath.split('/');

        if (routeParts.length !== actualParts.length) {
            return null;
        }

        const params = {};
        const isMatch = routeParts.every((part, index) => {
            if (part.startsWith(':')) {
                const paramName = part.substring(1);
                params[paramName] = actualParts[index];
                return true;
            }
            return part === actualParts[index];
        });

        return isMatch ? { params } : null;
    }

    /**
     * Update browser URL
     */
    updateBrowserUrl(path) {
        if (this.config.mode === 'history') {
            const fullPath = this.config.base + path;
            history.pushState({ path }, '', fullPath);
        } else {
            const hash = this.config.hashbang ? `#!${path}` : `#${path}`;
            window.location.hash = hash;
        }
    }

    /**
     * Handle 404 errors
     */
    handle404(path) {
        // Use custom 404 handler if provided
        if (this.config.notFoundHandler) {
            if (typeof this.config.notFoundHandler === 'function') {
                // Function handler - call with path and context
                this.config.notFoundHandler(path, this.framework.getContext());
            } else if (typeof this.config.notFoundHandler === 'string') {
                // String handler - render as HTML with template substitution
                const template = this.config.notFoundHandler.replace(/\{\{path\}\}/g, path);
                this.framework.render(template);
            } else if (typeof this.config.notFoundHandler === 'object' && this.config.notFoundHandler.module) {
                // Module handler - load a specific module for 404
                this.framework.moduleManager.loadModule(this.config.notFoundHandler.module, { path });
            }
        } else {
            // Default 404 handler
            this.framework.render(`
                <div class="mf-error mf-error-404">
                    <h1>404 - Page Not Found</h1>
                    <p>The route <code>${path}</code> was not found.</p>
                    <button class="mf-btn mf-btn-primary" onclick="window.MicroFramework.navigate('/')">
                        Go Home
                    </button>
                </div>
            `);
        }
        
        this.framework.emit(EVENTS.ROUTE_404, { path });
    }

    /**
     * Get all registered routes
     */
    getRoutes() {
        return this.routes;
    }

    /**
     * Destroy router
     */
    destroy() {
        window.removeEventListener('popstate', this.handleRouteChange);
        window.removeEventListener('hashchange', this.handleRouteChange);
    }
}

class MicroFramework {
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

/**
 * MicroFramework - A lightweight micro-frontend framework
 * Main entry point that exports all public APIs
 */


// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.MicroFramework = MicroFramework;
    window.MicroFramework.EVENTS = EVENTS;
}

// AMD/CommonJS support for legacy environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MicroFramework;
    module.exports.EVENTS = EVENTS;
    module.exports.EventManager = EventManager;
    module.exports.ModuleManager = ModuleManager;
    module.exports.Router = Router;
}

if (typeof define === 'function' && define.amd) {
    define(() => ({ 
        default: MicroFramework,
        MicroFramework, 
        EVENTS,
        EventManager,
        ModuleManager,
        Router
    }));
}

export { EVENTS, EventManager, MicroFramework, ModuleManager, Router, MicroFramework as default };
//# sourceMappingURL=micro-framework.esm.js.map
