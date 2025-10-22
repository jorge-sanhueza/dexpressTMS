import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-[#798283]/30 bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus:outline-none focus:border-[#D42B22] focus:ring-1 focus:ring-[#D42B22] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
