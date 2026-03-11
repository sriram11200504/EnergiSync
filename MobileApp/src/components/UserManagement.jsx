import { useState, useRef } from 'react';
import {
    UserPlus,
    Edit,
    Trash2,
    Save,
    X,
    Camera,
    Upload,
    Mail,
    User,
    CheckSquare,
    Square
} from 'lucide-react';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([
        {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@energysync.com',
            profilePhoto: null,
            menuAccess: ['dashboard', 'appliances', 'insights']
        },
        {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@energysync.com',
            profilePhoto: null,
            menuAccess: ['dashboard', 'billing', 'carbon']
        }
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        profilePhoto: null,
        menuAccess: []
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const availableMenus = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'appliances', label: 'Appliances' },
        { id: 'tariff', label: 'Tariff Optimizer' },
        { id: 'insights', label: 'Energy Insights' },
        { id: 'carbon', label: 'Carbon Footprint' },
        { id: 'billing', label: 'Billing' },
        { id: 'settings', label: 'Settings' }
    ];

    const handleAddUser = () => {
        setEditingUser(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            profilePhoto: null,
            menuAccess: []
        });
        setPhotoPreview(null);
        setShowModal(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profilePhoto: user.profilePhoto,
            menuAccess: [...user.menuAccess]
        });
        setPhotoPreview(user.profilePhoto);
        setShowModal(true);
    };

    const handleDeleteUser = (userId) => {
        setShowDeleteConfirm(userId);
    };

    const confirmDelete = () => {
        setUsers(users.filter(u => u.id !== showDeleteConfirm));
        setShowDeleteConfirm(null);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                setFormData({ ...formData, profilePhoto: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCameraCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                setFormData({ ...formData, profilePhoto: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleMenuAccess = (menuId) => {
        const newMenuAccess = formData.menuAccess.includes(menuId)
            ? formData.menuAccess.filter(m => m !== menuId)
            : [...formData.menuAccess, menuId];
        setFormData({ ...formData, menuAccess: newMenuAccess });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address');
            return;
        }

        if (editingUser) {
            // Update existing user
            setUsers(users.map(u =>
                u.id === editingUser.id
                    ? { ...editingUser, ...formData }
                    : u
            ));
        } else {
            // Add new user
            const newUser = {
                id: Date.now(),
                ...formData
            };
            setUsers([...users, newUser]);
        }

        setShowModal(false);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            profilePhoto: null,
            menuAccess: []
        });
        setPhotoPreview(null);
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="user-management">
            <div className="user-management-header">
                <div>
                    <h2>User Management</h2>
                    <p className="text-secondary">Manage users and their menu access permissions</p>
                </div>
                <button className="btn btn-primary" onClick={handleAddUser}>
                    <UserPlus size={18} />
                    Add User
                </button>
            </div>

            {/* User List */}
            <div className="user-list">
                {users.length === 0 ? (
                    <div className="empty-state card-glass">
                        <User size={48} className="text-secondary" />
                        <h3>No Users Yet</h3>
                        <p className="text-secondary">Click "Add User" to create your first user</p>
                    </div>
                ) : (
                    <div className="user-grid">
                        {users.map((user) => (
                            <div key={user.id} className="user-card card-glass">
                                <div className="user-card-header">
                                    <div className="user-avatar-large">
                                        {user.profilePhoto ? (
                                            <img src={user.profilePhoto} alt={`${user.firstName} ${user.lastName}`} />
                                        ) : (
                                            <span>{getInitials(user.firstName, user.lastName)}</span>
                                        )}
                                    </div>
                                    <div className="user-card-info">
                                        <h3>{user.firstName} {user.lastName}</h3>
                                        <p className="user-email">
                                            <Mail size={14} />
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="user-card-body">
                                    <div className="menu-access-summary">
                                        <span className="summary-label">Menu Access:</span>
                                        <div className="menu-badges">
                                            {user.menuAccess.length > 0 ? (
                                                user.menuAccess.map(menuId => {
                                                    const menu = availableMenus.find(m => m.id === menuId);
                                                    return menu ? (
                                                        <span key={menuId} className="badge badge-info">
                                                            {menu.label}
                                                        </span>
                                                    ) : null;
                                                })
                                            ) : (
                                                <span className="text-secondary">No menu access</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="user-card-footer">
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => handleEditUser(user)}
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit User Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content card-glass large-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => setShowModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {/* Profile Photo Section */}
                                <div className="form-section">
                                    <label className="section-label">Profile Photo</label>
                                    <div className="photo-upload-section">
                                        <div className="photo-preview">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Preview" />
                                            ) : (
                                                <div className="photo-placeholder">
                                                    <User size={48} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="photo-actions">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload size={18} />
                                                Upload Photo
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => cameraInputRef.current?.click()}
                                            >
                                                <Camera size={18} />
                                                Capture Photo
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                style={{ display: 'none' }}
                                            />
                                            <input
                                                ref={cameraInputRef}
                                                type="file"
                                                accept="image/*"
                                                capture="user"
                                                onChange={handleCameraCapture}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* User Details */}
                                <div className="form-section">
                                    <label className="section-label">User Details</label>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>First Name *</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                required
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Last Name *</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                required
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address *</label>
                                        <input
                                            type="email"
                                            className="input"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            placeholder="user@example.com"
                                        />
                                    </div>
                                </div>

                                {/* Menu Access */}
                                <div className="form-section">
                                    <label className="section-label">Menu Access Permissions</label>
                                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>
                                        Select which menus this user can access
                                    </p>
                                    <div className="menu-access-grid">
                                        {availableMenus.map((menu) => (
                                            <div
                                                key={menu.id}
                                                className={`menu-access-item ${formData.menuAccess.includes(menu.id) ? 'selected' : ''}`}
                                                onClick={() => toggleMenuAccess(menu.id)}
                                            >
                                                {formData.menuAccess.includes(menu.id) ? (
                                                    <CheckSquare size={20} className="text-success" />
                                                ) : (
                                                    <Square size={20} className="text-secondary" />
                                                )}
                                                <span>{menu.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Save size={18} />
                                    {editingUser ? 'Update User' : 'Add User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="modal-content card-glass" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirm Delete</h3>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteConfirm(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={confirmDelete}
                            >
                                <Trash2 size={18} />
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
