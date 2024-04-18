"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { VscLoading } from "react-icons/vsc";

type ButtonProps = {
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  color?: string;
  loading?: boolean;
  loadingMessage?: string;
} & React.ComponentProps<"button"> &
  VariantProps<typeof colorButtonVariant>;

const colorButtonVariant = cva("", {
  variants: {
    color: {
      amber:
        "bg-amber-500 enabled:hover:bg-amber-600 enabled:active:bg-amber-700",
      amber100:
        "bg-amber-100 text-amber-500 enabled:hover:bg-amber-200 enabled:active:bg-amber-300 dark:text-amber-600",
      cyan: "bg-cyan-500 enabled:hover:bg-cyan-600 enabled:active:bg-cyan-700",
      cyan100:
        "bg-cyan-100 text-cyan-500 enabled:hover:bg-cyan-200 enabled:active:bg-cyan-300 dark:text-cyan-600",
      green:
        "bg-green-500 enabled:hover:bg-green-600 enabled:active:bg-green-700",
      green100:
        "bg-green-100 text-green-500 enabled:hover:bg-green-200 enabled:active:bg-green-300 dark:text-green-600",
      red: "bg-red-500 enabled:hover:bg-red-600 enabled:active:bg-red-700",
      red100:
        "bg-red-100 text-red-500 enabled:hover:bg-red-200 enabled:active:bg-red-300 dark:text-red-600",
      sky: "bg-sky-500 enabled:hover:bg-sky-600 enabled:active:bg-sky-700",
      sky700: "bg-sky-700 enabled:hover:bg-sky-800 disabled:bg-sky-900",
      slatesky:
        "rounded-full bg-slate-200 enabled:active:bg-slate-300 dark:bg-gray-800 enabled:dark:active:bg-gray-900 font-semibold text-sky-600",
    },
  },
  defaultVariants: { color: "sky700" },
});

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      disabled,
      className = "",
      type,
      color,
      loading,
      loadingMessage = "Processing...",
      ...props
    },
    ref
  ) => {
    return (
      <button
        {...props}
        type={type || "button"}
        className={cn(
          "inline-flex items-center rounded p-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-0 disabled:opacity-50",
          loading ? "disabled:cursor-progress" : "disabled:cursor-not-allowed",
          colorButtonVariant({ color }),
          className
        )}
        ref={ref}
        disabled={loading || disabled ? true : false}
      >
        {loading ? (
          <>
            <span>
              <VscLoading className="mr-1.5 inline h-4 w-4 animate-spin" />
            </span>
            <span>{loadingMessage}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

type ButtonTransparentProps = {
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  color?: string;
  loading?: boolean;
  loadingMessage?: string;
} & React.ComponentProps<"button"> &
  VariantProps<typeof colorButtonTransparentVariant>;

const colorButtonTransparentVariant = cva("", {
  variants: {
    color: {
      amber:
        "border border-amber-500 bg-transparent text-amber-500 enabled:active:bg-amber-100 disabled:bg-amber-100",
      cyan: "border border-cyan-500 bg-transparent text-cyan-500 enabled:active:bg-cyan-100 disabled:bg-cyan-100",
      green:
        "border border-green-500 bg-transparent text-green-500 enabled:active:bg-green-100 disabled:bg-green-100",
      red: "border border-red-500 bg-transparent text-red-500 enabled:active:bg-red-100 disabled:bg-red-100",
      sky: "border border-sky-500 bg-transparent text-sky-500 enabled:active:bg-sky-100 disabled:bg-sky-100",
    },
  },
  defaultVariants: { color: "sky" },
});

const ButtonTransparent = React.forwardRef<
  HTMLButtonElement,
  ButtonTransparentProps
>(
  (
    {
      children,
      disabled,
      className = "",
      color,
      type,
      loading,
      loadingMessage = "Processing...",
      ...props
    },
    ref
  ) => {
    return (
      <button
        {...props}
        type={type || "button"}
        className={cn(
          "inline-flex items-center rounded-lg p-2.5 text-center text-sm font-medium focus:outline-none disabled:opacity-50",
          loading ? "disabled:cursor-progress" : "disabled:cursor-not-allowed",
          colorButtonTransparentVariant({ color }),
          className
        )}
        ref={ref}
        disabled={loading || disabled ? true : false}
      >
        {loading ? (
          <>
            <span>
              <VscLoading className="mr-1.5 inline h-4 w-4 animate-spin" />
            </span>
            <span>{loadingMessage}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
ButtonTransparent.displayName = "ButtonTransparent";

export { Button, ButtonTransparent };
