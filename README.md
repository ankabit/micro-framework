# @ankabit/micro-framework

A lightweight, framework-agnostic micro-frontend framework with built-in routing, module loading, and event filtering.

## 🚀 Features

-   **Framework Agnostic** - Works with vanilla JS, React, Vue, or any other framework
-   **SPA Router** - History mode, hash mode, and hash-bang mode support
-   **Module System** - Dynamic module loading with lifecycle management
-   **Event Filtering** - Pipeline-based event system for data transformation
-   **Clean Route Definition** - Object-based routes with shorthand syntax
-   **Plugin Architecture** - Easy to extend and customize
-   **TypeScript Support** - Full type definitions included

## 📦 Installation

### NPM Install

```bash
npm install @ankabit/micro-framework
```

### CDN (Browser)

```html
<!-- Framework JavaScript (required) -->
<script src="https://unpkg.com/@ankabit/micro-framework@1.0.0/dist/micro-framework.min.js"></script>

<!-- CSS (optional - only needed for default 404 pages and examples) -->
<link
	rel="stylesheet"
	href="https://unpkg.com/@ankabit/micro-framework@1.0.0/src/micro-framework.css"
/>
```

> **Note**: The CSS is completely optional. It's only used for:
>
> -   Default 404 error pages (if no custom `notFoundHandler` is provided)
> -   Example applications and demos
>
> If you provide a custom 404 handler or use your own styling, you don't need to include the CSS.

## 🚀 Quick Start

### NPM Usage

```javascript
import MicroFramework from "@ankabit/micro-framework";
// Or CommonJS
const MicroFramework = require("@ankabit/micro-framework");

const app = new MicroFramework({
	container: "#app",
	router: {mode: "history"},
});

app.start();
```

### Browser Usage

```html
<!DOCTYPE html>
<html>
	<head>
		<title>My App</title>
		<!-- CSS optional - only for default 404 pages -->
		<link rel="stylesheet" href="src/micro-framework.css" />
	</head>
	<body>
		<!-- Create your own UI structure -->
		<nav>
			<button data-route="/">Home</button>
			<button data-route="/dashboard">Dashboard</button>
		</nav>

		<!-- Framework only manages this container -->
		<div id="app"></div>

		<!-- Optional loading spinner -->
		<div id="loading" style="display: none;">Loading...</div>

		<script src="src/micro-framework.js"></script>
		<script>
			const app = new MicroFramework({
				container: "#app", // Required: where modules render
				loadingSpinner: "#loading", // Optional: loading indicator
				router: {
					mode: "history", // 'history', 'hash', or 'hashbang'
				},
			});

			app.start();
		</script>
	</body>
</html>
```

### 2. Create Your First Module

```javascript
// modules/dashboard.js
export default {
	name: "dashboard",
	render(container, params) {
		container.innerHTML = `
            <h1>Dashboard</h1>
            <p>Welcome to your dashboard!</p>
        `;
	},
	destroy() {
		// Cleanup logic
	},
};
```

### 3. Register Routes and Modules

```javascript
// Register a module
app.registerModule("dashboard", dashboardModule);

// Route with module only - just loads and renders the module
app.registerRoute("/", {
	module: "dashboard", // No handler needed - uses module.render automatically
});

// Route with function handler only
app.registerRoute("/api/users", {
	handler: async (params, context, route) => {
		const users = await fetchUsers();
		context.framework.moduleContainer.innerHTML = `
            <h1>Users API</h1>
            <pre>${JSON.stringify(users, null, 2)}</pre>
        `;
	},
});

// Route with template handler
app.registerRoute("/hello/:name", {
	handler: "<h1>Hello {{name}}!</h1><p>Welcome to our site.</p>",
});

// Route with module + custom handler
app.registerRoute("/dashboard/settings", {
	module: "dashboard",
	handler: (params, context, route) => {
		// Custom logic after module loads
		console.log("Dashboard settings loaded");
	},
});

// Start the application
app.start();
```

## 📚 Documentation

### Configuration Options

```javascript
const app = new MicroFramework({
	// Container element - where modules will be rendered
	container: "#app", // CSS selector or DOM element

	// Optional loading spinner element
	loadingSpinner: "#loading-spinner", // CSS selector or DOM element (optional)

	// Router configuration
	router: {
		mode: "history", // 'history', 'hash', 'hashbang'
		base: "", // Base path for history mode
		hashbang: false, // Use #! instead of # for hash mode
		beforeEnter: null, // Global beforeEnter guard
		afterEnter: null, // Global afterEnter hook
		notFoundHandler: null, // Custom 404 handler (function, string, or module)
	},

	// Legacy router options (for backward compatibility)
	mode: "history", // Use router.mode instead
	base: "", // Use router.base instead
	hashbang: false, // Use router.hashbang instead

	// Module configuration
	moduleBase: "./modules/", // Base path for dynamic imports
	lazy: true, // Enable lazy loading

	// Event system configuration
	enableEventLogging: false, // Enable event logging for debugging
	eventLogPrefix: "[MyApp]", // Custom log prefix

	// Hooks
	onBeforeRouteChange: null,
	onAfterRouteChange: null,
	onModuleLoad: null,
	onModuleError: null,
});
```

### Module Structure

```javascript
export default {
	name: "module-name",

	// Required: Render function
	render(container, params, context) {
		// Render your module content
		container.innerHTML = "<h1>Hello World</h1>";
	},

	// Optional: Lifecycle hooks
	beforeMount(params, context) {
		// Called before render
	},

	afterMount(container, params, context) {
		// Called after render
	},

	destroy() {
		// Cleanup when module is unmounted
	},

	// Optional: Route guards
	beforeEnter(to, from) {
		// Return false to cancel navigation
		return true;
	},

	afterEnter(to, from) {
		// Called after successful navigation
	},
};
```

### API Reference

#### Core Methods

```javascript
// Module management
app.registerModule(name, module);
app.unregisterModule(name);
app.loadModule(name, params);

// Routing - Clean, consistent API
app.registerRoute(path, { module: 'name' });                         // Module only (uses module.render)
app.registerRoute(path, { handler: function });                      // Function handler
app.registerRoute(path, { handler: 'template string' });             // Template handler
app.registerRoute(path, { module: 'name', handler: function });      // Module + custom handler

app.navigate(path);
app.getCurrentRoute();

// Event system
app.on(event, callback);
app.off(event, callback);
app.emit(event, data);                    // Fire and forget
app.filter(event, data);                  // Transform data through listeners

// Plugin system
app.use(plugin);
```

#### Events

The framework provides a centralized event system with predefined event constants:

```javascript
// Import event constants
const {EVENTS} = MicroFramework;

// Listen to framework events using constants
app.on(EVENTS.ROUTE_CHANGE, (route) => {
	console.log("Route changed to:", route.path);
});

app.on(EVENTS.MODULE_LOAD, (moduleData) => {
	console.log("Module loaded:", moduleData.name);
});

app.on(EVENTS.MODULE_ERROR, (error) => {
	console.error("Module error:", error);
});

// Available events
app.on(EVENTS.FRAMEWORK_READY, () => console.log("Framework ready"));
app.on(EVENTS.FRAMEWORK_DESTROYED, () => console.log("Framework destroyed"));
app.on(EVENTS.MODULE_REGISTERED, (data) =>
	console.log("Module registered", data)
);
app.on(EVENTS.MODULE_UNREGISTERED, (data) =>
	console.log("Module unregistered", data)
);
app.on(EVENTS.ROUTE_REGISTERED, (route) =>
	console.log("Route registered", route)
);
app.on(EVENTS.ROUTE_ERROR, (error) => console.error("Route error", error));
app.on(EVENTS.ROUTE_404, (data) => console.log("404 error", data));
app.on(EVENTS.LOADING_CHANGE, (isLoading) =>
	console.log("Loading:", isLoading)
);
app.on(EVENTS.ERROR, (error) => console.error("Error", error));
app.on(EVENTS.PLUGIN_INSTALLED, (plugin) =>
	console.log("Plugin installed", plugin)
);
```

#### Event Debugging

Enable event logging for debugging:

```javascript
const app = new MicroFramework({
	container: "#app",
	enableEventLogging: true, // Enable event logging
	eventLogPrefix: "[MyApp Event]", // Custom log prefix
});

// Get event history for debugging
const history = app.getEventHistory();
console.log("Event history:", history);

// Clear event history
app.clearEventHistory();

// Get all available event names
const eventNames = app.getEventNames();
console.log("Available events:", eventNames);
```

## 🎨 Theming

The framework includes a flexible theming system:

```css
/* Custom theme */
:root {
	--primary-color: #007bff;
	--secondary-color: #6c757d;
	--success-color: #28a745;
	--danger-color: #dc3545;
	--warning-color: #ffc107;
	--info-color: #17a2b8;
	--light-color: #f8f9fa;
	--dark-color: #343a40;
}
```

## 🎨 CSS Framework (Optional)

The framework includes an optional CSS file that provides:

-   **Default 404 error page styling** (only used if no custom `notFoundHandler` is provided)
-   **UI components for examples** (buttons, cards, forms, etc.)
-   **CSS custom properties** for theming

### When CSS is NOT needed:

-   ✅ **Custom 404 handlers** - You control error page styling
-   ✅ **Custom UI framework** - Using Bootstrap, Tailwind, etc.
-   ✅ **Headless usage** - API-only or custom rendering

### When CSS is helpful:

-   📝 **Quick prototypes** - Use provided UI components
-   🚫 **Default 404 pages** - Framework handles error styling
-   🎯 **Learning/examples** - Consistent styling across demos

```html
<!-- Include only if needed -->
<link
	rel="stylesheet"
	href="https://unpkg.com/@ankabit/micro-framework@1.0.0/src/micro-framework.css"
/>
```

## 📁 Project Structure

```
your-project/
├── index.html
├── modules/
│   ├── dashboard.js
│   ├── users.js
│   └── settings.js
├── assets/
│   ├── css/
│   └── js/
└── src/
    ├── micro-framework.js
    └── micro-framework.css
```

## 🔧 Advanced Usage

### Dynamic Module Loading

```javascript
// Load module from URL
app.loadModuleFromUrl("./modules/advanced-module.js");

// Load module with parameters
app.loadModule("dashboard", {userId: 123});

// Conditional loading
if (user.isAdmin) {
	app.loadModule("admin-panel");
}
```

### Route Guards

#### Global Route Guards

```javascript
const app = new MicroFramework({
	router: {
		// Global beforeEnter guard (runs for all routes)
		beforeEnter: async (to, from) => {
			console.log(
				`Navigating from ${from?.path || "initial"} to ${to.path}`
			);

			// Global authentication check
			if (!user.isAuthenticated && to.path !== "/login") {
				app.navigate("/login");
				return false; // Cancel navigation
			}

			// Global permission check
			if (to.path.startsWith("/admin") && !user.isAdmin) {
				app.navigate("/unauthorized");
				return false;
			}

			return true; // Allow navigation
		},

		// Global afterEnter hook (runs after successful navigation)
		afterEnter: (to, from) => {
			// Global analytics tracking
			analytics.track("page_view", to.path);

			// Update page title
			document.title = `MyApp - ${to.moduleName}`;

			// Scroll to top
			window.scrollTo(0, 0);
		},
	},
});
```

#### Route-Specific Guards

```javascript
app.registerRoute("/admin", {
	module: "admin-panel",
	beforeEnter: (to, from) => {
		// Route-specific check (runs after global beforeEnter)
		if (!user.hasAdminAccess()) {
			app.navigate("/dashboard");
			return false;
		}
		return true;
	},

	afterEnter: (to, from) => {
		// Route-specific action (runs before global afterEnter)
		console.log("Admin panel loaded");
	},
});
```

#### Guard Execution Order

1. **Global beforeEnter** - Runs first for all routes
2. **Route-specific beforeEnter** - Runs if global guard allows navigation
3. Module loading and rendering
4. **Route-specific afterEnter** - Runs first after successful navigation
5. **Global afterEnter** - Runs last after successful navigation

### Custom 404 Handlers

The framework supports customizable 404 error pages when routes are not found:

> **Note**: When using custom 404 handlers, you don't need the framework CSS since you control the error page styling.

```javascript
const app = new MicroFramework({
    container: '#app',
    router: {
        // Function handler - full control over 404 rendering
        notFoundHandler: (path, context) => {
            context.framework.moduleContainer.innerHTML = `
                <div class="custom-404">
                    <h1>🔍 Page Not Found</h1>
                    <p>The route <strong>${path}</strong> doesn't exist.</p>
                    <button onclick="app.navigate('/')">Go Home</button>
                </div>
            `;
        }

        // OR: Template string handler with {{path}} placeholder
        notFoundHandler: `
            <div class="error-page">
                <h1>404 - Not Found</h1>
                <p>Route {{path}} was not found.</p>
            </div>
        `

        // OR: Module handler - load a specific module for 404s
        notFoundHandler: {
            module: 'error-page' // Will receive { path } as params
        }
    }
});
```

If no custom handler is provided, the framework falls back to the default 404 page.

## 🛤️ Simplified Routing

The framework uses a clean, consistent API for route definition:

### Route Options

Every route is defined with `app.registerRoute(path, options)`:

```javascript
// Module only - loads and renders the module
app.registerRoute("/dashboard", {
	module: "dashboard",
});

// Function handler - executes custom logic
app.registerRoute("/api/status", {
	handler: (params, context) => {
		context.framework.moduleContainer.innerHTML = `
            <div class="status">
                <h1>System Status</h1>
                <p>All systems operational ✅</p>
            </div>
        `;
	},
});

// Template handler - renders string with variable substitution
app.registerRoute("/hello/:name", {
	handler: "<h1>Hello {{name}}!</h1><p>Welcome to our site.</p>",
});

// Module + handler - loads module, then runs custom logic
app.registerRoute("/dashboard/analytics", {
	module: "dashboard",
	handler: (params, context) => {
		// Module loaded, now add specific behavior
		console.log("Analytics dashboard ready");
	},
});
```

### Auto-Registration with Modules

Modules can define their own routes for automatic registration:

```javascript
// Module with built-in routes - clean object syntax
const shopModule = {
	routes: {
		"/shop": {}, // Empty object - uses module.render
		"/shop/cart": {}, // Another simple route
		"/shop/product/:id": async (params, context) => {
			// Function shorthand
			const product = await fetchProduct(params.id);
			document.getElementById("product-detail").innerHTML = product.name;
		},
		"/shop/settings": {
			// Full options object
			beforeEnter: (to, from) => checkAdminAccess(), // No handler - uses module.render
		},
	},

	render(container, params, context) {
		container.innerHTML = `
            <div id="shop-header"><h1>Shop</h1></div>
            <div id="shop-content">Default shop content</div>
            <div id="product-detail"></div>
        `;
	},
};

// Register module - routes are automatically registered too!
app.registerModule("shop", shopModule);
// This automatically calls:
// app.registerRoute('/shop', { module: 'shop' });
// app.registerRoute('/shop/cart', { module: 'shop' });
// app.registerRoute('/shop/product/:id', { module: 'shop', handler: function });
// app.registerRoute('/shop/settings', { module: 'shop', beforeEnter: ... });
```

### Shorthand Syntax

The object-based routes support convenient shorthand notation:

```javascript
const myModule = {
	routes: {
		// Empty object shorthand - uses module.render
		"/simple": {}, // → { module: 'myModule' }

		// String shorthand - template handler
		"/template/:name": "Hello {{name}}!", // → { handler: 'Hello {{name}}!' }

		// Function shorthand
		"/api/users": async (params, context) => {
			// → { handler: function }
			const users = await fetchUsers();
			context.framework.moduleContainer.innerHTML = renderUsers(users);
		},

		// Full options object
		"/admin": {
			beforeEnter: (to, from) => checkAdminAccess(), // Uses module.render
			afterEnter: (to, from) => logAdminAccess(),
		},
	},
};
```

### Template Variables

String handlers support simple variable substitution:

```javascript
app.registerRoute("/user/:id/profile/:tab", {
	handler: `
        <div class="profile">
            <h1>User {{id}}</h1>
            <div class="active-tab">{{tab}}</div>
        </div>
    `,
});
// /user/123/profile/settings → renders with id=123, tab=settings
```

### Module Communication

```javascript
// Module A
app.emit("user:selected", {id: 123});

// Module B
app.on("user:selected", (user) => {
	// Handle user selection
});
```

## 🔌 Plugins

Extend the framework with plugins:

```javascript
const analyticsPlugin = {
	install(framework) {
		framework.on("route:change", (route) => {
			analytics.track("page_view", route.path);
		});
	},
};

app.use(analyticsPlugin);
```

## 🛠️ Development

```bash
# Clone the repository
git clone <repo-url>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 📋 Examples

Check the `examples/` directory for:

-   Basic usage examples
-   Module examples
-   Advanced routing scenarios
-   Plugin development

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details
