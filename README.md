# DuetDocsJs: Dual‑Pane Markdown & Rich‑Text Editor

A simple, single-file web application that provides a side-by-side Markdown and Rich-Text (HTML) editor with live two-way synchronization. Edit in one pane, and see the changes instantly reflected in the other. Built with vanilla JavaScript and modern libraries delivered via CDN.

**✨ Live Demo:** [**https://cs-util-com.github.io/DuetDocsJs/**](https://cs-util-com.github.io/DuetDocsJs/)

---

## Features

| #  | Feature                                                                                                                                         |
| -- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | View & edit the **same content** in **Markdown** (source) *and* **RichText** (HTML) simultaneously.                                            |
| 2 | **Two‑way live sync**—changes on either side instantly propagate to the other.                                                                  |
| 3 | **Download** buttons—`.md` for the Markdown pane, `.html` for the Rich pane—using the first non‑empty line (sanitized) as the filename.         |
| 4 | **Responsive split layout** that fills the browser window; fluid resizing with the viewport (stacks vertically on smaller screens).             |
| 5 | **Dark/Light Theme Toggle** with persistence using `localStorage`.                                                                              |
| 6 | **Content Persistence**—your text and theme preference are saved in `localStorage` and restored on reload.                                      |

---

## How to Use

1.  **Open `index.html`:** Simply open the `index.html` file in your web browser. No build step or server is required.
2.  **Start Typing:** Write Markdown in the left pane or use the rich-text editor on the right. Changes sync automatically.
3.  **Toggle Theme:** Use the theme button in the top-right corner to switch between light and dark modes.
4.  **Download:** Use the "Download" buttons above each pane to save your content as `.md` or `.html` files.
5.  **Persistence:** Your content and theme choice are automatically saved in your browser's `localStorage`.

---

## Technology Choices

| Concern                | Library/Tool                                      | Reason                                                                  |
| ---------------------- | ------------------------------------------------- | ----------------------------------------------------------------------- |
| Markdown source editor | **Plain `<textarea>`**                            | Simple, universally compatible, no extra dependencies.                  |
| Rich‑text editor       | **Quill 2.0.2** (Snow theme)                      | MIT license, modern, well‑documented, clipboard‑friendly.               |
| MD → HTML Conversion   | **Showdown 2.1.0**                                | Tiny, versatile conversion, supports tables, task lists, etc.           |
| HTML → MD Conversion   | **Turndown 7.1.2**                                | Small, robust reverse conversion.                                       |
| UI/Styling             | **Tailwind CSS** (CDN)                            | Utility-first CSS framework for rapid UI development and responsiveness. |
| Build/Serve            | *None* (pure single HTML file)                    | Runs directly from local disk or any static web host.                   |

---

## Architecture & Sync Logic

The core synchronization works as follows:

```
 <textarea>   ──onInput──▶  Showdown ──▶ Quill.root.innerHTML = html
   ▲   │                              │         │
   │   └── .value = markdown ◀────────┘  Turndown◀──onTextChange── Quill
```

### File Structure

*   **`index.html`** — Main application file with UI and core logic
*   **`converter.js`** — Markdown ⇄ HTML conversion utilities (Showdown + Turndown)
*   **`html-export-helper.js`** — HTML export utilities for creating standalone documents

### Sync Logic Details

*   **Sync Guard:** A boolean flag (`isUpdating`) prevents infinite update loops between the panes. An `activeEditor` variable and `lastEditTime` timestamp help manage focus and prevent update collisions when switching panes quickly.
*   **Conversion:**
    *   **Markdown → HTML:** Showdown handles the conversion, with options enabled for tables, strikethrough, and task lists.
    *   **HTML → Markdown:** Turndown converts the Quill editor's HTML back to Markdown.
*   **Source of Truth:** The pane the user last interacted with is considered the source of truth for the content.
*   **Persistence:** Content (`markdown`) and theme (`'light'` or `'dark'`) are saved to `localStorage` on every change and loaded when the page starts.
*   **HTML Export:** Uses Quill's `getSemanticHTML()` API and creates complete, styled HTML documents with proper sanitization.

---

## UI & UX Details

*   **Layout:** Uses Tailwind CSS Flexbox for the responsive two-column layout. Panes stack vertically on screens narrower than 768px.
*   **Toolbars:** Simple download buttons above each pane and a theme toggle button in the navigation bar.
*   **Download:** Creates a Blob and uses a temporary anchor link (`<a>` tag with `download` attribute) to trigger the file download.
*   **Filename Generation:** The first non-empty line of the content is sanitized (non-alphanumeric characters removed, limited to 50 chars) and used as the base for the `.md` or `.html` filename.
*   **Feedback:** Simple toast notifications appear at the bottom center to confirm actions like downloads and theme changes.
*   **Accessibility:** Uses native `<button>` elements and preserves focus outlines. (Future: Add `aria-label` to editor containers).
*   **Error Handling:** `localStorage` errors are logged to the console and may trigger a toast. Download works offline via data URIs. Conversion errors are currently logged (could show a toast).

---

## Possible Future Enhancements

*   Copy-to-clipboard buttons for Markdown and HTML panes.
*   Basic Markdown formatting toolbar (bold, italic, etc.) for the textarea.
*   Image drag‑and‑drop support (e.g., base64 embedding).
*   Progressive Web App (PWA) features (manifest, service worker for offline use).
*   Add `aria-label` attributes to editor containers for improved screen reader support.
*   Show toast notifications on conversion errors instead of just logging them.

---

## License
See the [LICENSE](LICENSE) file for details.
