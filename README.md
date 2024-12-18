# Streaming Markdown Parser

A streaming markdown parser that offers an interactive reading experience and advanced features.

## Main Features

### 1. Text Streaming

- Gradual text rendering, character by character
- Adjustable streaming speed
- Smooth auto-scroll keeping text in visible area
- Control button to pause/resume streaming

### 2. Streaming Control

- **Pause/Play Button**
  - Location: Bottom left corner
  - Pause icon (||) during active streaming
  - Play icon (▶) when paused
  - Black color when active
  - Green color when paused
  - Resumes exactly from where it stopped

### 3. Code Blocks

- **Language Identification**

  - Automatic language display at the top of the block
  - Default support for 'bash' when not specified
  - Distinctive visual style for code blocks

- **Copy Button**
  - Double sheet icon in the top right corner
  - Black color by default
  - Changes to green after copying
  - Maintains state even during streaming
  - Works even with streaming in progress

### 4. Markdown Formatting

- **Basic Elements**

  - Headers (H1, H2, H3)
  - Ordered and unordered lists
  - Bold and italic text
  - Inline code
  - Clickable links

- **Links**
  - Support for markdown-style links `[text](url)`
  - Automatic conversion of URLs to clickable links
  - Opens in new tab (`target="_blank"`)
  - Security attributes (`rel="noopener noreferrer"`)

### 5. Interface

- **Responsive Design**

  - Adaptable layout
  - Reading-optimized font
  - Proper spacing between elements

- **Stream Button**
  - Positioned in the bottom right corner
  - Visual feedback during streaming
  - Disabled while streaming is active

## Technologies Used

- React/Next.js
- TypeScript
- Tailwind CSS
- Marked (for markdown parsing)

## How to Use

1. **Start the Project**

   ```bash
   npm install
   npm run dev
   ```

2. **Controls**
   - Click "STREAM" to start rendering
   - Use the button in the bottom left corner to pause/resume
   - Click the sheet icon to copy code
   - Auto-scroll keeps text always visible

## Project Structure

- `src/StreamingMarkdownRenderer.ts`: Main streaming and rendering logic
- `src/MarkdownRenderer.ts`: Static markdown rendering
- `src/app/page.tsx`: Main application component
- `src/globals.css`: Global styles and customizations

## Additional Features

- Smart auto-scroll
- State preservation during streaming
- Visual feedback for all interactions
- Smooth animations
- Error handling
