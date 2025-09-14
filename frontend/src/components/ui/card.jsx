// Simple Card Components
// A set of card components for creating nice containers and layouts

import React from 'react';

/**
 * Main Card Component
 * Creates a container with rounded corners, border, and shadow
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Content inside the card
 * @param {string} props.className - Additional CSS classes
 */
const Card = ({ children, className = '', ...otherProps }) => {
  const cardStyles = `
    rounded-xl border border-gray-200 bg-white 
    shadow-sm hover:shadow-md transition-shadow
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={cardStyles} {...otherProps}>
      {children}
    </div>
  );
};

/**
 * Card Header Component
 * Used for the top section of a card, typically contains title and description
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Header content
 * @param {string} props.className - Additional CSS classes
 */
const CardHeader = ({ children, className = '', ...otherProps }) => {
  const headerStyles = `
    flex flex-col space-y-1.5 p-6
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={headerStyles} {...otherProps}>
      {children}
    </div>
  );
};

/**
 * Card Title Component
 * For the main heading text in a card header
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Title text
 * @param {string} props.className - Additional CSS classes
 */
const CardTitle = ({ children, className = '', ...otherProps }) => {
  const titleStyles = `
    text-xl font-semibold leading-none tracking-tight text-gray-900
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <h3 className={titleStyles} {...otherProps}>
      {children}
    </h3>
  );
};

/**
 * Card Description Component
 * For subtitle or description text in a card header
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Description text
 * @param {string} props.className - Additional CSS classes
 */
const CardDescription = ({ children, className = '', ...otherProps }) => {
  const descriptionStyles = `
    text-sm text-gray-600
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <p className={descriptionStyles} {...otherProps}>
      {children}
    </p>
  );
};

/**
 * Card Content Component
 * For the main content area of a card
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Main content
 * @param {string} props.className - Additional CSS classes
 */
const CardContent = ({ children, className = '', ...otherProps }) => {
  const contentStyles = `
    p-6 pt-0
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={contentStyles} {...otherProps}>
      {children}
    </div>
  );
};

/**
 * Card Footer Component
 * For the bottom section of a card, typically contains actions or additional info
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Footer content
 * @param {string} props.className - Additional CSS classes
 */
const CardFooter = ({ children, className = '', ...otherProps }) => {
  const footerStyles = `
    flex items-center p-6 pt-0
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={footerStyles} {...otherProps}>
      {children}
    </div>
  );
};

// Export all card components
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
