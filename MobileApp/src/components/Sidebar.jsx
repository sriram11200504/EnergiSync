import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Zap,
    TrendingDown,
    BarChart3,
    Leaf,
    Receipt,
    Settings,
    Bolt
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/appliances', icon: Zap, label: 'Appliances' },
        { path: '/tariff', icon: TrendingDown, label: 'Tariff Optimizer' },
        { path: '/insights', icon: BarChart3, label: 'Energy Insights' },
        { path: '/carbon', icon: Leaf, label: 'Carbon Footprint' },
        { path: '/billing', icon: Receipt, label: 'Billing' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon">
                        <Bolt size={32} />
                    </div>
                    <div className="logo-text">
                        <h2>EnergySync</h2>
                        <p>Smart Energy Manager</p>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        end={item.path === '/'}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info glass">
                    <div className="user-avatar">
                        <span>U</span>
                    </div>
                    <div className="user-details">
                        <p className="user-name">User Account</p>
                        <p className="user-email">user@energysync.com</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
