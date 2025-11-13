# GEMINI.md

## Project Overview

This project is a simple, single-page web application for converting currency between US Dollars (USD) and Chinese Yuan (CNY). It features a modern, responsive user interface with both light and dark themes. The application fetches real-time exchange rates from an external API and provides a seamless, interactive experience for the user.

**Key Technologies:**

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **APIs:** `exchangerate-api.com` and `fxratesapi.com` for real-time exchange rate data.

**Architecture:**

The application follows a simple client-side architecture:

*   `index.html`: The main HTML file that defines the structure of the web page.
*   `style.css`: The stylesheet that defines the visual appearance of the application, including the responsive design and theme switching.
*   `script.js`: The core JavaScript file that handles all the application logic, including:
    *   Fetching exchange rates from the APIs.
    *   Handling user input and performing currency conversions.
    *   Managing the application state (e.g., conversion direction, theme).
    *   Updating the UI dynamically.
*   **M Tokens to Per Token Converter:** A collapsible section that allows users to input a "Cost M Tokens" value and automatically calculates "Cost Per Token" by dividing the input by 1,000,000.

## Building and Running

This is a static web project and does not require a build process. To run the application, simply open the `index.html` file in a web browser.

**Development:**

There are no specific development commands. You can edit the HTML, CSS, and JavaScript files directly and reload the page in the browser to see the changes.

## Development Conventions

*   **Code Style:** The code is written in a clean and readable format, with comments explaining the purpose of different functions and variables.
*   **File Structure:** The project follows a simple file structure, with separate files for HTML, CSS, and JavaScript.
*   **API Usage:** The application uses the Fetch API to make requests to the exchange rate APIs. It also includes a fallback mechanism to a backup API in case the primary API fails.
*   **Theme Switching:** The application supports both light and dark themes, which can be toggled by the user. The current theme is saved in the browser's local storage.
