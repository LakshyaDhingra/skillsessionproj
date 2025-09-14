// Main Entry Point
// This file is the entry point for our React application
// It renders the App component into the DOM

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

/**
 * Application Entry Point
 * This code runs when the page loads and sets up our React app
 */

// Get the root element from the HTML file
const rootElement = document.getElementById('root');

// Create a React root and render our App component
const root = createRoot(rootElement);

// Render the App component
// StrictMode helps catch common bugs during development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);