# Node Modules Guide - Fresh Setup (Mac)

Last Updated: March 26, 2026
Project: my-app (c:\Supershyft\dev-frontend)

## What to Install on a New Mac

Install these system prerequisites first:

1. Node.js LTS (recommended: 20.x)
2. npm (comes with Node.js)
3. Xcode Command Line Tools

```bash
xcode-select --install
```

Optional but recommended:

4. nvm (Node Version Manager) to manage Node versions

## Project Dependencies (from package.json)

You do not need to install these one by one if you run `npm ci` or `npm install`.

Runtime dependencies:
- react ^19.2.4
- react-dom ^19.2.4
- react-scripts 5.0.1

Dev dependencies:
- autoprefixer ^10.4.23
- postcss ^8.5.6
- tailwindcss ^3.4.19

## From-Scratch Install Steps (Folder Cleared)

Run this from the project root:

```bash
pwd
ls
```

Confirm these files exist:
- package.json
- package-lock.json (if present, prefer `npm ci`)

### Recommended install (lockfile present)

```bash
npm ci
```

### Fallback install (if lockfile missing)

```bash
npm install
```

## Run the App

```bash
npm start
```

If port 3000 is busy:

```bash
PORT=3001 npm start
```

## Verify Everything Installed Correctly

```bash
npm ls --depth=0
```

Expected top-level packages include:
- react
- react-dom
- react-scripts
- autoprefixer
- postcss
- tailwindcss

## If Install Fails

1. Verify Node version:

```bash
node -v
npm -v
```

2. Clear cache and reinstall:

```bash
npm cache verify
rm -rf node_modules
npm install
```

3. Ensure Xcode CLI tools are installed:

```bash
xcode-select -p
```

## Notes

- Never copy `node_modules` from Windows to Mac.
- Always reinstall on Mac using `npm ci` or `npm install`.
- Commit `package.json` and `package-lock.json` so installs stay reproducible.