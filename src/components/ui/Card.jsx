import React from 'react';

const Card = ({ children, className = '', ...rest }) => {
  return (
    <div className={`card border-2 border-green-500 ${className}`} {...rest}>
      {children}
    </div>
  );
};

export default Card;
