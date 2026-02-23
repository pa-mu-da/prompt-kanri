import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const CATEGORY_COLORS = {
    style: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        accent: 'bg-blue-500 dark:bg-blue-600',
        text: 'text-blue-700 dark:text-blue-300',
    },
    subject: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        accent: 'bg-emerald-500 dark:bg-emerald-600',
        text: 'text-emerald-700 dark:text-emerald-300',
    },
};
