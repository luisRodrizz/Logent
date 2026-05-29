import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-sm shadow-blue-950/10 hover:bg-[#0E16B8] focus-visible:ring-primary',
  secondary:
    'border border-border bg-white text-foreground hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-[#14B8A6]',
  ghost: 'text-slate-600 hover:bg-[#14B8A6]/10 hover:text-foreground focus-visible:ring-[#14B8A6]',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export function Button({ className, size = 'md', type = 'button', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      type={type}
      {...props}
    />
  )
}
