import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface OdometerProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
}

export const Odometer: React.FC<OdometerProps> = ({ value, duration = 2000, prefix = '', suffix = '' }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "0px" });

    useEffect(() => {
        if (!isInView) return;

        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setDisplayValue(Math.floor(progress * value));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [value, duration, isInView]);

    return (
        <span ref={ref}>
            {prefix}
            {displayValue.toLocaleString()}
            {suffix}
        </span>
    );
};
