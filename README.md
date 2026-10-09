# ⚡ Modern Scientific Calculator (CalcPro)

A sleek, responsive, and organized scientific web calculator built with modern HTML5, CSS Grid, and vanilla JavaScript. Features a glassmorphism aesthetic over a scenic sunset backdrop, accurate floating-point arithmetic, and full keyboard navigation.

---

## ✨ Features

- **🎨 Modern Glassmorphism UI**: Beautiful frosted-glass aesthetic (`backdrop-filter`) with refined lighting, soft shadows, and responsive layout.
- **🔄 Standard & Scientific Modes**:
  - **Standard View**: Clean 4-column layout for everyday arithmetic.
  - **Scientific View**: Expandable 5-column panel with trigonometric functions (`sin`, `cos`, `tan`), logarithms (`ln`, `log`), powers (`xʸ`, `x²`, `eˣ`), roots (`√`), factorials (`n!`), reciprocals (`1/x`), and constants (`π`, `e`).
- **📐 Angle Mode Selector**: Seamless toggle between **DEG** (Degrees) and **RAD** (Radians).
- **📝 Multi-Line Smart Display**: Real-time expression and history preview on top with auto-scaling large result digits below.
- **📋 Click to Copy**: Click on the display to instantly copy the calculation result to your clipboard with animated toast feedback.
- **⌨️ Full Keyboard Navigation**:
  - Numbers `0`–`9` and decimal `.`
  - Operators `+`, `-`, `*`, `/`
  - Calculate: `Enter` or `=`
  - Delete / Backspace: `Backspace`
  - All Clear: `Escape` or `C`
  - Percentage: `%`
  - Power: `^`
  - Parentheses: `(` and `)`
- **🛡️ Robust Math Engine**:
  - Eliminates JavaScript floating-point errors (e.g., `0.1 + 0.2 = 0.3`).
  - Supports compound parenthesized expressions like `(2 + 3) * 4`.
  - Graceful division-by-zero error handling.

---

## 🚀 Getting Started

No build tools or external dependencies required!

1. Clone or download this repository:
   ```bash
   git clone <repo-url>
   cd "Calculator Project"
   ```
2. Open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari).

---

## 📁 Project Structure

```
├── index.html        # Semantic HTML5 structure and accessible keypad layout
├── style.css         # Glassmorphism design system & responsive CSS Grid
├── script.js         # Calculator math engine & keyboard event listeners
├── Bg.jpg            # High-resolution scenic backdrop wallpaper
└── README.md         # Project documentation
```

---

## 👤 Author

Designed & Developed by **Sameen (Saminu Aminu)**
