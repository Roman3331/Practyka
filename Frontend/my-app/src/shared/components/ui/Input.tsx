import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  containerClassName?: string;
}

export const Input = ({
  label,
  icon: Icon,
  error,
  className = '',
  containerClassName = '',
  ...props
}: InputProps) => {
  return (
    <div className={`space-y-1 w-full ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-slate-400 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" 
            size={18} 
          />
        )}
        <input
          className={`
            w-full bg-slate-950/40 border border-white/10 rounded-2xl py-3.5 pr-4 outline-none transition-all placeholder:text-slate-600 text-white
            ${Icon ? 'pl-12' : 'pl-4'}
            ${error ? 'border-red-500 ring-1 ring-red-500/20' : 'focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>
      )}
    </div>
  );
};
