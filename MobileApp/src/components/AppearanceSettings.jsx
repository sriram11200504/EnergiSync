import { useState, useEffect } from 'react';
import {
    Palette,
    Check,
    Sun,
    Moon,
    Droplet,
    Leaf
} from 'lucide-react';
import './AppearanceSettings.css';

const AppearanceSettings = () => {
    const [selectedTheme, setSelectedTheme] = useState('dark');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const themes = [
        {
            id: 'dark',
            name: 'Dark',
            description: 'Default dark theme with energy accents',
            icon: Moon,
            colors: {
                primary: 'hsl(142, 71%, 45%)',
                secondary: 'hsl(210, 100%, 56%)',
                background: 'hsl(220, 26%, 14%)',
                card: 'hsl(220, 26%, 16%)',
                text: 'hsl(0, 0%, 98%)'
            }
        },
        {
            id: 'light',
            name: 'Light',
            description: 'Clean light theme for daytime use',
            icon: Sun,
            colors: {
                primary: 'hsl(142, 71%, 45%)',
                secondary: 'hsl(210, 100%, 56%)',
                background: 'hsl(0, 0%, 98%)',
                card: 'hsl(0, 0%, 100%)',
                text: 'hsl(220, 26%, 14%)'
            }
        },
        {
            id: 'blue',
            name: 'Ocean Blue',
            description: 'Calming blue tones',
            icon: Droplet,
            colors: {
                primary: 'hsl(210, 100%, 56%)',
                secondary: 'hsl(195, 100%, 50%)',
                background: 'hsl(220, 30%, 12%)',
                card: 'hsl(220, 30%, 15%)',
                text: 'hsl(0, 0%, 98%)'
            }
        },
        {
            id: 'green',
            name: 'Forest Green',
            description: 'Natural green theme',
            icon: Leaf,
            colors: {
                primary: 'hsl(142, 71%, 45%)',
                secondary: 'hsl(160, 84%, 39%)',
                background: 'hsl(140, 20%, 12%)',
                card: 'hsl(140, 20%, 15%)',
                text: 'hsl(0, 0%, 98%)'
            }
        }
    ];

    // Load saved theme on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('energysync-theme');
        if (savedTheme) {
            setSelectedTheme(savedTheme);
            applyTheme(savedTheme);
        }
    }, []);

    const applyTheme = (themeId) => {
        const theme = themes.find(t => t.id === themeId);
        if (!theme) return;

        const root = document.documentElement;

        // Apply theme-specific colors
        if (themeId === 'light') {
            // Light theme
            root.style.setProperty('--primary-green', theme.colors.primary);
            root.style.setProperty('--secondary-blue', theme.colors.secondary);
            root.style.setProperty('--bg-primary', 'hsl(0, 0%, 98%)');
            root.style.setProperty('--bg-secondary', 'hsl(0, 0%, 95%)');
            root.style.setProperty('--bg-tertiary', 'hsl(0, 0%, 92%)');
            root.style.setProperty('--bg-card', 'hsl(0, 0%, 100%)');
            root.style.setProperty('--bg-hover', 'hsl(0, 0%, 90%)');
            root.style.setProperty('--text-primary', 'hsl(220, 26%, 14%)');
            root.style.setProperty('--text-secondary', 'hsl(220, 26%, 35%)');
            root.style.setProperty('--text-tertiary', 'hsl(220, 26%, 55%)');
            root.style.setProperty('--border-color', 'hsl(0, 0%, 85%)');
            root.style.setProperty('--border-light', 'hsl(0, 0%, 75%)');
        } else if (themeId === 'blue') {
            // Blue theme
            root.style.setProperty('--primary-green', theme.colors.primary);
            root.style.setProperty('--secondary-blue', theme.colors.secondary);
            root.style.setProperty('--bg-primary', 'hsl(220, 30%, 12%)');
            root.style.setProperty('--bg-secondary', 'hsl(220, 30%, 14%)');
            root.style.setProperty('--bg-tertiary', 'hsl(220, 30%, 18%)');
            root.style.setProperty('--bg-card', 'hsl(220, 30%, 15%)');
            root.style.setProperty('--bg-hover', 'hsl(220, 30%, 20%)');
            root.style.setProperty('--text-primary', 'hsl(0, 0%, 98%)');
            root.style.setProperty('--text-secondary', 'hsl(0, 0%, 75%)');
            root.style.setProperty('--text-tertiary', 'hsl(0, 0%, 55%)');
            root.style.setProperty('--border-color', 'hsl(220, 30%, 25%)');
            root.style.setProperty('--border-light', 'hsl(220, 30%, 30%)');
        } else if (themeId === 'green') {
            // Green theme
            root.style.setProperty('--primary-green', theme.colors.primary);
            root.style.setProperty('--secondary-blue', theme.colors.secondary);
            root.style.setProperty('--bg-primary', 'hsl(140, 20%, 12%)');
            root.style.setProperty('--bg-secondary', 'hsl(140, 20%, 14%)');
            root.style.setProperty('--bg-tertiary', 'hsl(140, 20%, 18%)');
            root.style.setProperty('--bg-card', 'hsl(140, 20%, 15%)');
            root.style.setProperty('--bg-hover', 'hsl(140, 20%, 20%)');
            root.style.setProperty('--text-primary', 'hsl(0, 0%, 98%)');
            root.style.setProperty('--text-secondary', 'hsl(0, 0%, 75%)');
            root.style.setProperty('--text-tertiary', 'hsl(0, 0%, 55%)');
            root.style.setProperty('--border-color', 'hsl(140, 20%, 25%)');
            root.style.setProperty('--border-light', 'hsl(140, 20%, 30%)');
        } else {
            // Dark theme (default)
            root.style.setProperty('--primary-green', 'hsl(142, 71%, 45%)');
            root.style.setProperty('--secondary-blue', 'hsl(210, 100%, 56%)');
            root.style.setProperty('--bg-primary', 'hsl(220, 26%, 14%)');
            root.style.setProperty('--bg-secondary', 'hsl(220, 26%, 18%)');
            root.style.setProperty('--bg-tertiary', 'hsl(220, 26%, 22%)');
            root.style.setProperty('--bg-card', 'hsl(220, 26%, 16%)');
            root.style.setProperty('--bg-hover', 'hsl(220, 26%, 24%)');
            root.style.setProperty('--text-primary', 'hsl(0, 0%, 98%)');
            root.style.setProperty('--text-secondary', 'hsl(0, 0%, 75%)');
            root.style.setProperty('--text-tertiary', 'hsl(0, 0%, 55%)');
            root.style.setProperty('--border-color', 'hsl(220, 26%, 28%)');
            root.style.setProperty('--border-light', 'hsl(220, 26%, 32%)');
        }
    };

    const handleThemeSelect = (themeId) => {
        setSelectedTheme(themeId);
        applyTheme(themeId);

        // Save to localStorage for persistence
        localStorage.setItem('energysync-theme', themeId);

        // Show confirmation message
        setShowConfirmation(true);
        setTimeout(() => {
            setShowConfirmation(false);
        }, 2000);
    };

    return (
        <div className="appearance-settings">
            <div className="appearance-header card-glass">
                <div className="header-content">
                    <div className="header-icon">
                        <Palette size={32} />
                    </div>
                    <div>
                        <h2>Appearance Settings</h2>
                        <p className="text-secondary">Customize the look and feel of your application</p>
                    </div>
                </div>
            </div>

            {/* Confirmation Toast */}
            {showConfirmation && (
                <div className="confirmation-toast">
                    <Check size={20} />
                    <span>Theme applied successfully!</span>
                </div>
            )}

            {/* Theme Selection */}
            <div className="theme-section">
                <h3>Choose Your Theme</h3>
                <p className="text-secondary section-description">
                    Select a theme to personalize your experience. Changes apply instantly.
                </p>

                <div className="themes-grid">
                    {themes.map((theme) => (
                        <div
                            key={theme.id}
                            className={`theme-card card-glass ${selectedTheme === theme.id ? 'selected' : ''}`}
                            onClick={() => handleThemeSelect(theme.id)}
                        >
                            {selectedTheme === theme.id && (
                                <div className="selected-badge">
                                    <Check size={16} />
                                </div>
                            )}

                            <div className="theme-icon">
                                <theme.icon size={32} />
                            </div>

                            <div className="theme-preview">
                                <div className="preview-bar" style={{ backgroundColor: theme.colors.background }}>
                                    <div className="preview-element" style={{ backgroundColor: theme.colors.primary }}></div>
                                    <div className="preview-element" style={{ backgroundColor: theme.colors.secondary }}></div>
                                    <div className="preview-element" style={{ backgroundColor: theme.colors.card }}></div>
                                </div>
                            </div>

                            <div className="theme-info">
                                <h4>{theme.name}</h4>
                                <p className="text-secondary">{theme.description}</p>
                            </div>

                            <div className="theme-colors">
                                {Object.entries(theme.colors).slice(0, 3).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="color-dot"
                                        style={{ backgroundColor: value }}
                                        title={key}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Additional Settings */}
            <div className="additional-settings card-glass">
                <h3>Theme Information</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Active Theme:</span>
                        <span className="info-value">
                            {themes.find(t => t.id === selectedTheme)?.name}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Persistence:</span>
                        <span className="info-value text-success">
                            <Check size={16} />
                            Enabled
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Auto-Apply:</span>
                        <span className="info-value text-success">
                            <Check size={16} />
                            Instant
                        </span>
                    </div>
                </div>
                <p className="text-secondary" style={{ marginTop: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                    Your theme preference is saved automatically and will be applied when you return to the application.
                </p>
            </div>
        </div>
    );
};

export default AppearanceSettings;
