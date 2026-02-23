import { AppSettings } from './types';

export const copyPrompt = async (prompt: string, variable: string, settings: AppSettings) => {
    let finalPrompt = prompt;

    if (variable.trim()) {
        if (finalPrompt.includes('{{var}}')) {
            finalPrompt = finalPrompt.replace(/{{var}}/g, variable);
        } else {
            if (settings.autoInsertPosition === 'start') {
                finalPrompt = `${variable}, ${finalPrompt}`;
            } else {
                finalPrompt = `${finalPrompt}, ${variable}`;
            }
        }
    }

    try {
        await navigator.clipboard.writeText(finalPrompt);
        return true;
    } catch (err) {
        console.error('Failed to copy: ', err);
        return false;
    }
};
