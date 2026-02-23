import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type AlertLevel = 'info' | 'warning' | 'error';

type UiAlertProps = {
    level: string;
    title?: string;
    message: string;
    icon?: React.ReactNode;
    onClose?: () => void;
};

const alertStyles: Record<string, string> = {
    info: 'bg-[var(--alert-info-bg)]    border-[var(--alert-info-border)]    text-[var(--alert-info-text)]',
    warning: 'bg-[var(--alert-warning-bg)] border-[var(--alert-warning-border)] text-[var(--alert-warning-text)]',
    error: 'bg-[var(--alert-error-bg)]   border-[var(--alert-error-border)]   text-[var(--alert-error-text)]',
};

const defaultIcons: Record<string, React.ReactNode> = {
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />,
    error: <AlertCircle size={20} />,
};

export function AlertBox({ level, title, message, icon, onClose }: UiAlertProps) {
    return (
        <div
            className={`
                flex items-start justify-between gap-4
                rounded-lg border p-4 ${alertStyles[level]}
            `}
        >
            <div className="flex items-start gap-4 flex-1">
                {icon ?? defaultIcons[level]}
                <div className="space-y-1">
                    {title && <div className="font-medium">{title}</div>}
                    <div className="text-[15px] leading-tight">{message}</div>
                </div>
            </div>

            {onClose && (
                <Button
                    variant="ghost"
                    size="none"
                    onClick={onClose}
                    className="text-current/70 hover:text-current mt-0.5 transition-colors !p-0"
                    aria-label="Close"
                >
                    <X size={18} />
                </Button>
            )}
        </div>
    );
}