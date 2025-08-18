import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "./utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Apply interactive token styles for default variant
    const interactiveStyle: React.CSSProperties = variant === 'default' ? {
      background: 'var(--button-bg, var(--color-primary))',
      color: 'var(--button-fg, var(--color-primary-foreground))',
      border: '1px solid var(--button-border, var(--color-border))',
      ...style
    } : style || {};

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={interactiveStyle}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

// Export a simple button function for backward compatibility
export function SimpleButton({ variant = 'default', ...props }: any) {
  const baseStyle: React.CSSProperties = {
    background: 'var(--button-bg, var(--color-primary))',
    color: 'var(--button-fg, var(--color-primary-foreground))',
    border: '1px solid var(--button-border, var(--color-border))',
    borderRadius: '8px',
    padding: '6px 12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px'
  };

  const ghostStyle: React.CSSProperties = {
    background: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)'
  };

  const finalStyle = variant === 'ghost' ? { ...baseStyle, ...ghostStyle } : baseStyle;

  return (
    <button 
      {...props} 
      style={{ ...finalStyle, ...(props.style || {}) }}
      onMouseOver={(e) => {
        if (variant !== 'ghost') {
          const hover = getComputedStyle(document.documentElement).getPropertyValue('--button-bg-hover').trim();
          if (hover) e.currentTarget.style.background = hover;
        } else {
          e.currentTarget.style.background = 'var(--color-muted)';
        }
        props.onMouseOver?.(e);
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = variant === 'ghost' ? 'transparent' : 'var(--button-bg, var(--color-primary))';
        props.onMouseOut?.(e);
      }}
    />
  );
}