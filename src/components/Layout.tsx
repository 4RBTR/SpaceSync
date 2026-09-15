'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface OptionalChildrenLayoutProps {
  children?: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: LayoutProps) {
  return (
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12', className)}>
      {children}
    </div>
  );
}

export function Card({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-8 transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(79,70,229,0.12)] hover:border-indigo-200 dark:hover:border-indigo-900/50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-6 pb-5 border-b border-slate-100 dark:border-slate-800/80', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-xl font-bold font-heading text-slate-900 dark:text-white tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  );
}

export function Grid({
  children,
  className,
  cols = 1,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { cols?: number }) {
  return (
    <div
      className={cn(
        `grid gap-6 md:gap-8`,
        {
          'grid-cols-1': cols === 1,
          'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2': cols === 2,
          'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3': cols === 3,
          'sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4': cols === 4,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Section({
  children,
  className,
  title,
  description,
}: OptionalChildrenLayoutProps & { title?: string; description?: string }) {
  return (
    <div className={cn('mb-16', className)}>
      {title && (
        <h2 className="text-3xl md:text-4xl font-extrabold font-heading mb-3 text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
      )}
      {description && <p className="text-slate-500 dark:text-slate-400 mb-8 text-base md:text-lg max-w-3xl leading-relaxed">{description}</p>}
      {children}
    </div>
  );
}

export function PageHeader({
  children,
  className,
  title,
  description,
  action,
}: OptionalChildrenLayoutProps & {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn('mb-10', className)}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 pb-6 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          {title && (
            <h1 className="text-3xl md:text-5xl font-black font-heading tracking-tight text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-indigo-200 dark:to-indigo-400">
              {title}
            </h1>
          )}
          {description && <p className="text-slate-500 dark:text-slate-400 mt-3 text-base md:text-lg max-w-2xl font-normal leading-relaxed">{description}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}

