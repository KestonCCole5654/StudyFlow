import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export function Button({ variant = 'default', size = 'md', className = '', children, ...props }: ButtonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'ghost':
        return 'bg-transparent hover:bg-gray-800 text-gray-300';
      case 'outline':
        return 'border border-gray-700 bg-transparent hover:bg-gray-800 text-gray-300';
      case 'destructive':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'default':
      default:
        return 'bg-primary-600 hover:bg-primary-700 text-white';
    }
  };

  let base = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:pointer-events-none';
  let variantClass = getVariantClass();
  let sizeClass = size === 'sm'
    ? 'h-9 px-3'
    : size === 'lg'
      ? 'h-11 px-8'
      : 'h-10 px-4 py-2';

  return (
    <button className={`${base} ${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  );
} 