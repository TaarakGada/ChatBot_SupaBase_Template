import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    className = '',
}) => {
    return (
        <TooltipPrimitive.Provider>
            <TooltipPrimitive.Root delayDuration={200}>
                <TooltipPrimitive.Trigger asChild>
                    {children}
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                        className={`bg-black/75 text-white px-2 py-1 rounded text-xs z-[9999] ${className}`}
                        sideOffset={5}
                    >
                        {content}
                        <TooltipPrimitive.Arrow className="fill-black/75" />
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
};
