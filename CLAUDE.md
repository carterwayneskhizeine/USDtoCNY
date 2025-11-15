# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuickConversion is a pure frontend web application for USD/CNY currency conversion with additional utility tools. It's designed for configuring LiteLLM config.yaml files and includes token cost calculation and storage unit conversion features.

## Architecture

### Core Technology Stack
- **Frontend**: vanilla JavaScript (ES6+), HTML5, CSS3
- **Deployment**: Static hosting on Netlify (https://usdtocny.netlify.app/)
- **No build process**: Direct file serving, no bundling or compilation

### Application Structure

The application follows a modular JavaScript architecture:

- **Main entry**: `script.js` contains all application logic (692 lines)
- **Global state management**: Variables at top of script.js manage rates, conversion direction, theme
- **Event-driven UI**: DOM event listeners with debounced input handling
- **API layer**: Multi-source exchange rate fetching with fallback mechanisms

### Key Modules in script.js

1. **Exchange Rate Module (lines 240-401)**:
   - Dual API sources (exchangerate-api.com + fxratesapi.com backup)
   - Simulated rates with time-based variation when APIs fail
   - Concurrent fetching using Promise.all()

2. **Conversion Engine (lines 129-157, 569-640)**:
   - Real-time currency conversion
   - Token cost calculator (M tokens → per token cost)
   - Storage unit converter (K/M/G/T/P → bytes using decimal system)

3. **UI Management (lines 190-237, 427-498)**:
   - Dynamic UI updates based on conversion direction
   - Theme switching (dark/light modes) with localStorage persistence
   - Notification system with auto-dismiss

4. **Clipboard Integration (lines 642-689)**:
   - Paste functionality for input fields
   - Copy functionality for results
   - Visual feedback on clipboard operations

### CSS Architecture

- **Theme system**: CSS classes for light/dark modes with CSS variables
- **Component-based**: Modular CSS for UI cards, inputs, buttons
- **Responsive design**: Mobile-first approach with flexbox layout
- **Glass morphism**: backdrop-filter effects with transparency

## Development Workflow

### Local Development
```bash
# Serve the files locally - any static server works
python -m http.server 8000
# or
npx serve .
# then visit http://localhost:8000
```

### No Build Process
This is a static web application - there are no build scripts, package.json, or dependencies. Simply open `index.html` in a browser or serve via HTTP server.

## API Configuration

Exchange rate APIs are hardcoded in script.js (lines 36-39):
- Primary: exchangerate-api.com
- Backup: fxratesapi.com

The application includes a sophisticated fallback system using simulated rates based on mathematical functions when external APIs fail.

## Key Features to Maintain

1. **Real-time Conversion**: Input triggering immediate calculation
2. **Multi-API Resilience**: Primary + backup API sources
3. **Theme Persistence**: User preference saved in localStorage
4. **Clipboard Support**: Modern async clipboard API
5. **Keyboard Shortcuts**: Enter, F5, Shift+Tab for common actions
6. **Mobile Responsive**: Touch-friendly interface design

## Code Style Notes

- JavaScript uses modern ES6+ features but maintains browser compatibility
- CSS uses modern features like backdrop-filter, CSS variables
- No framework dependencies - pure vanilla implementation
- Error handling throughout API calls and user input validation
- Comprehensive logging for debugging API failures

## Deployment

Simply push the static files to Netlify (or any static host). No build steps required.