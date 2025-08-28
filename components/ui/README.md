# Modal Component

A centralized, reusable modal component that provides consistent styling for all popups across the application.

## Features

- ✅ **Consistent Design**: All modals now have the same visual appearance
- ✅ **Flexible Sizing**: Multiple size options (small, default, large, xl)
- ✅ **Customizable Sections**: Header, content, and footer are all configurable
- ✅ **Responsive**: Automatically adapts to different screen sizes
- ✅ **Accessibility**: Proper backdrop handling and keyboard support
- ✅ **Single Source of Truth**: Design changes only need to be made in one place

## Usage

```jsx
import Modal from '@/components/ui/Modal'

// Basic usage
;<Modal
  isOpen={isOpen}
  onClose={handleClose}
  header={headerConfig}
  content={contentJSX}
  footer={footerJSX}
  size="large"
/>
```

## Props

| Prop                   | Type      | Default   | Description                                   |
| ---------------------- | --------- | --------- | --------------------------------------------- |
| `isOpen`               | boolean   | -         | Controls modal visibility                     |
| `onClose`              | function  | -         | Function called when modal should close       |
| `header`               | object    | -         | Header configuration object                   |
| `content`              | ReactNode | -         | Main content of the modal                     |
| `footer`               | ReactNode | -         | Footer content (buttons, etc.)                |
| `size`                 | string    | 'default' | Modal size: 'small', 'default', 'large', 'xl' |
| `showCloseButton`      | boolean   | true      | Whether to show the close button              |
| `closeOnBackdropClick` | boolean   | true      | Whether clicking backdrop closes modal        |
| `className`            | string    | ''        | Additional CSS classes                        |

## Header Configuration

```jsx
const header = {
  icon: <Calendar size={24} className="text-blue-600" />,
  iconBgColor: 'bg-blue-100', // Optional, defaults to 'bg-blue-100'
  title: 'Modal Title',
  subtitle: 'Optional subtitle text',
}
```

## Size Options

- **small**: `max-w-lg` (32rem / 512px)
- **default**: `max-w-3xl` (48rem / 768px)
- **large**: `max-w-5xl` (64rem / 1024px)
- **xl**: `max-w-7xl` (80rem / 1280px)

## Examples

### AddEventModal

```jsx
const modalHeader = {
  icon: <Calendar size={24} className="text-blue-600" />,
  iconBgColor: 'bg-blue-100',
  title: 'Create New Event',
  subtitle: 'Schedule a new event in your calendar',
}

const modalContent = (
  <div className="space-y-6">
    {/* Your form content */}
  </div>
)

const modalFooter = (
  <>
    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleSubmit}>Create Event</Button>
  </>
)

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  header={modalHeader}
  content={modalContent}
  footer={modalFooter}
  size="large"
/>
```

### DayEventsModal

```jsx
const modalHeader = {
  icon: <Calendar size={24} className="text-emerald-600" />,
  iconBgColor: 'bg-emerald-100',
  title: formattedDate,
  subtitle: `${events.length} events scheduled`,
}

<Modal
  isOpen={isOpen}
  onClose={onClose}
  header={modalHeader}
  content={modalContent}
  footer={modalFooter}
  size="large"
/>
```

## Benefits

1. **Consistency**: All modals look and behave the same way
2. **Maintainability**: Design changes only need to be made in one component
3. **Reusability**: Easy to create new modals with consistent styling
4. **Developer Experience**: Clear API and predictable behavior
5. **Performance**: Optimized rendering and event handling

## Migration

To migrate existing modals:

1. Import the Modal component
2. Extract header, content, and footer into separate variables
3. Replace the modal JSX with the Modal component
4. Pass the appropriate props

This ensures all modals maintain the same professional appearance while allowing for easy customization of content and behavior.
