import React from 'react';
export const Card = ({className='', ...props}) => <div className={`bg-white border rounded-2xl shadow-sm ${className}`} {...props} />;
export const CardHeader = ({className='', ...props}) => <div className={`p-4 ${className}`} {...props} />;
export const CardTitle = ({className='', ...props}) => <h3 className={`font-medium ${className}`} {...props} />;
export const CardContent = ({className='', ...props}) => <div className={`p-4 pt-0 ${className}`} {...props} />;
export default Card;
