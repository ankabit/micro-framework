# Separate Modules Example

This example demonstrates how to organize MicroFramework modules in separate files for better code organization and maintainability.

## 📁 File Structure

```
separate-modules/
├── index.html           # Main application file
├── README.md           # This file
└── modules/
    ├── home.js         # Home page module
    ├── dashboard.js    # Dashboard module with stats
    ├── users.js        # User management module
    ├── user-detail.js  # Individual user profile
    └── settings.js     # Application settings
```

## 🚀 Features Demonstrated

### Module Organization
- **Separate Files**: Each module is in its own file for better organization
- **ES6 Modules**: Uses modern import/export syntax
- **Async Loading**: Modules are loaded asynchronously in parallel
- **Error Handling**: Proper error handling for module loading failures

### Advanced Module Features
- **Module Routes**: Each module defines its own routes
- **Lifecycle Hooks**: beforeMount, afterMount, destroy
- **Route Guards**: beforeEnter, afterEnter
- **Data Management**: Local state and methods within modules
- **Event Handling**: Module-specific event handlers

### Real-World Patterns
- **CRUD Operations**: User management with create, read, update, delete
- **Form Handling**: Settings with form validation and local storage
- **Data Binding**: Dynamic content based on route parameters
- **State Management**: Module-level state and persistence

## 📋 Module Details

### Home Module (`modules/home.js`)
- Landing page with framework overview
- Demonstrates basic module structure
- Multiple routes (`/`, `/about`)
- Template and function handlers

### Dashboard Module (`modules/dashboard.js`)
- Main dashboard with system metrics
- Dynamic route (`/dashboard/stats`) with generated data
- Lifecycle hooks and route guards
- Chart placeholder for integration examples

### Users Module (`modules/users.js`)
- User management with table display
- CRUD operations (Create, Read, Update, Delete)
- Form handling for user creation
- Badge system for roles and status
- Module-level data and methods

### User Detail Module (`modules/user-detail.js`)
- Individual user profile pages
- Route parameter handling (`/user/:id`)
- Dynamic content based on user ID
- Action buttons with confirmation dialogs
- Formatted data display

### Settings Module (`modules/settings.js`)
- Application configuration interface
- Form handling with validation
- Local storage integration
- Import/export functionality
- Route guard with confirmation dialog

## 🔧 Technical Implementation

### Module Loading Pattern
```javascript
// Load modules asynchronously
const [homeModule, dashboardModule] = await Promise.all([
    import('./modules/home.js'),
    import('./modules/dashboard.js')
]);

// Register with framework
app.registerModule('home', homeModule.default);
app.registerModule('dashboard', dashboardModule.default);
```

### Module Structure
```javascript
export default {
    name: 'module-name',
    version: '1.0.0',
    description: 'Module description',
    
    // Auto-registered routes
    routes: {
        '/path': {},                    // Uses module render
        '/path/action': { handler: fn } // Custom handler
    },
    
    // Module data
    data: {
        items: []
    },
    
    // Helper methods
    methods: {
        helperFunction() { /* ... */ }
    },
    
    // Lifecycle hooks
    beforeMount(params, context) { /* ... */ },
    afterMount(container, params, context) { /* ... */ },
    
    // Route guards
    beforeEnter(to, from) { /* ... */ },
    afterEnter(to, from) { /* ... */ },
    
    // Main render method
    render(container, params, context) { /* ... */ },
    
    // Cleanup
    destroy() { /* ... */ }
};
```

### Route Auto-Registration
Modules can define routes that are automatically registered:
```javascript
routes: {
    '/users': {},                    // Uses module.render()
    '/users/create': { 
        handler: (params, context) => {
            // Custom route logic
        }
    }
}
```

## 🎯 Benefits of Separate Modules

### Organization
- **Separation of Concerns**: Each module handles its own functionality
- **Code Splitting**: Modules can be loaded on-demand
- **Team Development**: Different developers can work on different modules
- **Reusability**: Modules can be shared across projects

### Maintainability
- **Isolated Testing**: Each module can be tested independently
- **Version Control**: Changes to one module don't affect others
- **Debugging**: Easier to locate and fix issues
- **Documentation**: Each module is self-documenting

### Performance
- **Lazy Loading**: Modules loaded only when needed
- **Parallel Loading**: Multiple modules loaded simultaneously
- **Caching**: Modules cached by the browser
- **Bundle Splitting**: Smaller initial bundle size

## 🚦 Running the Example

1. **Start a Local Server**: 
   ```bash
   # From the project root
   npm run serve
   # OR
   python -m http.server 8080
   ```

2. **Navigate to**: `http://localhost:8080/examples/separate-modules/`

3. **Explore**: Use the navigation to explore different modules

## 🎓 Learning Points

### For Beginners
- How to structure a modular application
- ES6 module import/export syntax
- Async/await patterns for loading modules
- Form handling and data binding

### For Advanced Users
- Module lifecycle management
- Route guards and navigation hooks
- State management patterns
- Error handling strategies

## 🔍 Debugging

The example includes comprehensive logging:
- Module loading progress
- Route navigation events
- Module lifecycle hooks
- Error handling

Open browser DevTools to see detailed logs and use these console commands:
```javascript
app.navigate('/dashboard')     // Navigate to routes
app.getEventHistory()         // View event history
app.modules                   // View loaded modules
app.routes                    // View registered routes
```

## 🎨 Customization

### Adding New Modules
1. Create a new file in `modules/`
2. Export a module object with the required structure
3. Import and register in `index.html`

### Extending Existing Modules
- Add new routes to the `routes` object
- Extend the `methods` object for helpers
- Add lifecycle hooks as needed

### Styling
- All CSS is contained in `index.html` for simplicity
- Uses CSS custom properties for theming
- Responsive design for mobile devices

This example serves as a template for building real-world applications with MicroFramework's modular architecture.