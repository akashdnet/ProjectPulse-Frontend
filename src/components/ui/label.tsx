import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium text-zinc-700 dark:text-zinc-200 select-none inline-flex items-center gap-1",
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 font-bold">*</span>}
      </label>
    );
  }
);
Label.displayName = "Label";

export { Label };
