# Interactive CSS Presentation Deck

A premium, web-based presentation deck designed with custom CSS transitions, staggered text animations, glassmorphism components, and responsive grid layouts.

This deck is built using pure Vanilla HTML, CSS, and JS. It is light, performant, and has no build step—meaning it runs instantly in any browser and can be published directly to **GitHub Pages** in seconds.

## 🚀 Features

- **Modern Visuals**: Deep dark space theme, custom Google Typography (`Outfit` & `Fira Code`), glassmorphic panels, and background gradient orbs.
- **Multiple Transitions**: Choose between `Slide`, `Fade`, `Zoom`, and `3D Flip` slide transitions on-the-fly using the header chips.
- **Staggered Animations**: Content elements within slides animate in sequence (fade/translate) using GPU-accelerated CSS transitions triggered by state-switching.
- **Deep Linking**: Slides map directly to URL hashes (e.g. `index.html#slide-3`). Reloading or sharing links will land on the exact slide.
- **Inputs & Controls**: Navigable via Arrow Keys, Space bar, clicks on control buttons, or touch swipes (mobile & tablet optimized).

---

## 📂 Project Structure

```bash
├── index.html       # Slide markup, SVGs, controls, and document head
├── style.css        # Color variables, transitions, animations, and card layouts
├── app.js           # Engine for navigation, swipes, keyboard bindings, and hash-routing
└── README.md        # This guide!
```

---

## 💻 How to Run Locally

You have multiple options to view this presentation locally:

### Option A: Open directly (Fastest)
Double-click `index.html` or drag it into any modern web browser.

### Option B: Local Web Server (Recommended for correct routing)
Using a local server ensures correct URL hash rendering. In your terminal, run:

**Using Node.js (npx):**
```bash
npx serve .
```

**Using Python:**
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

---

## 🛠 How to Customize

### 1. Adding/Editing Slides
Open `index.html`. Each slide is a `<section class="slide">` element inside the `<main>` tag:
```html
<section class="slide" id="slide-[number]">
  <div class="slide-content">
    <h2>Slide Title</h2>
    <!-- Your content here -->
  </div>
</section>
```
*Note: Make sure only the first slide has the `active` class on initial load.*

### 2. Animating Elements
To make elements slide or scale into view when a slide becomes active, add one of the animation classes:
- `animate-up`
- `animate-down`
- `animate-left`
- `animate-right`
- `animate-scale`

To stagger the animations (so elements appear one after another), specify an inline custom property for the transition delay:
```html
<h2 class="animate-left" style="--delay: 0.1s;">My Title</h2>
<p class="animate-up" style="--delay: 0.3s;">First paragraph...</p>
<p class="animate-up" style="--delay: 0.5s;">Second paragraph...</p>
```

### 3. Modifying Theme Colors
Open `style.css` and look at the `:root` variables:
```css
:root {
  --bg-color: #0b0d13;
  --accent-purple: #9d4edd;
  --accent-cyan: #00f5d4;
  --accent-pink: #ff007f;
  /* ... */
}
```
Changing these will automatically update the accents, backgrounds, text-gradients, and glowing mesh circles.

---

## 🌐 How to Publish to GitHub Pages

Since this project has no build tools (like Webpack, Vite, or Gulp), publishing it to GitHub Pages is incredibly simple.

### Step 1: Initialize Git Local Repository
Open your terminal in this project folder and run:
```bash
git init
git add .
git commit -m "feat: initial interactive presentation scaffold"
```

### Step 2: Create a New Repo on GitHub
1. Go to [github.com](https://github.com) and click **New** repository.
2. Name it (e.g. `presentation` or `about-me`).
3. Leave it **Public** (required for free GitHub Pages).
4. Do NOT initialize with a README, `.gitignore`, or license.

### Step 3: Link and Push Code
Copy the commands from the GitHub instruction page and run them in your terminal:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages
1. On your repository page on GitHub, click the **Settings** tab.
2. Under the "Code and automation" section in the left sidebar, click **Pages**.
3. Under **Build and deployment**, set Source to **Deploy from a branch**.
4. Under **Branch**, select `main` and `/ (root)`, then click **Save**.

### Step 5: View Your Live Presentation!
GitHub will start generating the site. Wait 1-2 minutes, then refresh the Pages tab. You will see a banner at the top:
> **Your site is live at** `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

Any changes you make locally, commit, and push (`git push`) will update the live site automatically in a few seconds!
