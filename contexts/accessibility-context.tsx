'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type AccessibilitySettings = {
    fontSize: 'normal' | 'large' | 'larger';
    contrastMode: 'normal' | 'high';
};

type AccessibilityContextType = {
    settings: AccessibilitySettings;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    toggleContrastMode: () => void;
    resetSettings: () => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const defaultSettings: AccessibilitySettings = {
    fontSize: 'normal',
    contrastMode: 'normal',
};

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('accessibility-settings');
        if (stored) {
            try {
                setSettings(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse accessibility settings');
            }
        }
    }, []);

    // Save to localStorage and apply to document
    useEffect(() => {
        localStorage.setItem('accessibility-settings', JSON.stringify(settings));

        // Apply font size class
        document.documentElement.classList.remove('font-large', 'font-larger');
        if (settings.fontSize !== 'normal') {
            document.documentElement.classList.add(`font-${settings.fontSize}`);
        }

        // Apply contrast mode class
        document.documentElement.classList.toggle('high-contrast', settings.contrastMode === 'high');
    }, [settings]);

    const increaseFontSize = () => {
        setSettings((prev) => ({
            ...prev,
            fontSize: prev.fontSize === 'normal' ? 'large' : prev.fontSize === 'large' ? 'larger' : 'larger',
        }));
    };

    const decreaseFontSize = () => {
        setSettings((prev) => ({
            ...prev,
            fontSize: prev.fontSize === 'larger' ? 'large' : prev.fontSize === 'large' ? 'normal' : 'normal',
        }));
    };

    const toggleContrastMode = () => {
        setSettings((prev) => ({
            ...prev,
            contrastMode: prev.contrastMode === 'normal' ? 'high' : 'normal',
        }));
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
    };

    return (
        <AccessibilityContext.Provider
            value={{
                settings,
                increaseFontSize,
                decreaseFontSize,
                toggleContrastMode,
                resetSettings,
            }}
        >
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
}
