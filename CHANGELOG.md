# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Custom 404 Handlers** - Configurable 404 error pages
  - Function handlers for full control over 404 rendering
  - Template string handlers with `{{path}}` placeholder
  - Module handlers to load specific modules for 404 pages
  - Configuration via `router.notFoundHandler` option
- **Modular Architecture** - Split classes into separate files for better maintainability
  - EventManager, ModuleManager, Router, and MicroFramework in separate files
  - Rollup bundler configuration with multiple output formats (ESM, UMD, CommonJS, minified)
  - Source maps and TypeScript definitions automatically generated
  - Tree-shaking support for smaller bundle sizes

## [1.0.0] - 2025-01-30

### Added
- **Initial Release** - Complete micro-frontend framework implementation
- **Core Framework** - MicroFramework class with modular architecture
- **Router System** - SPA routing with history, hash, and hash-bang modes
  - Dynamic route parameters (e.g., `/user/:id`)
  - Route guards (beforeEnter/afterEnter) at global and route levels
  - Template string handlers with variable substitution
- **Module System** - Dynamic module loading and lifecycle management
  - Module registration with `onRegister`, `beforeMount`, `afterMount`, `destroy` hooks
  - Lazy loading support with dynamic imports
  - Auto-route registration from module definitions
- **Event System** - Dual-mode event architecture
  - `emit()` for fire-and-forget notifications
  - `filter()` for sequential data transformation through listener pipeline
  - Event debugging with history tracking and logging
- **TypeScript Support** - Complete type definitions for all APIs
- **Plugin Architecture** - Extensible plugin system with install hooks
- **CSS Framework** - Pre-built components and utilities
  - Buttons, cards, forms, error pages
  - CSS custom properties for theming
  - Mobile-responsive design patterns
- **NPM Package** - Published as `@ankabit/micro-framework`
  - Modern ES module exports
  - CommonJS compatibility
  - CDN support via unpkg

### Framework Features
- **Framework Agnostic** - Works with vanilla JS, React, Vue, Angular, etc.
- **Lightweight** - No external dependencies, minimal footprint
- **Developer Experience** - Event logging, error handling, debugging tools
- **Modern Standards** - ES6+ syntax, async/await support, Promise handling

### API Surface
- **Core Methods**: `start()`, `destroy()`, `navigate()`, `getCurrentRoute()`
- **Module Management**: `registerModule()`, `unregisterModule()`, `loadModule()`
- **Routing**: `registerRoute()` with flexible options object
- **Event System**: `on()`, `off()`, `emit()`, `filter()`
- **Plugin System**: `use()` for plugin installation
- **Debugging**: `getEventHistory()`, `clearEventHistory()`, `getEventNames()`

### Configuration Options
- Router configuration (mode, base path, guards)
- Module loading (base path, lazy loading)
- Event system (logging, custom prefixes)
- Container and loading spinner elements

### Examples and Documentation
- Complete README with installation and usage examples
- NPM usage examples with CDN and bundler patterns
- TypeScript definitions with full API coverage
- Comprehensive feature demonstrations

### Development Tools
- `.npmignore` for clean package publishing
- Package.json with proper metadata and entry points
- CHANGELOG.md for version tracking
- Development server scripts

## Future Releases

### Planned Features
- Enhanced plugin ecosystem
- Built-in state management utilities
- Advanced routing features (nested routes, lazy route loading)
- Performance optimizations
- Additional CSS components and themes

---

## Release Notes

### v1.0.0 - Initial Public Release

This is the first stable release of MicroFramework, a lightweight micro-frontend solution. The framework provides a complete foundation for building modular web applications with:

- **Routing**: Full SPA routing with guards and parameters
- **Modules**: Dynamic loading with lifecycle management
- **Events**: Pipeline-based filtering and standard emission
- **TypeScript**: Complete type safety out of the box
- **Flexibility**: Framework-agnostic, plugin-extensible architecture

The API is considered stable and suitable for production use. Future releases will maintain backward compatibility while adding new features and improvements.

For installation instructions, examples, and complete documentation, see the [README.md](README.md).