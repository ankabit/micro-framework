import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { readFileSync, copyFileSync } from 'fs';

// Read package.json to get version and other metadata
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Banner with package info
const banner = `/**
 * MicroFramework - A lightweight micro-frontend framework
 * 
 * Features:
 * - Framework-agnostic architecture
 * - SPA routing with history/hash modes
 * - Dynamic module loading with lifecycle management
 * - Event system with filtering/pipeline capabilities
 * - TypeScript support
 * 
 * @version ${pkg.version}
 * @author ${pkg.author.name} <${pkg.author.email}>
 * @license ${pkg.license}
 * @homepage ${pkg.homepage}
 */`;

// Copy TypeScript definitions after build
function copyTypes() {
  return {
    name: 'copy-types',
    writeBundle() {
      try {
        copyFileSync('src/index.d.ts', 'dist/index.d.ts');
        console.log('✅ TypeScript definitions copied to dist/');
      } catch (error) {
        console.warn('⚠️  Could not copy TypeScript definitions:', error.message);
      }
    }
  };
}

export default [
  // ES Module build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/micro-framework.esm.js',
      format: 'es',
      banner,
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      copyTypes() // Copy types after first build
    ]
  },
  
  // UMD build (for browsers and Node.js)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/micro-framework.js',
      format: 'umd',
      name: 'MicroFramework',
      banner,
      sourcemap: true,
      globals: {
        // Add any external dependencies here if needed
      }
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  },
  
  // Minified UMD build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/micro-framework.min.js',
      format: 'umd',
      name: 'MicroFramework',
      banner,
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      terser({
        format: {
          comments: function(node, comment) {
            // Preserve banner comments
            return comment.type === 'comment2' && comment.value.includes('MicroFramework');
          }
        }
      })
    ]
  },
  
  // CommonJS build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/micro-framework.cjs.js',
      format: 'cjs',
      banner,
      sourcemap: true,
      exports: 'auto'
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  }
];