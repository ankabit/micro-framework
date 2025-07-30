/**
 * MicroFramework - A lightweight micro-frontend framework
 * Main entry point that exports all public APIs
 */

import { MicroFramework } from './MicroFramework.js';
import { EVENTS } from './constants.js';
import { EventManager } from './EventManager.js';
import { ModuleManager } from './ModuleManager.js';
import { Router } from './Router.js';

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.MicroFramework = MicroFramework;
    window.MicroFramework.EVENTS = EVENTS;
}

// Default export (primary API)
export default MicroFramework;

// Named exports for advanced usage
export { 
    MicroFramework,
    EVENTS,
    EventManager,
    ModuleManager,
    Router
};

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