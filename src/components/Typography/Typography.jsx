import React from 'react';
import PropTypes from 'prop-types';

/**
 * Typography Component - Provides consistent text styling based on Figma specs
 * 
 * Variants:
 * - heading: Primary heading style - 20px/700
 * - bodyLarge: Onboarding text - 20px/600 with letter spacing
 * - button: Button text - 14px/600
 * - label: Input labels/tags - 12px/400
 * - link: Small links - 10px/500
 */
const Typography = ({ 
  variant = 'label', 
  children, 
  className = '', 
  as: Component = 'p',
  color = 'white',
  align = 'left',
  ...props 
}) => {
  
  // Base classes for all typography
  const baseClasses = 'font-lato';
  
  // Variant-specific classes from Figma
  const variantClasses = {
    heading: 'text-heading text-white',
    bodyLarge: 'text-body-large text-white text-center',
    button: 'text-button text-white text-center',
    label: 'text-label text-label-gray',
    link: 'text-link text-white text-center',
  };
  
  // Text alignment
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  // Determine default HTML element based on variant
  const getDefaultElement = () => {
    switch (variant) {
      case 'heading':
        return 'h1';
      case 'bodyLarge':
        return 'p';
      case 'button':
        return 'span';
      case 'label':
        return 'label';
      case 'link':
        return 'span';
      default:
        return 'p';
    }
  };
  
  const Element = Component === 'p' && variant !== 'label' ? getDefaultElement() : Component;
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${alignClasses[align]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <Element className={classes} {...props}>
      {children}
    </Element>
  );
};

Typography.propTypes = {
  /** Typography variant matching Figma design system */
  variant: PropTypes.oneOf(['heading', 'bodyLarge', 'button', 'label', 'link']),
  /** Content to render */
  children: PropTypes.node.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** HTML element to render as */
  as: PropTypes.elementType,
  /** Text color */
  color: PropTypes.oneOf(['white', 'gray']),
  /** Text alignment */
  align: PropTypes.oneOf(['left', 'center', 'right']),
};

export default Typography;
