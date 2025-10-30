# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

人民币美元双向汇率转换器 (USDtoCNY) - A modern, bidirectional currency converter web application supporting USD↔CNY conversions with real-time exchange rates.

**Tech Stack**: Pure frontend - HTML5, CSS3, Vanilla JavaScript (ES6+)
**Deployment**: Static site - runs directly in browser, no build process or server required

## Running the Project

### Local Development
```pwsh
# Open directly in default browser
Start-Process index.html

# Or use a simple HTTP server
npx serve .
# Then visit http://localhost:3000
```

### Testing
Open `index.html` in any modern browser (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)

## Architecture

### File Structure
- `index.html` - Main page with semantic HTML structure
- `script.js` - Core application logic and API handling
- `style.css` - Complete styling including dark/light theme modes

### Key Components

#### Conversion System
- **Dual-direction conversion**: Supports both USD→CNY and CNY→USD
- **Default mode**: USD→CNY (most common use case)
- **Real-time calculation**: Input triggers immediate conversion using stored exchange rates
- **State management**: `isUsdToCny` boolean controls conversion direction

#### Exchange Rate APIs
The application uses a multi-tier API strategy:
1. **Primary APIs**: ExchangeRate-API for both directions (USD and CNY base)
2. **Backup APIs**: FXRatesAPI as fallback
3. **Fallback mode**: Simulated rates with 5% variation if all APIs fail

Both `currentUsdToCnyRate` and `currentCnyToUsdRate` are fetched simultaneously on initialization using `Promise.all()`.

#### Theme System
- **Modes**: Dark (default) and Light
- **Persistence**: Theme preference stored in localStorage
- **Toggle**: Theme button in footer with animated transitions
- **Styling**: Comprehensive theme-specific CSS variables in body.light-mode selectors

### Critical Functions

- `fetchExchangeRate()` - Orchestrates parallel API calls for both conversion directions
- `performConversion(amount)` - Executes conversion calculation based on current direction
- `switchConversionDirection()` - Toggles between USD→CNY and CNY→USD modes
- `updateUI()` - Syncs all UI elements with current conversion state

## Development Guidelines

### When Adding Features
- All state is stored in global variables at top of `script.js`
- Event listeners are centralized in `setupEventListeners()`
- Keep the single-file structure - this is intentionally a simple, dependency-free project

### When Modifying APIs
- Update both primary and backup API URLs
- Ensure both USD→CNY and CNY→USD directions are handled
- Test the fallback chain: primary → backup → simulated

### When Styling
- Use the existing design system (gradient backgrounds, glassmorphism effects)
- Add both dark mode and light mode styles using `.light-mode` prefix
- Maintain consistency with Inter font and existing color scheme
- Test responsive behavior on mobile viewports

### When Editing HTML
- Maintain semantic structure and ARIA labels for accessibility
- SVG icons are inline for simplicity
- Keep element IDs consistent with JavaScript references

## Common Development Tasks

### Adding New Currency Pairs
Would require significant refactoring:
1. Extend state management beyond binary `isUsdToCny`
2. Update API fetching logic for additional currency codes
3. Modify UI to support currency selection dropdown

### Modifying Exchange Rate Display
- Update `updateExchangeRates()` function
- Adjust `.rate-value` and `.rate-label` styling in CSS
- Consider both conversion directions

### Adjusting Conversion Precision
- Modify `.toFixed()` precision in `performConversion()`
- Update `formatNumber()` for display formatting

## Keyboard Shortcuts
- **Enter** (in input): Blur input field
- **F5 or Ctrl+R**: Refresh exchange rates (preventDefault to avoid page reload)
- **Shift+Tab**: Quick toggle conversion direction

## Notes
- No package.json or dependencies - intentionally kept minimal
- No build process - direct browser execution
- All external resources (fonts, icons) are loaded via CDN or inline SVG
- Chinese language used for UI labels
