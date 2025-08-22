import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";

import { cn } from "./utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current transition-colors duration-200 min-h-[44px] focus-within:outline focus-within:outline-2 focus-within:outline-ring focus-within:outline-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[var(--info-bg)] text-[var(--info-text)] border-[var(--info-border)]",
        success: "bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]",
        warning: "bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]",
        error: "bg-[var(--error-bg)] text-[var(--error-text)] border-[var(--error-border)]",
        destructive: "bg-[var(--error-bg)] text-[var(--error-text)] border-[var(--error-border)]",
        info: "bg-[var(--info-bg)] text-[var(--info-text)] border-[var(--info-border)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      tabIndex={-1}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight text-current",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-current opacity-90 col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
