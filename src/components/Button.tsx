'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:hover:translate-y-0 disabled:hover:shadow-none';

    const variants = {
      primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 focus:ring-indigo-500 shadow-[0_4px_14px_0_rgb(79,70,229,0.39)]',
      secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-200 shadow-sm',
      danger: 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500 shadow-[0_4px_14px_0_rgb(244,63,94,0.39)]',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-[0_4px_14px_0_rgb(16,185,129,0.39)]',
      outline: 'border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Proses...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', variant = 'secondary', className, ...props }, ref) => {
    const sizes = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    };

    const variants = {
      primary: 'text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all duration-300 active:scale-95',
      secondary: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-all duration-300 active:scale-95',
      outline: 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all duration-300 active:scale-95 bg-white shadow-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(sizes[size], variants[variant], className)}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href: string;
  children: React.ReactNode;
}

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 no-underline hover:-translate-y-0.5 hover:shadow-lg active:scale-95';

    const variants = {
      primary: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 focus:ring-indigo-500 shadow-[0_4px_14px_0_rgb(79,70,229,0.39)]',
      secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-200 shadow-sm',
      danger: 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500 shadow-[0_4px_14px_0_rgb(244,63,94,0.39)]',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500 shadow-[0_4px_14px_0_rgb(16,185,129,0.39)]',
      outline: 'border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 focus:ring-indigo-500 bg-white/50 backdrop-blur-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <a
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </a>
    );
  }
);

LinkButton.displayName = 'LinkButton';

export function ButtonGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-2', className)}>
      {children}
    </div>
  );
}
