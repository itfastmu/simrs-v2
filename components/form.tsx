import React from "react";
import { cn } from "@/lib/utils";

type InputProps = {
  className?: string;
} & React.ComponentProps<"input">;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        spellCheck={"false"}
        className={cn(
          "w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 shadow-md placeholder:text-gray-500 hover:border-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500",
          "transition-all duration-150 ease-linear",
          "dark:border-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-300 dark:focus:border-blue-500 dark:focus:ring-blue-500",
          "disabled:bg-gray-100 disabled:hover:border-gray-300 disabled:dark:bg-gray-700 disabled:hover:dark:border-gray-500",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

type InputAreaProps = {
  className?: string;
} & React.ComponentProps<"textarea">;
export const InputArea = React.forwardRef<HTMLTextAreaElement, InputAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        spellCheck={"false"}
        className={cn(
          "w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 shadow-md placeholder:text-gray-500 hover:border-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500",
          "transition-all duration-150 ease-linear",
          "dark:border-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:hover:border-gray-300 dark:focus:border-blue-500 dark:focus:ring-blue-500",
          "disabled:bg-gray-100 disabled:hover:border-gray-300 disabled:dark:bg-gray-700 disabled:hover:dark:border-gray-500",
          className
        )}
        {...props}
      />
    );
  }
);
InputArea.displayName = "InputArea";

type LabelButtonProps = {
  id: string;
  type: "radio" | "checkbox";
  children?: React.ReactNode;
  value?: string | number | readonly string[];
  className?: string;
} & React.ComponentProps<"input">;
export const LabelButton = React.forwardRef<HTMLInputElement, LabelButtonProps>(
  ({ className, id, children, type, value, ...props }, ref) => {
    return (
      <div className="group inline-flex">
        <input
          type={type}
          className="peer hidden"
          ref={ref}
          id={id}
          value={value}
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            "relative cursor-pointer select-none border border-slate-300 shadow-md group-first:rounded-l-lg group-last:rounded-r-lg dark:border-neutral-700",
            "bg-white px-2 py-1 text-gray-500",
            "peer-checked:border-2 peer-checked:border-sky-500 peer-checked:font-semibold peer-checked:tracking-wide peer-checked:text-sky-600",
            "dark:border-gray-500 dark:bg-gray-700 dark:text-white peer-checked:dark:border-sky-600 peer-checked:dark:text-sky-600",
            "peer-disabled:bg-gray-100 peer-disabled:hover:border-gray-300 peer-disabled:dark:bg-gray-700 peer-disabled:hover:dark:border-gray-500",
            className
          )}
        >
          {children}
        </label>
      </div>
    );
  }
);
LabelButton.displayName = "LabelButton";
