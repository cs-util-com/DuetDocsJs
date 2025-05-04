*Dual‑Pane Markdown & Rich‑Text Editor (Single‑File SPA)*

#### 1 Goals & Scope

| #  | Goal                                                                                                                                            |
| -- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | View & edit the **same content** in **Markdown** (source) *and* **RichText** (HTML) simultaneously.                                            |
| 2 | **Two‑way live sync**—changes on either side instantly propagate to the other.                                                                  |
| 3 | **Download** buttons—`.md` for the Markdown pane, `.html` for the Rich pane—using the first non‑empty line (sanitized) as the filename.         |
| 4 | **Responsive split layout** that fills the browser window; fluid resizing with the viewport.                                                    |
| 5 | **Dark/Light Theme Toggle** with persistence.                                                                                                   |
| 6 | **Content Persistence** using `localStorage`.                                                                                                   |

---

#### 2 Technology Choices

| Concern                | Library                                           | Reason                                                                  |
| ---------------------- | ------------------------------------------------- | ----------------------------------------------------------------------- |
| Markdown source editor | **Plain `<textarea>`**                            | Simple, universally compatible, no extra dependencies.                  |
| Rich‑text editor       | **Quill2.0.2** (Snow theme)                       | MIT license, modern, well‑documented, clipboard‑friendly.               |
| MD→HTML              | **Showdown2.1.0**                                 | Tiny, versatile conversion, keeps tables / code fences.                 |
| HTML→MD              | **Turndown7.1.2**                                 | Small, robust reverse conversion.                                       |
| UI/Styling             | **Tailwind CSS** (CDN)                            | Utility-first CSS framework for rapid UI development.                   |
| Build/Serve            | *None* (pure single HTML file)                    | Runs from local disk or a static host.                                  |


---

#### 3 Architecture & Flow

```
 <textarea>   ──onInput──▶  Showdown ──▶ Quill.root.innerHTML = html
   ▲   │                              │         │
   │   └── .value = markdown ◀────────┘  Turndown◀──onTextChange── Quill
```

* **Debounce/lock:** A boolean `isUpdating` guards against infinite ping‑pong loops. An `activeEditor` variable and `lastEditTime` timestamp help prevent updates collisions when switching between panes quickly.
* **Conversion fidelity:**
  * **Markdown → HTML:** Showdown tables, strike‑through, task‑lists enabled.
  * **HTML → Markdown:** Turndown default rules; Quill’s semantic HTML keeps noise minimal.
* **State source of truth:** Whichever pane the user last interacted with becomes the authoritative version.
* **Persistence:** Content and theme preference are saved to `localStorage` on every change and loaded on startup.

---

#### 4 UI & UX Details

* **Layout:** Tailwind CSS Flexbox with two `.pane` columns (responsive, stack vertically on smaller screens).
* **Toolbars:** Simple `<button>` strips pinned above each editor pane for Download actions. A theme toggle button is in the top navigation bar.
* **Download:** Uses a Blob + hidden anchor (`download` attribute).
* **Filename rule:** first trimmed line → strip non‑alphanum/space & cut at 50chars → append `.md` or `.html`.
* **Feedback:** Toast notifications confirm actions like downloads and theme changes.
* **Accessibility:**
  * Buttons are native `<button>` elements (keyboard & screen‑reader friendly).
  * Focus rings preserved.
  * (Future: Add `aria-label` to editor containers).
* **Error handling:**
  * `localStorage` load/save errors are logged to the console and may trigger a toast.
  * Download always succeeds offline (dataURI).
  * Try/catch around conversion calls (currently logs errors, could show toast).

---

#### 7 Possible future Enhancements

* Copy buttons for Markdown and HTML panes.
* Toolbar toggle for Markdown formatting (bold, italic, heading).
* Image drag‑and‑drop with base64 embed or upload callback.
* Offline PWA manifest & service‑worker cache.
* Add `aria-label` attributes to editor containers for better accessibility.
* Show toast notifications on conversion errors.
