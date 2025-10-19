import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "success";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    icon?: ReactNode;
    children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    size = "md",
    isLoading = false,
    icon,
    children,
    className = "",
    disabled,
    ...props
}) => {
    const baseClasses =
        "rounded-lg font-medium transition-all focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2";

    const variantClasses = {
        primary:
            "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
        secondary:
            "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
        success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    };

    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-6 py-3",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <button
            className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `.trim()}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
                icon
            )}
            {children}
        </button>
    );
};

