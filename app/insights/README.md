# Insights & Analytics Page

A comprehensive analytics dashboard for tracking productivity and work patterns.

## Features

### 1. Filters & Navigation

- **Period Toggle**: Switch between Week/Month views
- **Navigation Arrows**: Navigate between periods
- **Priority Filter**: Filter by task priority (Low/Medium/High)
- **Label Filter**: Filter by task labels
- **Responsive Design**: Collapsible filters on mobile

### 2. Stats Cards

- **Peak Hours**: Shows busiest time range with total work time
- **Best Streak**: Longest continuous focus streak in the period
- **Productivity Score**: Overall score (0-10) with trend indicator

### 3. Work Hours Chart

- **Daily Bar Chart**: Visual representation of daily work hours
- **Color Coding**: Bars colored by task priority
- **Interactive Tooltips**: Hover for detailed information
- **Responsive**: Adapts to different screen sizes

### 4. Task History

- **Accordion Style**: Grouped by date with expand/collapse
- **Task Details**: Title, priority, description, labels, work time
- **Interactive**: Click to view full task details
- **Sorting**: Newest dates first

### 5. Task Details Drawer

- **Side Panel**: Opens from right side
- **Complete Information**: Priority, description, labels, checklist
- **Work Sessions**: Detailed log of all work sessions
- **Progress Tracking**: Checklist completion status

## Components

- `InsightsFilters.jsx` - Period toggle, navigation, and filters
- `StatsCards.jsx` - Peak hours, streak, and productivity metrics
- `WorkHoursChart.jsx` - Daily work hours visualization
- `TaskHistory.jsx` - Accordion-style task grouping
- `TaskDetailsDrawer.jsx` - Detailed task information panel

## Data Sources

- **Firebase Firestore**: Real-time task data via `subscribeToTasks`
- **Task Fields**: Uses existing task structure with workSessions
- **Real-time Updates**: Live data updates as tasks are modified

## Styling

- **Theme**: Consistent with app's light background design
- **Cards**: Rounded corners (`rounded-2xl`) with subtle shadows
- **Colors**: Accent colors for priority levels and interactive elements
- **Responsive**: Mobile-first design with collapsible sections
- **Animations**: Smooth transitions (`transition-all duration-300`)

## Usage

1. Navigate to `/insights`
2. Select period (Week/Month) and navigate between periods
3. Apply priority and label filters
4. View productivity statistics and trends
5. Explore daily work patterns in the chart
6. Review task history by date
7. Click on tasks to view detailed information

## Technical Notes

- Uses `recharts` for chart visualization
- Implements `date-fns` for date manipulation
- Real-time Firebase integration
- Responsive design with Tailwind CSS
- Smooth animations and transitions
