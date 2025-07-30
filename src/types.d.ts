/**
 * MicroFramework TypeScript Definitions
 * Provides full type safety for the framework
 */

export interface RouterConfig {
    mode?: 'history' | 'hash' | 'hashbang';
    base?: string;
    hashbang?: boolean;
    beforeEnter?: (to: Route, from: Route | null) => boolean | Promise<boolean>;
    afterEnter?: (to: Route, from: Route | null) => void | Promise<void>;
    notFoundHandler?: NotFoundHandler;
}

export interface ModuleManagerConfig {
    moduleBase?: string;
    lazy?: boolean;
}

export interface MicroFrameworkConfig {
    container?: string | HTMLElement;
    loadingSpinner?: string | HTMLElement;
    router?: RouterConfig;
    // Legacy router options (for backward compatibility)
    mode?: 'history' | 'hash' | 'hashbang';
    base?: string;
    hashbang?: boolean;
    notFoundHandler?: NotFoundHandler; // Custom 404 handler
    moduleBase?: string;
    lazy?: boolean;
    // Event system configuration
    enableEventLogging?: boolean;
    eventLogPrefix?: string;
    onBeforeRouteChange?: (to: Route, from: Route | null) => boolean | void;
    onAfterRouteChange?: (to: Route, from: Route | null) => void;
    onModuleLoad?: (module: ModuleInstance) => void;
    onModuleError?: (error: ModuleError) => void;
}

export interface Module {
    name: string;
    version?: string;
    description?: string;
    routes?: (string | RouteDefinition)[] | RouteMap;
    render: (container: HTMLElement, params: RouteParams, context: ModuleContext) => void | Promise<void>;
    onRegister?: (context: ModuleContext) => void | Promise<void>;
    beforeMount?: (params: RouteParams, context: ModuleContext) => void | Promise<void>;
    afterMount?: (container: HTMLElement, params: RouteParams, context: ModuleContext) => void | Promise<void>;
    destroy?: () => void | Promise<void>;
    beforeEnter?: (to: Route, from: Route | null) => boolean | Promise<boolean>;
    afterEnter?: (to: Route, from: Route | null) => void | Promise<void>;
}

export interface ModuleInstance extends Module {
    [key: string]: any;
}

export type RouteHandler = (params: RouteParams, context: ModuleContext, route: Route) => void | Promise<void>;

export interface RouteOptions {
    handler?: RouteHandler | string;
    module?: string;
    exact?: boolean;
    beforeEnter?: (to: Route, from: Route | null) => boolean | Promise<boolean>;
    afterEnter?: (to: Route, from: Route | null) => void | Promise<void>;
}

export interface RouteDefinition {
    path: string;
    handler?: RouteHandler | string;
    exact?: boolean;
    beforeEnter?: (to: Route, from: Route | null) => boolean | Promise<boolean>;
    afterEnter?: (to: Route, from: Route | null) => void | Promise<void>;
}

export interface RouteMap {
    [path: string]: RouteOptions | RouteHandler | string;
}

export interface Route {
    path: string;
    handler?: RouteHandler | string;
    module?: string;
    exact?: boolean;
    beforeEnter?: (to: Route, from: Route | null) => boolean | Promise<boolean>;
    afterEnter?: (to: Route, from: Route | null) => void | Promise<void>;
    params?: RouteParams;
}

export interface RouteParams {
    [key: string]: string;
}

export interface ModuleContext {
    framework: MicroFramework;
    navigate: (path: string) => void;
    emit: (event: string, data?: any) => void;
    filter: (event: string, data?: any) => Promise<any>;
    on: (event: string, callback: EventCallback) => void;
    off: (event: string, callback: EventCallback) => void;
}

export interface ModuleError {
    name: string;
    error: Error;
}

export type EventCallback = (data?: any) => any | Promise<any>;

// 404 Handler types
export type NotFoundHandler = 
    | NotFoundFunction
    | NotFoundTemplate
    | NotFoundModule;

export type NotFoundFunction = (path: string, context: ModuleContext) => void | Promise<void>;
export type NotFoundTemplate = string; // HTML template with {{path}} placeholder
export interface NotFoundModule {
    module: string; // Module name to load for 404 pages
}

export interface Plugin {
    install: (framework: MicroFramework) => void;
    name?: string;
    version?: string;
}

export interface EventHistoryEntry {
    name: string;
    data: any;
    source: string;
    timestamp: number;
    time: string;
}

// Event types for better type safety
export interface FrameworkEvents {
    'framework:ready': void;
    'framework:destroyed': void;
    'route:change': Route;
    'route:error': { route: Route; error: Error };
    'route:404': { path: string };
    'route:registered': Route;
    'module:registered': { name: string; module: Module };
    'module:unregistered': { name: string; module: Module };
    'module:load': { name: string; module: ModuleInstance; params: RouteParams };
    'module:error': ModuleError;
    'loading:change': boolean;
    'plugin:installed': Plugin;
    'error': { message: string; error: Error | null };
}

// Utility types
export type EventName = keyof FrameworkEvents;
export type EventData<T extends EventName> = FrameworkEvents[T];

// Advanced types for plugin development
export interface RouteGuard {
    beforeEach?: (to: Route, from: Route | null) => boolean | Promise<boolean>;
    afterEach?: (to: Route, from: Route | null) => void | Promise<void>;
}

export interface ModuleLoader {
    load: (name: string) => Promise<Module>;
    cache?: boolean;
}

export interface ThemeConfig {
    name: string;
    variables: Record<string, string>;
    css?: string;
}