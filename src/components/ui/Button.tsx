import * as React from "react";

const buttonVariants = ({
    variant = "default",
    size = "default",
    className = "",
}: {
    variant?: "default" | "icon" | "ghost";
    size?: "default" | "sm" | "lg" | "icon" | "none";
    className?: string;
} = {}) => {
    const baseStyles = "cursor-pointer flex gap-2 whitespace-nowrap outline-none transition-all disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        default: "border bg-[var(--neutral-background-raised)] border-[var(--neutral-border)] leading-[18px]",
        icon: "border bg-[var(--neutral-background-raised)] border-[var(--neutral-border)]",
        ghost: "border-transparent bg-transparent",
    };

    const sizes = {
        default: "rounded-full px-3 py-2 text-base",
        sm: "rounded-full px-2 py-1 text-sm",
        lg: "rounded-full px-6 py-3 text-lg",
        icon: "rounded-full px-3 py-2",
        none: "",
    };

    return `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.trim();
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "icon" | "ghost";
    size?: "default" | "sm" | "lg" | "icon" | "none";
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", isLoading = false, children, disabled, ...props }, ref) => {
        const isDisabled = disabled || isLoading;

        return (
            <button
                ref={ref}
                className={buttonVariants({ variant, size, className })}
                disabled={isDisabled}
                {...props}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    </div>
                ) : (
                    children
                )}
            </button>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
