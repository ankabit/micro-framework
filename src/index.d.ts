/**
 * MicroFramework TypeScript Definitions - Main Entry Point
 */

import type {
    RouterConfig,
    ModuleManagerConfig,
    MicroFrameworkConfig,
    Module,
    ModuleInstance,
    RouteHandler,
    RouteOptions,
    RouteDefinition,
    RouteMap,
    Route,
    RouteParams,
    ModuleContext,
    ModuleError,
    EventCallback,
    Plugin,
    EventHistoryEntry,
    FrameworkEvents,
    EventName,
    EventData,
    RouteGuard,
    ModuleLoader,
    ThemeConfig
} from './types.js';

// Event constants
export declare const EVENTS: {
    readonly FRAMEWORK_READY: 'framework:ready';
    readonly FRAMEWORK_DESTROYED: 'framework:destroyed';
    readonly MODULE_REGISTERED: 'module:registered';
    readonly MODULE_UNREGISTERED: 'module:unregistered';
    readonly MODULE_LOAD: 'module:load';
    readonly MODULE_ERROR: 'module:error';
    readonly ROUTE_REGISTERED: 'route:registered';
    readonly ROUTE_CHANGE: 'route:change';
    readonly ROUTE_ERROR: 'route:error';
    readonly ROUTE_404: 'route:404';
    readonly LOADING_CHANGE: 'loading:change';
    readonly ERROR: 'error';
    readonly PLUGIN_INSTALLED: 'plugin:installed';
};

// EventManager class
export declare class EventManager {
    constructor(framework: MicroFramework, options?: any);
    emit(eventName: string, data?: any, source?: string): void;
    filter(eventName: string, data?: any, source?: string): Promise<any>;
    isValidEvent(eventName: string): boolean;
    addToHistory(eventName: string, data: any, source: string): void;
    getHistory(): EventHistoryEntry[];
    getEventNames(): string[];
    clearHistory(): void;
}

// ModuleManager class
export declare class ModuleManager {
    constructor(framework: MicroFramework, options?: ModuleManagerConfig);
    registerModule(name: string, module: Module): void;
    unregisterModule(name: string): void;
    loadModule(name: string, params?: RouteParams): Promise<void>;
    normalizeRouteOptions(routeOptions: any): any;
    dynamicImport(name: string): Promise<ModuleInstance | null>;
    getCurrentModule(): ModuleInstance | null;
    getModules(): Map<string, ModuleInstance>;
}

// Router class
export declare class Router {
    constructor(framework: MicroFramework, options?: RouterConfig);
    readonly currentRoute: Route | null;
    initialize(): void;
    handleRouteChange(): void;
    registerRoute(path: string, options?: RouteOptions): void;
    navigate(path: string, options?: { skipHistory?: boolean }): Promise<void>;
    handleRoute(route: Route): Promise<void>;
    processTemplate(template: string, params: RouteParams, context: ModuleContext): string;
    getCurrentRoute(): string;
    findMatchingRoute(path: string): Route | null;
    matchRoute(routePath: string, actualPath: string): { params: RouteParams } | null;
    updateBrowserUrl(path: string): void;
    handle404(path: string): void;
    getRoutes(): Map<string, Route>;
    destroy(): void;
}

// Main MicroFramework class
export declare class MicroFramework {
    constructor(options?: MicroFrameworkConfig);
    
    // Subclass instances
    readonly moduleManager: ModuleManager;
    readonly router: Router;
    readonly eventManager: EventManager;
    
    // Core methods
    start(): void;
    destroy(): void;
    
    // Module management (delegates to moduleManager)
    registerModule(name: string, module: Module): void;
    unregisterModule(name: string): void;
    loadModule(name: string, params?: RouteParams): Promise<void>;
    
    // Routing (delegates to router)
    registerRoute(path: string, options?: RouteOptions): void;
    navigate(path: string, options?: { skipHistory?: boolean }): Promise<void>;
    getCurrentRoute(): string;
    
    // Event system
    on(event: string, callback: EventCallback): void;
    off(event: string, callback: EventCallback): void;
    emit(event: string, data?: any): void;
    filter(event: string, data?: any): Promise<any>;
    emitRaw(event: string, data?: any): void;
    filterRaw(event: string, data?: any): Promise<any>;
    
    // Event debugging
    getEventHistory(): EventHistoryEntry[];
    clearEventHistory(): void;
    getEventNames(): string[];
    
    // Plugin system
    use(plugin: Plugin): void;
    
    // Utility methods
    showLoading(show: boolean): void;
    showError(message: string, error?: Error): void;
    getContext(): ModuleContext;
    initializeContainer(): void;
    setupEventListeners(): void;
    handleLinkClick(event: Event): void;
    handleInitialRoute(): void;
    
    // Internal properties (read-only)
    readonly config: MicroFrameworkConfig;
    readonly modules: Map<string, ModuleInstance>;
    readonly routes: Map<string, Route>;
    readonly currentModule: ModuleInstance | null;
    readonly currentRoute: Route | null;
    readonly isStarted: boolean;
    readonly isLoading: boolean;
}

// Global declarations
declare global {
    interface Window {
        MicroFramework: typeof MicroFramework;
    }
}

// Default export
declare const _default: typeof MicroFramework;
export default _default;

// Named exports
export {
    MicroFramework,
    EventManager,
    ModuleManager,
    Router
};

// Re-export types
export type {
    RouterConfig,
    ModuleManagerConfig,
    MicroFrameworkConfig,
    Module,
    ModuleInstance,
    RouteHandler,
    RouteOptions,
    RouteDefinition,
    RouteMap,
    Route,
    RouteParams,
    ModuleContext,
    ModuleError,
    EventCallback,
    Plugin,
    EventHistoryEntry,
    FrameworkEvents,
    EventName,
    EventData,
    RouteGuard,
    ModuleLoader,
    ThemeConfig
};