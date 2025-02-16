import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

interface ProvidersProps {
    children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
    return (
        <TooltipPrimitive.Provider delayDuration={200}>
            {children}
        </TooltipPrimitive.Provider>
    );
};
