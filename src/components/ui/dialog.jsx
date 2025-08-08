import React from 'react';
export const Dialog = ({children}) => <>{children}</>;
export const DialogTrigger = ({asChild, children}) => children;
export const DialogContent = ({children}) => <div className="fixed inset-0 hidden">{children}</div>;
export const DialogHeader = ({children}) => <div>{children}</div>;
export const DialogTitle = ({children}) => <h3 className="text-lg font-medium">{children}</h3>;
export default Dialog;
