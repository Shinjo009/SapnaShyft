# Node Modules Guide - MYREPOX Project
**Last Updated:** March 26, 2026

---

## 📋 Overview

This document explains the packages required for MYREPOX and how to set up the project cleanly after moving to a new machine (including macOS).

Current project uses **6 direct dependencies/devDependencies** from `package.json`, while all transitive dependencies are resolved from `package-lock.json`.

---

## 🎯 Required Node Modules (Direct)

Install source of truth:
- `package.json` for declared packages
- `package-lock.json` for exact resolved versions

Required direct modules are:
- `react` `^19.2.4`
- `react-dom` `^19.2.4`
- `react-scripts` `5.0.1`
- `autoprefixer` `^10.4.23`
- `postcss` `^8.5.6`
- `tailwindcss` `^3.4.19`

These six modules are all that must be declared directly. Everything else in `node_modules` is installed transitively from the lockfile.

## 🎯 Runtime Dependencies (3)

### 1. **React** (v19.2.4)
**NPM Package:** `react`  
**Purpose:** Core UI framework for building component-based user interfaces  
**Why We Use It:**
- Declarative syntax for building UI components
- Component reusability and composition
- State management with hooks (useState, useEffect, useCallback, etc.)
- Virtual DOM for efficient rendering
- Large ecosystem and community support

**Key Features Used:**
- Functional components
- React Hooks (useState, useEffect, useRef, useCallback)
- Props for component communication
- Fragment (<> </>) for grouping elements
- Conditional rendering

**Example Usage in Project:**
```jsx
import React, { useState } from 'react';

function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  
  return (
    <div>
      <input 
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
    </div>
  );
}

export default LoginPage;
```

---

### 2. **React-DOM** (v19.2.4)
**NPM Package:** `react-dom`  
**Purpose:** Provides DOM-specific methods for rendering React components in web browsers  
**Why We Use It:**
- Renders React components to the actual DOM
- Bridges gap between React (component logic) and DOM (browser rendering)
- Provides ReactDOM.render() or createRoot() for mounting app
- Handles browser-specific rendering

**Key Features Used:**
- `ReactDOM.createRoot()` - Creates root React rendering point
- DOM event handling
- Browser APIs integration

**Where It's Used:**
```jsx
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### 3. **React-Scripts** (v5.0.1)
**NPM Package:** `react-scripts`  
**Purpose:** Provides build configuration, development server, and tooling for Create React App  
**Why We Use It:**
- Zero-configuration build setup
- Development server with hot reload
- Production build optimization
- Jest testing framework
- ESLint configuration
- Webpack bundling
- Babel transpilation

**Key Features Used:**
- `npm start` - Starts development server at localhost:3000
- `npm build` - Creates optimized production build
- `npm test` - Runs test suite
- Hot module reloading during development

**What react-scripts Includes:**
The actual package manages ~1000+ dependencies including:
- **Webpack** - Module bundler
- **Babel** - JavaScript transpiler
- **Jest** - Testing framework
- **ESLint** - Code quality linting
- **PostCSS** - CSS processor
- **WebSocket** - Live reload connection
- Many other tools...

---

## 🛠️ Build/Style Tooling Dependencies (3)

### 4. **Autoprefixer** (v10.4.23)
**NPM Package:** `autoprefixer`
**Purpose:** Adds vendor prefixes to CSS during build.

### 5. **PostCSS** (v8.5.6)
**NPM Package:** `postcss`
**Purpose:** CSS transformation pipeline used by CRA and Tailwind tooling.

### 6. **Tailwind CSS** (v3.4.19)
**NPM Package:** `tailwindcss`
**Purpose:** Utility CSS framework used by the project styles and config.

---

## 📦 Major Transitive Dependencies

These are packages installed automatically by `react-scripts` and other packages:

### Core Build Tools

#### **Webpack** (~v5)
**Purpose:** Module bundler that bundles all JS, CSS, and assets  
**Used For:**
- Combining all source files into optimized bundles
- Code splitting for efficient loading
- Asset management (images, fonts, etc.)
- Development server with hot reload

---

#### **Babel** (~v7)
**Purpose:** JavaScript compiler/transpiler  
**Used For:**
- Converting modern JavaScript (ES6+) to browser-compatible code
- JSX syntax transformation (`<Component />` → `React.createElement()`)
- Polyfills for older browser support
- Plugin system for custom transformations

**Babel Packages:**
- `@babel/core` - Core transpilation engine
- `@babel/preset-env` - Smart transpilation based on target browsers
- `@babel/preset-react` - JSX transformation
- `@babel/plugin-*` - Various plugins for specific features

---

#### **PostCSS** (v8.5.6)
**Purpose:** CSS processing and transformation tool  
**Used For:**
- Adding vendor prefixes automatically (e.g., `-webkit-`, `-moz-`)
- CSS feature transformation
- Plugin system for CSS enhancements
- Works with Tailwind CSS

**Related:**
- `autoprefixer` - Plugin for vendor prefixing
- Works with our `tailwind.config.js`

---

#### **Tailwind CSS** (v3.4.19)
**Purpose:** Utility-first CSS framework (actively listed in project dependencies)  
**Used For:**
- Responsive design utilities
- Custom theme configuration
- Class-based styling (e.g., `p-4`, `text-center`)
- Dark mode support

**Configuration:** `tailwind.config.js`

---

### Testing & Quality

#### **Jest** (~v29)
**Purpose:** JavaScript testing framework  
**Used For:**
- Unit testing components
- Snapshot testing
- Mocking functions and modules
- Coverage reporting

**Not Currently Used:** No test files in the project yet

---

#### **ESLint** (~v8)
**Purpose:** JavaScript linter for code quality  
**Used For:**
- Catching syntax errors
- Code style consistency
- React best practices (via `eslint-plugin-react`)
- Accessibility warnings (via `eslint-plugin-jsx-a11y`)

**Current Warnings in Project:**
```
⚠️ SpinningTriangle - useEffect missing dependencies
⚠️ CircularProgressCard - Unused variable 'animationName'
⚠️ HealthParametersSection - Anchor without valid href
⚠️ SignupPage - useEffect dependency issues
```

---

### React Ecosystem

#### **React-Refresh** (~v0.14)
**Purpose:** Fast refresh for development  
**Used For:**
- Preserving component state during code changes
- Instant reload without full page refresh
- Better development experience

---

#### **React-DevTools** (~v4)
**Purpose:** Browser extension for React debugging  
**Used For:**
- Inspecting component hierarchy
- Viewing props and state
- Performance profiling
- Component search

---

### Development Utilities

#### **WebSocket** (~v8.19.0)
**Purpose:** WebSocket communication protocol  
**Used For:**
- Live reload connection between dev server and browser
- Hot module replacement communication
- Development server features

---

#### **File System & Path Utilities**
- `fs-extra` - Enhanced file system operations
- `path` - Path manipulation (Node.js built-in)
- `resolve` - Module resolution

---

#### **Performance & Optimization**
- `terser` - JavaScript minifier
- `cssnano` - CSS minifier
- `image-minimizer-webpack-plugin` - Image optimization

---

### Dependency Management

#### **NPM-related Packages**
- `semver` - Semantic versioning utilities
- `npm` - Package management (included with Node.js)
- Various loaders and resolvers for webpack

---

## 🔄 Dependency Tree Overview

```
my-app (v0.1.0)
│
├─ react (19.2.4)
│  └─ react (peer dependency)
│
├─ react-dom (19.2.4)
│  ├─ react (peer dependency)
│  └─ react (19.2.4)
│
└─ react-scripts (5.0.1) ⭐ [Contains ~1000+ packages]
   ├─ webpack (~v5)
   │  ├─ webpack-cli
   │  ├─ webpack-dev-server
   │  └─ [many loaders and plugins]
   ├─ babel (~v7)
   │  ├─ @babel/core
   │  ├─ @babel/preset-env
   │  ├─ @babel/preset-react
   │  └─ [many plugins]
   ├─ jest (~v29)
   ├─ eslint (~v8)
   │  ├─ eslint-plugin-react
   │  ├─ eslint-plugin-jsx-a11y
   │  └─ eslint-plugin-import
   ├─ postcss (8.5.6)
   │  └─ autoprefixer
   ├─ tailwindcss (3.4.19)
   ├─ react-refresh
   ├─ ws (~v8.19.0)
   └─ [Many other utilities]
```

---

## 📊 Package Statistics

| Category | Count | Purpose |
|----------|-------|---------|
| Direct Dependencies | 3 | App runtime packages |
| Tooling Dependencies | 3 | CSS/build tooling packages |
| Total Direct Declared | 6 | All packages declared in package.json |
| Transitive Dependencies | lockfile-resolved | Dependencies of declared packages |
| Vulnerabilities | 23 | Security issues (mostly low priority) |

---

## 🍎 macOS Transfer Checklist (Required)

When moving this folder from Windows to Mac, do this in order:

1. Install Node.js LTS (recommend 20.x).
2. Ensure npm is available (`npm -v`).
3. Install Xcode Command Line Tools (required for native addon builds when needed):

```bash
xcode-select --install
```

4. Open terminal in project root and do a clean install from lockfile:

```bash
rm -rf node_modules
npm ci
```

5. Start app:

```bash
npm start
```

6. If port 3000 is occupied on Mac, run with a different port:

```bash
PORT=3001 npm start
```

### Optional but Recommended on macOS
- Use `nvm` to pin Node version per project.
- Keep Git line endings safe across OSes:

```bash
git config --global core.autocrlf input
```

### If Install Fails on Mac
- Try clearing npm cache and reinstalling:

```bash
npm cache verify
rm -rf node_modules package-lock.json
npm install
```

- If native module compile errors appear, verify:
    - `xcode-select --install` completed
    - Node version is LTS (20.x recommended)

---

## 📄 Full Node Modules List (Including Transitive)

To generate a full list of every installed package on Mac:

```bash
npm ls --all --json > full-node-modules.json
```

To list only top-level installed modules:

```bash
npm ls --depth=0
```

---

## 🔒 Vulnerability Status

**Current Status:** 23 vulnerabilities found
- 17 moderate
- 6 high

**Note:** These are mostly in transitive dependencies and are typically patched by `npm audit fix`. They don't affect our project functionality.

**To Fix:**
```bash
npm audit fix
```

---

## 📥 How Packages Are Used in Build Process

### 1. **Development (`npm start`)**
```
Your Code
    ↓
ESLint (checks code quality)
    ↓
Webpack + Babel (transpiles JSX & modern JS)
    ↓
PostCSS + Tailwind (processes CSS)
    ↓
Webpack Dev Server (serves on localhost:3000)
    ↓
React-Refresh (hot reload on save)
    ↓
Browser (renders component)
```

### 2. **Production (`npm build`)**
```
Your Code
    ↓
Babel (transpiles to ES5)
    ↓
Webpack (bundles & code-splits)
    ↓
Terser (minifies JS)
    ↓
CSSnano (minifies CSS)
    ↓
Optimization plugins
    ↓
/build folder (production-ready files)
```

### 3. **Testing (`npm test`)**
```
Your Test Files
    ↓
Jest (test runner)
    ↓
Babel (transpiles tests)
    ↓
React Testing Library (component testing)
    ↓
Test Results
```

---

## 🎨 CSS Processing Pipeline

When you write CSS in MYREPOX:

```
Your CSS/Tailwind Classes
    ↓
Tailwind CSS (generates utility classes)
    ↓
PostCSS (processes @import, etc.)
    ↓
Autoprefixer (adds vendor prefixes)
    ↓
cssnano (minification in production)
    ↓
Final CSS in <head>
```

---

## 🚀 Optimization Notes

### Bundle Size Impact
- **React + React-DOM:** ~42 KB (gzipped)
- **react-scripts & tools:** ~30 MB (dev only, not in production build)
- **Production Build:** ~150-200 KB (varies based on code)

### What's NOT in Production Build
- ESLint (development only)
- Jest (testing only)
- Webpack dev server
- Source maps (unless enabled)
- Node modules folder

---

## 🔄 Updating Packages

### Check for Updates
```bash
npm outdated
```

### Update All Packages
```bash
npm update
```

### Update Specific Package
```bash
npm install package-name@latest
```

### Update Major Versions (Breaking Changes)
```bash
npm install react@latest react-dom@latest
```

---

## 📚 Common Package Operations

### Adding a New Package
```bash
npm install package-name              # For production
npm install --save-dev package-name   # For development only
```

### Removing a Package
```bash
npm uninstall package-name
```

### Installing Exact Version
```bash
npm install react@19.2.4
```

### Viewing Dependency Tree
```bash
npm ls --depth=0  # Direct dependencies only
npm ls            # Full tree
```

### Checking Security Issues
```bash
npm audit                    # Shows all vulnerabilities
npm audit fix               # Auto-fixes what it can
npm audit fix --force       # Forces fixes (may break things)
```

---

## ✅ What We Removed (Unused Packages)

The following were previously installed but removed:
- `@modelcontextprotocol/servers` - Protocol server (unused)
- `@testing-library/*` - Testing libraries (no tests in project)
- `figma` - Figma API (unused)
- `workspace` - Workspace utilities (unused)
- `ws` (WebSocket) - Already in react-scripts
- `uvu` - Alternative test runner (unused)

**Result:** Removed 117 packages, saved ~500MB+ of disk space

---

## 🎯 Why Only 3 Direct Dependencies?

**Philosophy:** Let `react-scripts` manage all build tooling

**Advantages:**
- ✅ Simplified package.json
- ✅ Consistent tooling across CRA projects
- ✅ Automatic updates to build tools
- ✅ No dependency conflicts
- ✅ Easy to understand what we directly use

**Disadvantages:**
- ❌ Can't customize build tools easily
- ❌ Locked to react-scripts versions
- ❌ More opaque build process

**If we needed custom build tools:**
- Would run `npm run eject` (one-way operation)
- Would expose webpack/babel configs
- Would manage 30+ build dependencies directly

---

## 🔍 Detailed Package Responsibilities

### Development Server Features
Provided by `react-scripts` via webpack-dev-server:
- ✅ HTTP server on port 3000
- ✅ Hot Module Replacement (HMR)
- ✅ Live reload on file changes
- ✅ Error overlay in browser
- ✅ Gzip compression
- ✅ HTTPS support
- ✅ Proxy support for API calls

### Code Quality Tools
Provided by ESLint + react-scripts:
- ✅ Syntax error detection
- ✅ React best practices
- ✅ Accessibility warnings
- ✅ Unused variable detection
- ✅ Code style enforcement
- ✅ Import/export validation

### CSS Features Supported
Provided by PostCSS + Tailwind + Autoprefixer:
- ✅ CSS Modules (`.module.css`)
- ✅ SCSS preprocessing
- ✅ Vendor prefixes (`-webkit-`, `-moz-`, etc.)
- ✅ Tailwind utility classes
- ✅ CSS-in-JS via inline styles
- ✅ CSS Grid and Flexbox
- ✅ CSS Custom Properties (variables)

### JavaScript Features Supported
Provided by Babel + react-scripts:
- ✅ ES6+ syntax (arrow functions, destructuring, etc.)
- ✅ JSX syntax
- ✅ Async/await
- ✅ Spread operator
- ✅ Class properties
- ✅ Optional chaining (`?.`)
- ✅ Nullish coalescing (`??`)

---

## 🎓 Learning Resources

### React
- Official: https://react.dev
- Hooks documentation: https://react.dev/reference/react/hooks

### React-Scripts & Create React App
- Docs: https://create-react-app.dev

### Babel
- Docs: https://babeljs.io
- REPL (test transpilation): https://babeljs.io/repl

### Webpack
- Docs: https://webpack.js.org
- Concepts: https://webpack.js.org/concepts

### PostCSS
- Docs: https://postcss.org

### Tailwind CSS
- Docs: https://tailwindcss.com
- Play CDN: https://tailwindcss.com/play

### ESLint
- Docs: https://eslint.org
- Rules: https://eslint.org/docs/rules

### Jest
- Docs: https://jestjs.io

---

## 📊 Current Project Metrics

**As of February 3, 2026:**

| Metric | Value |
|--------|-------|
| Direct Dependencies | 3 |
| Total Installed Packages | ~1299 |
| node_modules Size | ~500MB |
| Build Output (production) | ~150-200KB |
| Development Server Port | 3000 |
| Build Tool | Webpack v5 |
| JavaScript Transpiler | Babel v7 |
| CSS Framework | Tailwind v3 |
| Linter | ESLint v8 |
| Test Runner | Jest v29 |

---

## 🚨 Important Notes

### ⚠️ Do NOT Delete node_modules Manually
- Always use `npm uninstall` or delete `package-lock.json` + run `npm install`
- Deleting node_modules directly can cause inconsistencies

### ⚠️ Security Best Practices
- Run `npm audit` regularly
- Keep packages updated
- Check advisories before using new packages
- Use `npm install --save` for production dependencies only

### ⚠️ Build Configuration
- Do NOT edit webpack/babel configs without running `eject` first
- `eject` is a one-way operation - cannot be undone
- Use `SKIP_PREFLIGHT_CHECK=true` only if necessary

### ✅ Best Practices
- Always update `package.json` when adding packages
- Use `npm install` to sync with package-lock.json
- Keep `node_modules` in `.gitignore`
- Commit both `package.json` and `package-lock.json`

---

## 📝 Conclusion

**MYREPOX uses a minimal, clean dependency setup:**
- 3 direct dependencies (React ecosystem)
- ~1299 transitive dependencies (build tools via react-scripts)
- Zero custom build configuration needed
- Production-optimized output
- Professional development experience

**Recommended next steps:**
1. Run `npm audit fix` to patch vulnerabilities
2. Install any project-specific packages (if needed)
3. Keep dependencies updated monthly

---

**Last Updated:** February 3, 2026  
**Project:** MYREPOX Health Insights Platform  
**Status:** Production Ready
