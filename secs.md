*Dual‑Pane Markdown & Rich‑Text Editor (Single‑File SPA)*

#### 1 Goals & Scope

| #  | Goal                                                                                                                                            |
| -- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | View & edit the **same content** in **Markdown** (source) *and* **RichText** (HTML) simultaneously.                                            |
| 2 | **Two‑way live sync**—changes on either side instantly propagate to the other.                                                                  |
| 3 | **Copy** buttons for raw Markdown and rendered HTML.                                                                                            |
| 4 | **Download** buttons—`.md` for the Markdown pane, `.html` for the Rich pane—using the first non‑empty line (sanitized) as the filename.         |
| 5 | **Responsive split layout** that fills the browser window; no hard requirement for a draggable splitter, just fluid resizing with the viewport. |

Non‑goals(may be added later): image uploads, full WYSIWYG toolbars, dark‑mode switch, ZIP export.

---

#### 2 Technology Choices

| Concern                | Library                                           | Reason                                                                  |
| ---------------------- | ------------------------------------------------- | ----------------------------------------------------------------------- |
| Markdown source editor | **CodeMirror6** (`@codemirror/*` CDN ES‑modules) | MIT license, modern, built‑in Markdown mode & syntax highlighting.      |
| Rich‑text editor       | **Quill1.3** (Snow theme)                        | MIT license, compact (\~30kB gz), well‑documented, clipboard‑friendly. |
| MD→HTML              | **Showdown2**                                    | Tiny, versatile conversion, keeps tables / code fences.                 |
| HTML→MD              | **Turndown7**                                    | Small, robust reverse conversion.                                       |
| Build/Serve            | *None* (pure single HTML file)                    | Runs from local disk or a static host.                                  |

Total payload ≈300kB gzip (all CDN).

---

#### 3 Architecture & Flow

```
 CodeMirror   ──onInput──▶  Showdown ──▶ Quill.setContents()
   ▲   │                              │         │
   │   └── dispatch(from Quill) ◀─────┘  Turndown◀──onTextChange── Quill
```

* **Debounce/lock:** A boolean `isUpdating` guards against infinite ping‑pong loops.
* **Conversion fidelity:**

  * **Markdown → HTML:** Showdown tables, strike‑through, autolinks, task‑lists enabled.
  * **HTML → Markdown:** Turndown default rules; Quill’s semantic HTML keeps noise minimal.
* **State source of truth:** Whichever pane the user last touched becomes the authoritative version until the next edit.

---

#### 4 UI & UX Details

* **Layout:** CSSFlex with two `.pane` columns (50% each, grow/shrink with window).
* **Toolbars:** Simple `<button>` strips pinned above each editor.

  * Copy uses *`navigator.clipboard.writeText()`* with fallback alert if denied.
  * Download uses a Blob + hidden anchor (`download` attribute).
* **Filename rule:** first trimmed line → strip non‑alphanum/space & cut at 50chars → append `.md` or `.html`.
* **Accessibility:**

  * Buttons are native `<button>` elements (keyboard & screen‑reader friendly).
  * Editors get `aria-label` attributes via their containers.
  * Focus rings preserved.
* **Error handling:**

  * Clipboard failure → `alert('Copy failed: '+ err.message)`.
  * Download always succeeds offline (dataURI).
  * Try/catch around both conversion calls; on error the opposite pane receives plain text.

---

#### 7 Possible future Enhancements

* Toolbar toggle for Markdown formatting (bold, italic, heading).
* Image drag‑and‑drop with base64 embed or upload callback.
* Offline PWA manifest & service‑worker cache.
