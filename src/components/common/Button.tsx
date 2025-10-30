import React, { type ButtonHTMLAttributes, type ReactNode } from "react";

// Interfața pentru proprietățile componentei Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "success";  // Tipul de buton
    size?: "sm" | "md" | "lg";                                 // Mărimea butonului
    isLoading?: boolean;                                       // Dacă butonul este în starea de loading
    icon?: ReactNode;                                          // Iconița opțională
    children: ReactNode;                                        // Conținutul butonului
}

/**
 * Componenta Button - un buton reutilizabil cu diferite stiluri și mărimi
 * 
 * @param variant - Tipul de buton (primary, secondary, danger, success)
 * @param size - Mărimea butonului (sm, md, lg)
 * @param isLoading - Dacă butonul afișează loading spinner
 * @param icon - Iconița opțională
 * @param children - Textul sau conținutul butonului
 * @param className - Clase CSS suplimentare
 * @param disabled - Dacă butonul este dezactivat
 * @param props - Alte proprietăți HTML pentru buton
 */
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
    // Clasele de bază pentru toate butoanele
    const baseClasses =
        "rounded-lg font-medium transition-all focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2";

    // Clasele pentru diferite variante de culori
    const variantClasses = {
        primary:
            "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
        secondary:
            "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
        success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    };

    // Clasele pentru diferite mărimi
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
            {/* Afișează loading spinner dacă isLoading este true */}
            {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
                icon
            )}
            {children}
        </button>
    );
};

