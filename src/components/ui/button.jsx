import React from 'react';
export const Button = React.forwardRef(({className='', variant='default', size='', children, ...props}, ref) => {
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50',
    ghost: 'hover:bg-slate-100 bg-transparent'
  };
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    default: 'px-3 py-2',
    icon: 'p-2'
  };
  return <button ref={ref} className={`rounded-md ${variants[variant]||variants.default} ${sizes[size||'default']} ${className}`} {...props}>{children}</button>;
});
export default Button;
