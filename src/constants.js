/**
 * Centralized Event Registry - All framework events defined here
 */
export const EVENTS = {
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