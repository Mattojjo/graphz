import React from 'react';

const Card = ({ children, className = '', ...rest }) => {
  return (
    <div className={`card border border-green-300 transition-all duration-500 ease-in-out ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default Card;
