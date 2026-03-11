# Settings Module - User Management Documentation

## ✅ Module Successfully Added

A comprehensive **Settings** module with **User Management** functionality has been added to the EnergySync application.

---

## 📁 Files Created

### New Pages
1. **src/pages/Settings.jsx** - Main settings page with sidebar navigation
2. **src/pages/Settings.css** - Settings page styles

### New Components
3. **src/components/UserManagement.jsx** - Complete user management component
4. **src/components/UserManagement.css** - User management styles

### Updated Files
5. **src/App.jsx** - Added Settings route
6. **src/components/Sidebar.jsx** - Added Settings menu item

### Directories
7. **public/profileImages/** - Folder for storing user profile photos

---

## 🎯 Features Implemented

### 1. Settings Page Structure
- **Settings Sidebar Navigation** with sections:
  - ✅ Users (Active)
  - Notifications (Coming Soon)
  - Security (Coming Soon)
  - Appearance (Coming Soon)
  - Language (Coming Soon)

### 2. User Management - Complete CRUD Operations

#### ✅ **Add User**
- **Form Fields:**
  - First Name (text input, required)
  - Last Name (text input, required)
  - Email Address (text input with validation, required)
  - Profile Photo:
    - 📤 Upload from device (file picker)
    - 📷 Capture using mobile camera
    - Preview before saving
    - Stored as base64 in state (ready for backend integration)
  
- **Menu Access Permissions:**
  - Visual checkbox grid showing all available menus:
    - Dashboard
    - Appliances
    - Tariff Optimizer
    - Energy Insights
    - Carbon Footprint
    - Billing
    - Settings
  - Multi-select functionality
  - Visual feedback for selected menus

- **Validation:**
  - Email format validation using regex
  - Required field validation
  - Alert for invalid email

- **Actions:**
  - Save button to add user
  - Cancel button to close modal

#### ✅ **Update User**
- Click "Edit" button on any user card
- Pre-populated form with existing user data
- Ability to:
  - Update first name, last name, email
  - Replace profile photo (upload new or capture new)
  - Modify menu access permissions
- Save changes button

#### ✅ **Delete User**
- Click "Delete" button on any user card
- **Confirmation Modal:**
  - Warning message
  - Cancel option
  - Confirm delete button
- User removed from list upon confirmation

#### ✅ **User List View**
- **Card-based layout** displaying all users
- **Each user card shows:**
  - Profile photo (or initials if no photo)
  - Full name (First + Last)
  - Email address with icon
  - Menu access badges (color-coded)
  - Edit button
  - Delete button

- **Empty State:**
  - Friendly message when no users exist
  - Prompt to add first user

---

## 🎨 UI/UX Features

### Design Elements
- ✨ **Glassmorphism cards** for modern look
- 🎨 **Color-coded badges** for menu access
- 📸 **Photo preview** before upload
- 🖼️ **Avatar with initials** when no photo
- ✅ **Visual checkboxes** for menu selection
- 🎯 **Hover effects** on all interactive elements
- 📱 **Fully responsive** design

### User Experience
- **Modal dialogs** for add/edit operations
- **Confirmation prompts** for destructive actions
- **Real-time preview** of profile photos
- **Smooth animations** and transitions
- **Clear visual feedback** for all actions
- **Accessible forms** with proper labels

---

## 🔧 Technical Implementation

### State Management
```javascript
- users: Array of user objects
- showModal: Boolean for add/edit modal
- editingUser: Current user being edited
- formData: Form state (firstName, lastName, email, profilePhoto, menuAccess)
- photoPreview: Preview URL for profile photo
- showDeleteConfirm: User ID pending deletion
```

### Profile Photo Handling
```javascript
// Two input methods:
1. File Upload: <input type="file" accept="image/*" />
2. Camera Capture: <input type="file" accept="image/*" capture="user" />

// Processing:
- FileReader API converts to base64
- Preview shown immediately
- Stored in formData.profilePhoto
- Ready for backend API integration
```

### Email Validation
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Validates format before saving
```

### Menu Access
```javascript
// Array of menu IDs
menuAccess: ['dashboard', 'appliances', 'insights']

// Toggle function
toggleMenuAccess(menuId) {
  // Add or remove from array
}
```

---

## 📊 Data Structure

### User Object
```javascript
{
  id: 1,                          // Unique identifier (timestamp)
  firstName: "John",              // User's first name
  lastName: "Doe",                // User's last name
  email: "john@example.com",      // Validated email
  profilePhoto: "data:image...",  // Base64 encoded image or null
  menuAccess: [                   // Array of accessible menu IDs
    'dashboard',
    'appliances',
    'insights'
  ]
}
```

### Available Menus
```javascript
[
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'appliances', label: 'Appliances' },
  { id: 'tariff', label: 'Tariff Optimizer' },
  { id: 'insights', label: 'Energy Insights' },
  { id: 'carbon', label: 'Carbon Footprint' },
  { id: 'billing', label: 'Billing' },
  { id: 'settings', label: 'Settings' }
]
```

---

## 🚀 How to Use

### Accessing Settings
1. Click **"Settings"** in the sidebar (last menu item)
2. Settings page opens with "Users" section active

### Adding a New User
1. Click **"Add User"** button (top right)
2. Modal opens with form
3. Fill in required fields:
   - First Name
   - Last Name
   - Email
4. (Optional) Upload or capture profile photo
5. Select menu access permissions
6. Click **"Add User"** to save

### Editing a User
1. Find user in the list
2. Click **"Edit"** button on user card
3. Modal opens with pre-filled data
4. Make changes
5. Click **"Update User"** to save

### Deleting a User
1. Find user in the list
2. Click **"Delete"** button on user card
3. Confirmation modal appears
4. Click **"Delete User"** to confirm

---

## 📱 Mobile Features

### Camera Capture
- On mobile devices, the "Capture Photo" button will:
  - Open the device's camera
  - Allow taking a photo
  - Automatically load it into the form
  - Show preview

### Responsive Design
- **Desktop:** 2-column grid for user cards
- **Tablet:** Adjusts to available space
- **Mobile:** Single column layout
- Form adapts to screen size
- Modal takes full width on small screens

---

## 🔐 Security Considerations

### Current Implementation (Frontend Only)
- Email validation
- Required field validation
- Confirmation for deletions
- Profile photos stored as base64

### Ready for Backend Integration
The component is structured to easily integrate with a backend API:

```javascript
// Add User API Call
const response = await fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify(formData)
});

// Update User API Call
const response = await fetch(`/api/users/${userId}`, {
  method: 'PUT',
  body: JSON.stringify(formData)
});

// Delete User API Call
const response = await fetch(`/api/users/${userId}`, {
  method: 'DELETE'
});

// Upload Photo to Server
const formData = new FormData();
formData.append('photo', photoFile);
const response = await fetch('/api/users/upload-photo', {
  method: 'POST',
  body: formData
});
```

---

## 📂 Profile Images Storage

### Current Setup
- **Directory:** `public/profileImages/`
- **Format:** Base64 encoded (in-memory)
- **Preview:** Immediate display

### For Production
When integrating with backend:
1. Upload photo to server
2. Server saves to `profileImages/` folder
3. Returns file path or URL
4. Store path in database
5. Display using `<img src="/profileImages/filename.jpg" />`

---

## 🎯 Sample Users Included

Two sample users are pre-loaded for demonstration:

**User 1:**
- Name: John Doe
- Email: john.doe@energysync.com
- Access: Dashboard, Appliances, Energy Insights

**User 2:**
- Name: Jane Smith
- Email: jane.smith@energysync.com
- Access: Dashboard, Billing, Carbon Footprint

---

## ✨ Key Highlights

✅ **Complete CRUD** - Create, Read, Update, Delete  
✅ **Photo Upload** - File picker + Camera capture  
✅ **Email Validation** - Regex-based validation  
✅ **Menu Permissions** - Granular access control  
✅ **Confirmation Dialogs** - Safe deletion  
✅ **Responsive Design** - Works on all devices  
✅ **Modern UI** - Glassmorphism and animations  
✅ **Empty States** - Helpful when no data  
✅ **Real-time Preview** - See changes immediately  
✅ **Backend Ready** - Easy API integration  

---

## 🔄 Navigation

### Access Settings from:
1. **Sidebar** → Click "Settings" (gear icon)
2. **Direct URL** → http://localhost:5173/settings

### Settings Sections:
- **Users** ✅ (Active - Full functionality)
- Notifications (Coming Soon)
- Security (Coming Soon)
- Appearance (Coming Soon)
- Language (Coming Soon)

---

## 📝 Code Quality

- **Clean Component Structure** - Separated concerns
- **Reusable Functions** - DRY principle
- **Proper State Management** - React hooks
- **Accessible Forms** - Labels and validation
- **Responsive CSS** - Mobile-first approach
- **Modern ES6+** - Arrow functions, destructuring
- **Comments Ready** - Easy to understand

---

## 🎉 Status: COMPLETE

The Settings module with User Management is **fully functional** and ready to use!

**Test it by:**
1. Starting the dev server: `npm run dev`
2. Opening http://localhost:5173/settings
3. Adding, editing, and deleting users
4. Uploading profile photos
5. Managing menu access permissions

---

**Built with ⚡ by the EnergySync Team**
