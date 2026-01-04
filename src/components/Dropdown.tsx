import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

export interface DropdownItem {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'danger';
}

interface DropdownProps {
    trigger: React.ReactNode;
    items: DropdownItem[];
    align?: 'left' | 'right';
    className?: string;
}

export function Dropdown({ trigger, items, align = 'right', className }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={cn(
                        "absolute z-50 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100",
                        align === 'right' ? "right-0 origin-top-right" : "left-0 origin-top-left"
                    )}
                >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {items.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    item.onClick();
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "flex items-center w-full px-4 py-2 text-sm transition-colors",
                                    item.variant === 'danger'
                                        ? "text-red-600 hover:bg-red-50"
                                        : "text-gray-700 hover:bg-gray-100"
                                )}
                                role="menuitem"
                            >
                                {item.icon && <span className="mr-3 h-4 w-4">{item.icon}</span>}
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
