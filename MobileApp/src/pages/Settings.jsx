import { useState } from 'react';
import {
    Settings as SettingsIcon,
    Users,
    Bell,
    Shield,
    Palette,
    Globe
} from 'lucide-react';
import UserManagement from '../components/UserManagement';
import AppearanceSettings from '../components/AppearanceSettings';
import './Settings.css';

const Settings = () => {
    const [activeSection, setActiveSection] = useState('users');

    const settingsSections = [
        { id: 'users', label: 'Users', icon: Users, component: UserManagement },
        { id: 'appearance', label: 'Appearance', icon: Palette, component: AppearanceSettings },
        { id: 'notifications', label: 'Notifications', icon: Bell, component: null },
        { id: 'security', label: 'Security', icon: Shield, component: null },
        { id: 'language', label: 'Language', icon: Globe, component: null },
    ];

    const ActiveComponent = settingsSections.find(s => s.id === activeSection)?.component;

    return (
        <div className="settings">
            <div className="page-header">
                <div>
                    <h1>Settings</h1>
                    <p className="text-secondary">Manage your application preferences and users</p>
                </div>
            </div>

            <div className="settings-container">
                {/* Settings Sidebar */}
                <div className="settings-sidebar card-glass">
                    <h3>Settings Menu</h3>
                    <div className="settings-menu">
                        {settingsSections.map((section) => (
                            <button
                                key={section.id}
                                className={`settings-menu-item ${activeSection === section.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(section.id)}
                            >
                                <section.icon size={20} />
                                <span>{section.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Content */}
                <div className="settings-content">
                    {ActiveComponent ? (
                        <ActiveComponent />
                    ) : (
                        <div className="card-glass" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                            <h3>Coming Soon</h3>
                            <p className="text-secondary">This section is under development</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
