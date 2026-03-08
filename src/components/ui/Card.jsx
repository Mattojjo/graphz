import React from 'react';

const Card = ({ children, className = '', ...rest }) => {
  return (
    <div className={`card border border-green-300 transition-colors duration-500 ease-in-out hover:border-green-400 ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default Card;
