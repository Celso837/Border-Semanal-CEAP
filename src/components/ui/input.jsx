import React from 'react';
export const Input = React.forwardRef(({className='', ...props}, ref) => <input ref={ref} className={`w-full border rounded-md px-3 py-2 bg-white ${className}`} {...props} />);
export default Input;
