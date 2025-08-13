### MentorPath Layout Components

This folder contains the layout primitives used across the app.

- `Layout.jsx`: Root layout wrapper. Composes `Sidebar`, `Header`, content area, and `MobileBottomNav`.
  - Props:
    - `columns` (string): controls large-screen grid in the main area. Examples: `"2|1"`, `"1|2|1"`.
    - `onPrevDate`, `onNextDate`: optional callbacks passed to `Header` date arrows.
  - Keyboard shortcut: `Ctrl+\` toggles sidebar collapse.
  - LocalStorage keys:
    - `mentorpath.sidebarCollapsed` — persists collapse state.

- `ThreeColumnShell.jsx`: Responsive scaffold for complex pages.
  - Usage:

    ```jsx
    import ThreeColumnShell from '@/components/ThreeColumnShell'

    ;<ThreeColumnShell left={<LeftList />} center={<MainContent />} right={<RightDetails />} />
    ```

  - Behavior:
    - Large screens: 3 columns (`left | center | right`)
    - Medium: 2 columns (right should be shown via an overlay/drawer by the page)
    - Small: single column (page can present lists/details in slide-overs)

Manual test notes (visual):

- Collapse/expand the sidebar (toggle button in sidebar bottom, keyboard `Ctrl+\`). Reload to confirm persistence.
- On mobile (< md), open hamburger to show the slide-over sidebar. Verify bottom nav is visible.
- Header avatar opens dropdown; options: Profile, Settings, Sign out (Admin if available).
- Date arrows in header call the provided callbacks (check console if not wired).
- Use the "Skip to content" link via keyboard `Tab` from top.
