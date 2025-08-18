# Donation Feature Implementation

## Overview
A new "Donate" button has been added to the sidebar that opens a popup dialog with multiple donation options.

## Features

### Donate Button
- **Location**: Bottom of the sidebar, above the collapse toggle
- **Styling**: Gradient background (pink to red) with heart icon
- **Position**: Sticky position at bottom of sidebar
- **Responsive**: Shows only icon when sidebar is collapsed

### Donation Dialog
- **Title**: "Support Development ❤️" with heart icon
- **Content**: Descriptive text about supporting the app
- **Donation Options**:
  1. **PayPal** 💳 - "Support via PayPal" (blue accent)
  2. **Buy Me a Coffee** ☕ - "Buy me a coffee" (orange accent)  
  3. **Wise** 🌍 - "Send via Wise" (green accent)
- **Footer**: Encouraging message about sharing the app

## Technical Implementation

### Components Created
1. **`components/DonationDialog.jsx`** - Main donation popup component
2. **`components/ui/dialog.jsx`** - shadcn/ui Dialog components
3. **Updated `components/Sidebar.jsx`** - Added Donate button
4. **Updated `components/Button.jsx`** - Enhanced with size and onClick support

### Dependencies Used
- **@radix-ui/react-dialog** - For dialog functionality
- **lucide-react** - For icons (Heart, CreditCard, Coffee, Globe)
- **Tailwind CSS** - For styling and responsive design

### Styling Features
- **Glassmorphism**: Subtle hover effects with light accent colors
- **Responsive**: Full-width on mobile, centered on desktop
- **Dark Mode**: Supports both light and dark themes
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage

### For Users
1. Click the "Donate" button in the sidebar
2. Choose from three donation options
3. Click any option to open the payment link in a new tab
4. Dialog automatically closes after selection

### For Developers
1. Update donation URLs in `DonationDialog.jsx`
2. Customize button colors and hover effects
3. Modify dialog content and styling as needed
4. Add new donation options by extending the component

## Customization

### Update Donation Links
```jsx
// In DonationDialog.jsx, update these URLs:
'https://paypal.me/YOURPAYPALID'
'https://www.buymeacoffee.com/YOURUSERNAME'
'https://wise.com/YOURWISELINK'
```

### Modify Button Colors
```jsx
// Update hover colors in DonationDialog.jsx:
hover:bg-blue-50 dark:hover:bg-blue-950/20
hover:bg-orange-50 dark:hover:bg-orange-950/20
hover:bg-green-50 dark:hover:bg-green-950/20
```

### Change Sidebar Button Styling
```jsx
// In Sidebar.jsx, modify the Donate button classes:
className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-pink-500 to-red-500..."
```

## Screenshots
The feature includes:
- Donate button in sidebar (collapsed and expanded states)
- Donation dialog popup with three options
- Responsive design for mobile and desktop
- Light and dark theme support

## Future Enhancements
- Add donation amount presets
- Integrate with payment APIs
- Add donation history/tracking
- Implement recurring donations
- Add more payment methods
