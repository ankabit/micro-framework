/**
 * Home Module - Landing page with framework overview
 * Demonstrates module definition with routes
 */
export default {
    name: 'home',
    version: '1.0.0',
    description: 'Home page module with framework overview',

    // Module routes - automatically registered when module is registered
    routes: {
        '/': {},  // Uses module render method
        '/about': {
            handler: (params, context) => {
                context.framework.moduleContainer.innerHTML = `
                    <div class="demo-banner">
                        <h1>About MicroFramework</h1>
                        <p>Learn more about this lightweight micro-frontend solution</p>
                    </div>
                    <div class="mf-card">
                        <div class="mf-card-content">
                            <h3>Framework Features</h3>
                            <ul>
                                <li>Framework-agnostic architecture</li>
                                <li>Dynamic module loading</li>
                                <li>Advanced routing with guards</li>
                                <li>Event-driven communication</li>
                                <li>Plugin architecture</li>
                            </ul>
                            <button class="mf-btn mf-btn-primary" onclick="app.navigate('/')">
                                Back to Home
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    },

    // Lifecycle hooks
    beforeMount(params, context) {
        console.log('🏠 Home module about to mount');
    },

    afterMount(container, params, context) {
        console.log('🏠 Home module mounted successfully');
    },

    // Main render method
    render(container, params, context) {
        container.innerHTML = `
            <div class="demo-banner">
                <h1>🚀 MicroFramework</h1>
                <p>A lightweight, framework-agnostic micro-frontend solution</p>
            </div>
            
            <div class="features-grid">
                <div class="feature-card">
                    <h3>🎯 Framework Agnostic</h3>
                    <p>Works with vanilla JS, React, Vue, Angular, or any other framework. Use what you love.</p>
                </div>
                
                <div class="feature-card">
                    <h3>🛣️ Advanced Routing</h3>
                    <p>Full SPA routing with history mode, hash mode, and hash-bang support. Dynamic routes with parameters.</p>
                </div>
                
                <div class="feature-card">
                    <h3>🧩 Module System</h3>
                    <p>Dynamic module loading, lifecycle management, and plugin architecture for maximum flexibility.</p>
                </div>
                
                <div class="feature-card">
                    <h3>📱 Responsive</h3>
                    <p>Mobile-first design with responsive layouts and touch-friendly interactions.</p>
                </div>
                
                <div class="feature-card">
                    <h3>⚡ Lightweight</h3>
                    <p>Minimal footprint with no external dependencies. Load only what you need.</p>
                </div>
                
                <div class="feature-card">
                    <h3>🔗 Modular</h3>
                    <p>Each module is a separate file that can be loaded dynamically or statically.</p>
                </div>
            </div>
            
            <div class="mf-card">
                <div class="mf-card-content">
                    <h3>Quick Start Example</h3>
                    <div class="code-example">// Initialize the framework
const app = new MicroFramework({
    container: '#app',
    router: { mode: 'history' }
});

// Register a module from separate file
import dashboardModule from './modules/dashboard.js';
app.registerModule('dashboard', dashboardModule);

// Register a route
app.registerRoute('/dashboard', { module: 'dashboard' });

// Start the app
app.start();</div>
                    
                    <p>This example demonstrates modules loaded from separate files for better organization!</p>
                    
                    <button class="mf-btn mf-btn-primary" onclick="app.navigate('/dashboard')">
                        Try Dashboard
                    </button>
                    <button class="mf-btn mf-btn-secondary" onclick="app.navigate('/users')">
                        View Users
                    </button>
                    <button class="mf-btn mf-btn-info" onclick="app.navigate('/about')">
                        Learn More
                    </button>
                </div>
            </div>
        `;
    },

    // Cleanup
    destroy() {
        console.log('🏠 Home module destroyed');
    }
};