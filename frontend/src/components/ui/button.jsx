import * as React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
    default:
        "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline:
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost:
        "hover:bg-accent hover:text-accent-foreground",
    destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const buttonSizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-xl px-8 text-base",
    icon: "h-10 w-10",
};

const Button = React.forwardRef(
    (
        {
            className,
            variant = "default",
            size = "default",
            asChild = false,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? React.Fragment : "button";

        if (asChild) {
            return React.cloneElement(props.children, {
                className: cn(
                    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary disabled:pointer-events-none disabled:opacity-50",
                    buttonVariants[variant],
                    buttonSizes[size],
                    className,
                    props.children.props.className
                ),
            });
        }

        return (
            <Comp
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                    buttonVariants[variant],
                    buttonSizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button };