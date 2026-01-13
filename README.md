# 📌 Cork Board - Digital Pin Board

A beautiful, free-form digital cork board application for organizing your thoughts, ideas, and tasks with draggable pins and lists.

![Cork Board Preview](https://via.placeholder.com/800x400/d4a574/ffffff?text=Cork+Board+Preview)

## ✨ Features

### Core Functionality
- **Blank Canvas Interface**: Start with an empty canvas and create pins anywhere
- **Multiple Pin Types**: Create text notes, image pins, and checklists
- **Drag & Drop**: Freely drag and position pins anywhere on the board
- **Resize Support**: Resize pins to fit your content (images respect minimum dimensions)

### Advanced Features
- **🔄 Undo/Redo**: Full history support for all actions (move, edit, create, delete)
- **🔍 Zoom & Pan**: 
  - Ctrl + Mouse wheel to zoom (25% - 300%)
  - Space + Drag or Middle mouse button to pan
  - Reset view button to return to default
- **💾 Persistence**: Your board state is automatically saved to localStorage
- **📸 Snapshots**: Save named snapshots of your board and restore them anytime
- **🏷️ Tags**: Add tags to pins for organization
- **🎨 Color Customization**: Choose from 8 different pin colors

### User Experience
- Beautiful cork board aesthetic with realistic textures
- Push-pin decoration on each pin
- Smooth animations and transitions
- Keyboard shortcuts for common actions
- Context menu (right-click) for quick pin creation
- Double-click on canvas to create pins

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cork-board
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm run start
```

### Static Export (for deployment)

The project is configured for static export. Build the static files:

```bash
npm run build
```

The output will be in the `out` directory, ready for deployment to any static hosting service.

## 🎮 How to Use

### Creating Pins
1. **Toolbar**: Click "Note", "Image", or "List" buttons
2. **Right-click**: Right-click anywhere on the canvas
3. **Double-click**: Double-click on empty canvas space

### Editing Pins
- **Text notes**: Double-click to edit content
- **Checklists**: Click checkboxes to toggle, double-click items to edit
- **Images**: Upload via toolbar or context menu

### Organizing
- **Drag**: Click and drag any pin to move it
- **Resize**: Drag the corner handle to resize
- **Color**: Click the palette icon in pin header
- **Tags**: Click "+ tag" to add tags, click tag to remove
- **Duplicate**: Use the copy icon in pin header
- **Delete**: Use the trash icon in pin header

### Navigation
- **Zoom**: Ctrl + scroll wheel, or use toolbar buttons
- **Pan**: Hold Space + drag, or middle mouse button
- **Reset**: Click the expand icon in toolbar

### Snapshots
1. Click "Snapshots" button (top-right)
2. Enter a name and click "Save"
3. Restore any saved snapshot anytime

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Undo | Ctrl + Z |
| Redo | Ctrl + Y / Ctrl + Shift + Z |
| Open Snapshots | Ctrl + S |
| Zoom | Ctrl + Scroll |
| Pan | Space + Drag |

## 🏗️ Technical Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **IDs**: UUID v4

### Project Structure
```
src/
├── app/
│   ├── globals.css      # Global styles & Tailwind config
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main application page
├── components/
│   ├── Canvas.tsx       # Main canvas with zoom/pan
│   ├── Pin.tsx          # Pin component (text/image/list)
│   ├── Toolbar.tsx      # Top toolbar
│   ├── SnapshotManager.tsx  # Snapshot modal
│   ├── ContextMenu.tsx  # Right-click context menu
│   └── index.ts         # Component exports
├── store/
│   └── boardStore.ts    # Zustand store with all state logic
└── types/
    └── index.ts         # TypeScript type definitions
```

### State Management Design

The Zustand store manages:
- **Pins**: Array of pin objects with position, content, styling
- **History**: Stack for undo/redo functionality
- **View**: Zoom level and pan offset
- **Snapshots**: Saved board states

### Key Design Decisions

1. **Zustand over Redux**: Simpler API, less boilerplate, built-in persistence helpers
2. **CSS-based Animations**: Better performance than JS-based animations
3. **Canvas Transform**: Single transform for zoom/pan ensures consistent behavior
4. **Local-first**: All data stays in browser localStorage for privacy
5. **Static Export**: Enables deployment to any static host (Vercel, Netlify, GitHub Pages)

## 🎨 Design Philosophy

The UI draws inspiration from real cork boards with:
- Warm, earthy color palette
- Subtle texture effects
- Push-pin decorations on pins
- Realistic shadows and depth
- Paper-like pin backgrounds

Typography uses:
- **DM Sans**: Clean, readable body text
- **Playfair Display**: Elegant display headings

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Deploy!

### Netlify
1. Build: `npm run build`
2. Publish directory: `out`

### GitHub Pages
1. Build: `npm run build`
2. Deploy the `out` folder

## 📝 Future Enhancements

Potential features for future development:
- [ ] Collaborative editing (real-time sync)
- [ ] Pin connections/linking
- [ ] Search and filter pins
- [ ] Export board as image
- [ ] Import/export board data
- [ ] Pin templates
- [ ] Nested lists
- [ ] Due dates for tasks
- [ ] Pin grouping/containers

## 📄 License

MIT License - feel free to use this project for any purpose.

---

Built with ❤️ using Next.js and Tailwind CSS

