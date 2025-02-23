import React from 'react';

export const LoadingSkeleton = () => {
    return (
        <div className="flex justify-start">
            <div className="max-w-[70%] min-w-[40%] rounded-2xl px-4 py-3 bg-gray-200/10">
                <div className="space-y-2">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200/20 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200/20 rounded w-1/2 mt-2"></div>
                    </div>
                    <div className="text-xs mt-2 opacity-50">Now</div>
                </div>
            </div>
        </div>
    );
};
