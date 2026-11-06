import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
    default:
        "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",

    secondary:
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",

    outline:
        "border border-border bg-transparent text-foreground",

    success:
        "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

    destructive:
        "border-transparent bg-destructive text-destructive-foreground",

    warning:
        "border-transparent bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
};

function Badge({
    className,
    variant = "default",
    ...props
}) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                badgeVariants[variant],
                className
            )}
            {...props}
        />
    );
}

export { Badge };