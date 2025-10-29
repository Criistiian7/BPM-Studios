import React, { ReactNode } from "react";

/**
 * Componenta Card - un container reutilizabil pentru conținut
 * Elimină duplicarea de styling în componente
 */
interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: "none" | "sm" | "md" | "lg";
    shadow?: "none" | "sm" | "md" | "lg";
    rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
    hover?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = "",
    padding = "md",
    shadow = "md",
    rounded = "2xl",
    hover = false,
    onClick,
}) => {
    const paddingClasses = {
        none: "",
        sm: "p-3",
        md: "p-4 sm:p-6",
        lg: "p-6 sm:p-8",
    };

    const shadowClasses = {
        none: "",
        sm: "shadow-sm",
        md: "shadow-lg",
        lg: "shadow-xl",
    };

    const roundedClasses = {
        none: "",
        sm: "rounded-sm",
        md: "rounded-lg",
        lg: "rounded-xl",
        xl: "rounded-2xl",
        "2xl": "rounded-3xl",
    };

    const baseClasses = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700";
    const hoverClasses = hover ? "hover:shadow-xl hover:-translate-y-1 transition-all duration-300" : "";
    const clickableClasses = onClick ? "cursor-pointer" : "";

    return (
        <div
            className={`${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${roundedClasses[rounded]} ${hoverClasses} ${clickableClasses} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

/**
 * Componenta ActionButton - buton de acțiune reutilizabil
 * Standardizează stilurile pentru butoanele de acțiune
 */
interface ActionButtonProps {
    onClick: () => void;
    icon: ReactNode;
    variant: "primary" | "secondary" | "danger" | "success" | "warning";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    title?: string;
    className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
    onClick,
    icon,
    variant,
    size = "md",
    disabled = false,
    title,
    className = "",
}) => {
    const sizeClasses = {
        sm: "p-1.5",
        md: "p-2",
        lg: "p-3",
    };

    const variantClasses = {
        primary: "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50",
        secondary: "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
        danger: "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/50",
        success: "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-800/50",
        warning: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-800/50",
    };

    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`${sizeClasses[size]} rounded-full transition-colors ${variantClasses[variant]} ${disabledClasses} ${className}`}
        >
            {icon}
        </button>
    );
};

/**
 * Componenta LoadingCard - card cu loading state
 * Afișează un skeleton loader în timpul încărcării
 */
interface LoadingCardProps {
    lines?: number;
    className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
    lines = 3,
    className = "",
}) => {
    return (
        <Card className={`animate-pulse ${className}`}>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                {Array.from({ length: lines }).map((_, index) => (
                    <div
                        key={index}
                        className={`h-3 bg-gray-200 dark:bg-gray-700 rounded ${index === lines - 1 ? "w-1/2" : "w-full"
                            }`}
                    ></div>
                ))}
            </div>
        </Card>
    );
};

/**
 * Componenta EmptyState - afișează starea goală
 * Standardizează mesajele pentru liste goale
 */
interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className = "",
}) => {
    return (
        <div className={`text-center py-12 ${className}`}>
            <div className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-500 mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                    {description}
                </p>
            )}
            {action && <div>{action}</div>}
        </div>
    );
};

/**
 * Componenta StatusBadge - badge pentru status-uri
 * Standardizează afișarea status-urilor
 */
interface StatusBadgeProps {
    status: string;
    variant?: "default" | "success" | "warning" | "danger" | "info";
    size?: "sm" | "md" | "lg";
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    variant = "default",
    size = "md",
    className = "",
}) => {
    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-2 text-base",
    };

    const variantClasses = {
        default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };

    return (
        <span
            className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        >
            {status}
        </span>
    );
};

/**
 * Componenta Avatar - avatar reutilizabil
 * Standardizează afișarea avatar-urilor
 */
interface AvatarProps {
    src?: string | null;
    alt?: string;
    name?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = "Avatar",
    name = "?",
    size = "md",
    className = "",
    onClick,
}) => {
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
        xl: "w-16 h-16 text-lg",
    };

    const clickableClasses = onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : "";

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div
            className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-medium text-gray-600 dark:text-gray-300 ${clickableClasses} ${className}`}
            onClick={onClick}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full rounded-full object-cover"
                />
            ) : (
                getInitials(name)
            )}
        </div>
    );
};

/**
 * Componenta SectionHeader - header pentru secțiuni
 * Standardizează header-urile secțiunilor
 */
interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    action,
    className = "",
}) => {
    return (
        <div className={`flex items-center justify-between mb-6 ${className}`}>
            <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};
