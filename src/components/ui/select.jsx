import React from 'react';
export const Select = ({value, onValueChange, children}) => <div className="relative">{children}</div>;
export const SelectTrigger = ({children, ...props}) => <div className="border rounded-md bg-white px-3 py-2" {...props}>{children}</div>;
export const SelectValue = ({placeholder}) => <span>{placeholder}</span>;
export const SelectContent = ({children}) => <div className="mt-2 space-y-1">{children}</div>;
export const SelectItem = ({value, children, onSelect}) => (
  <button type="button" className="block w-full text-left border rounded-md px-3 py-2 bg-white hover:bg-slate-50"
    onClick={() => onSelect ? onSelect(value) : null}>{children}</button>
);
export default Select;
