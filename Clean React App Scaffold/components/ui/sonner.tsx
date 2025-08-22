"use client";

import { useTheme } from "next-themes@0.4.6";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:border-[var(--info-border)] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-current group-[.toast]:opacity-90",
          actionButton: "group-[.toast]:bg-[var(--button-primary-bg)] group-[.toast]:text-[var(--button-primary-text)] group-[.toast]:border-2 group-[.toast]:border-transparent group-[.toast]:min-h-[44px] hover:group-[.toast]:bg-[var(--button-primary-hover)] focus-visible:group-[.toast]:outline focus-visible:group-[.toast]:outline-2 focus-visible:group-[.toast]:outline-[var(--color-ring)] focus-visible:group-[.toast]:outline-offset-2",
          cancelButton: "group-[.toast]:bg-[var(--button-secondary-bg)] group-[.toast]:text-[var(--button-secondary-text)] group-[.toast]:border-2 group-[.toast]:border-[var(--button-secondary-border)] group-[.toast]:min-h-[44px] hover:group-[.toast]:bg-[var(--button-secondary-hover)] focus-visible:group-[.toast]:outline focus-visible:group-[.toast]:outline-2 focus-visible:group-[.toast]:outline-[var(--color-ring)] focus-visible:group-[.toast]:outline-offset-2",
          closeButton: "group-[.toast]:bg-transparent group-[.toast]:border-2 group-[.toast]:border-transparent group-[.toast]:text-current group-[.toast]:min-h-[44px] group-[.toast]:min-w-[44px] hover:group-[.toast]:bg-[var(--color-muted)] focus-visible:group-[.toast]:outline focus-visible:group-[.toast]:outline-2 focus-visible:group-[.toast]:outline-[var(--color-ring)] focus-visible:group-[.toast]:outline-offset-2",
          success: "group-[.toaster]:bg-[var(--success-bg)] group-[.toaster]:text-[var(--success-text)] group-[.toaster]:border-[var(--success-border)]",
          error: "group-[.toaster]:bg-[var(--error-bg)] group-[.toaster]:text-[var(--error-text)] group-[.toaster]:border-[var(--error-border)]",
          warning: "group-[.toaster]:bg-[var(--warning-bg)] group-[.toaster]:text-[var(--warning-text)] group-[.toaster]:border-[var(--warning-border)]",
          info: "group-[.toaster]:bg-[var(--info-bg)] group-[.toaster]:text-[var(--info-text)] group-[.toaster]:border-[var(--info-border)]",
        },
      }}
      style={
        {
          "--normal-bg": "var(--info-bg)",
          "--normal-text": "var(--info-text)",
          "--normal-border": "var(--info-border)",
          "--success-bg": "var(--success-bg)",
          "--success-text": "var(--success-text)",
          "--success-border": "var(--success-border)",
          "--error-bg": "var(--error-bg)",
          "--error-text": "var(--error-text)",
          "--error-border": "var(--error-border)",
          "--warning-bg": "var(--warning-bg)",
          "--warning-text": "var(--warning-text)",
          "--warning-border": "var(--warning-border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
