# 📚 MicroFramework Examples

This directory contains comprehensive examples demonstrating all features and capabilities of the MicroFramework. Each example is designed to showcase specific functionality and provide practical implementation patterns.

## 🎯 Example Overview

| Example | Purpose | Features Demonstrated |
|---------|---------|----------------------|
| **[index.html](./index.html)** | Comprehensive Demo | Complete framework features, UI structure, routing, modules |
| **[npm-usage.html](./npm-usage.html)** | NPM Package Usage | CDN integration, modern import patterns, basic functionality |
| **[custom-404-demo.html](./custom-404-demo.html)** | Custom Error Pages | Configurable 404 handlers, error management |
| **[event-responses-demo.html](./event-responses-demo.html)** | Event System | Event filtering, pipeline processing, module communication |
| **[separate-modules/](./separate-modules/)** | Modular Architecture | File organization, module separation, advanced patterns |

## 🚀 Getting Started

### Quick Start
1. **Clone/Download** the MicroFramework repository
2. **Serve the files** using a local web server:
   ```bash
   # From project root
   npm run serve
   # OR
   python -m http.server 8080
   # OR
   npx serve .
   ```
3. **Navigate to examples**: `http://localhost:8080/examples/`
4. **Choose an example** to explore specific features

### Development Server
The framework includes a development server script:
```bash
npm run dev  # Starts build watcher + local server
```

## 📋 Example Details

### 1. Comprehensive Demo (`index.html`)
**🎯 Purpose**: Complete showcase of all framework capabilities

**Features**:
- ✅ Full UI structure (header, sidebar, content)
- ✅ Multiple modules with different functionality
- ✅ Advanced routing with parameters and guards
- ✅ Event system integration
- ✅ Form handling and validation
- ✅ Mobile-responsive design
- ✅ Navigation state management

**Best for**: Understanding the complete framework ecosystem and real-world implementation patterns.

### 2. NPM Usage Example (`npm-usage.html`)
**🎯 Purpose**: Demonstrate NPM package integration

**Features**:
- ✅ CDN integration via unpkg
- ✅ Modern ES6 import patterns
- ✅ CommonJS compatibility examples
- ✅ Basic framework functionality
- ✅ TypeScript usage examples

**Best for**: Learning how to integrate the framework into existing projects via NPM.

### 3. Custom 404 Demo (`custom-404-demo.html`)
**🎯 Purpose**: Showcase configurable error handling

**Features**:
- ✅ Custom 404 handler function
- ✅ Template string handlers
- ✅ Module-based error pages
- ✅ Error page customization
- ✅ User experience improvements

**Best for**: Understanding how to create branded, user-friendly error pages.

### 4. Event System Demo (`event-responses-demo.html`)
**🎯 Purpose**: Advanced event system capabilities

**Features**:
- ✅ Event filtering and transformation
- ✅ Pipeline processing
- ✅ Module communication patterns
- ✅ Async event handling
- ✅ Event history and debugging

**Best for**: Building complex inter-module communication and data processing pipelines.

### 5. Separate Modules (`separate-modules/`)
**🎯 Purpose**: Modular application architecture

**Features**:
- ✅ File-based module organization
- ✅ ES6 module imports
- ✅ Async module loading
- ✅ Module lifecycle management
- ✅ CRUD operations
- ✅ State management patterns

**Best for**: Understanding how to structure large, maintainable applications with the framework.

## 🛠️ Technical Requirements

### Browser Support
- **Modern Browsers**: Chrome 60+, Firefox 60+, Safari 12+, Edge 79+
- **ES6 Support**: Required for module imports and modern syntax
- **Local Server**: Required for ES6 modules (no file:// protocol)

### Framework Features Used
- **Core Framework**: Module registration, routing, event system
- **Advanced Features**: Route guards, lifecycle hooks, custom 404 handlers
- **UI Components**: Pre-built CSS components and utilities
- **TypeScript**: Full type definitions and IDE support

## 📖 Learning Path

### For Beginners
1. Start with **NPM Usage Example** - Learn basic integration
2. Explore **Comprehensive Demo** - See all features working together
3. Study **Custom 404 Demo** - Understand error handling
4. Review code structure and patterns

### For Advanced Users
1. Dive into **Separate Modules** - Learn architectural patterns
2. Study **Event System Demo** - Master inter-module communication
3. Examine TypeScript definitions
4. Build custom modules and extensions

### For Framework Contributors
1. Review all examples for consistency
2. Test examples across different browsers
3. Validate TypeScript definitions
4. Ensure documentation accuracy

## 🎨 Customization Guide

### Styling
All examples use the framework's CSS custom properties:
```css
:root {
    --mf-primary: #007bff;
    --mf-secondary: #6c757d;
    --mf-success: #28a745;
    /* ... customize colors */
}
```

### Module Development
Create new modules following the standard pattern:
```javascript
export default {
    name: 'my-module',
    version: '1.0.0',
    
    // Auto-registered routes
    routes: {
        '/my-route': {}
    },
    
    // Lifecycle hooks
    onRegister(context) { /* ... */ },
    beforeMount(params, context) { /* ... */ },
    afterMount(container, params, context) { /* ... */ },
    
    // Main render method
    render(container, params, context) {
        container.innerHTML = '<!-- Your HTML here -->';
    },
    
    // Cleanup
    destroy() { /* ... */ }
};
```

### Adding Examples
1. Create new HTML file in `/examples/`
2. Include framework CSS and JS
3. Follow existing naming conventions
4. Document in this README
5. Test across browsers

## 🐛 Debugging

### Browser DevTools
All examples include comprehensive logging:
```javascript
// View framework state
console.log(app.modules);        // Loaded modules
console.log(app.routes);         // Registered routes
console.log(app.getEventHistory()); // Event history

// Navigate programmatically
app.navigate('/dashboard');

// Trigger events
app.emit('custom:event', data);
```

### Common Issues
- **Module not loading**: Check file paths and server setup
- **Routes not working**: Verify route registration and navigation
- **Events not firing**: Check event names and listener registration
- **Styling issues**: Verify CSS imports and custom properties

## 🔧 Development Tips

### Performance
- Use lazy loading for large modules
- Implement proper cleanup in `destroy()` methods
- Optimize event listeners and DOM manipulation
- Consider code splitting for production

### Best Practices
- Follow consistent naming conventions
- Use TypeScript for better development experience
- Implement proper error handling
- Write modular, reusable code
- Document complex functionality

### Testing
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Test examples
python -m http.server 8080
```

## 📞 Support

### Documentation
- **Framework Docs**: [README.md](../README.md)
- **API Reference**: TypeScript definitions in `/src/types.d.ts`
- **Changelog**: [CHANGELOG.md](../CHANGELOG.md)

### Community
- **Issues**: Report bugs and request features
- **Discussions**: Share patterns and ask questions
- **Contributions**: Submit examples and improvements

---

Each example is self-contained and can be used as a starting point for your own projects. The examples demonstrate production-ready patterns and best practices for building applications with MicroFramework.