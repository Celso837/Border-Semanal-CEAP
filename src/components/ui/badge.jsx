import React from 'react';
export const Badge = ({className='', children}) => <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full border ${className}`}>{children}</span>;
export default Badge;
