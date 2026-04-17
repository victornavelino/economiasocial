import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded font-semibold transition-colors disabled:opacity-50';
  const variants = {
    primary: 'text-white',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'text-white',
  };

  const inlineStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: '#1a6fa0' },
    secondary: {},
    danger: {},
    success: { backgroundColor: '#8dc63f' },
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={inlineStyles[variant]}
      {...props}
    >
      {children}
    </button>
  );
}