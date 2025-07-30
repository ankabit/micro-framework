import { EVENTS } from './constants.js';

/**
 * Router - Handles route registration, navigation, and guards
 */
export class Router {
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
                this.framework.moduleContainer.innerHTML = this.processTemplate(route.handler, route.params, this.framework.getContext());
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
                this.framework.moduleContainer.innerHTML = template;
            } else if (typeof this.config.notFoundHandler === 'object' && this.config.notFoundHandler.module) {
                // Module handler - load a specific module for 404
                this.framework.moduleManager.loadModule(this.config.notFoundHandler.module, { path });
            }
        } else {
            // Default 404 handler
            this.framework.moduleContainer.innerHTML = `
                <div class="mf-error mf-error-404">
                    <h1>404 - Page Not Found</h1>
                    <p>The route <code>${path}</code> was not found.</p>
                    <button class="mf-btn mf-btn-primary" onclick="window.MicroFramework.navigate('/')">
                        Go Home
                    </button>
                </div>
            `;
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