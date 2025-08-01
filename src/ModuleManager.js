import { EVENTS } from './constants.js';

/**
 * ModuleManager - Handles module registration, loading, and lifecycle
 */
export class ModuleManager {
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