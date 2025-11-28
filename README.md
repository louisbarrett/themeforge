# ThemeForge

**AI-Powered Color Theme Generator for VSCode & Cursor**

ThemeForge is a standalone desktop application that generates beautiful, cohesive color themes for your code editor using local AI models. Simply describe the aesthetic you want, and watch as your custom theme comes to life with a real-time VSCode-style preview.

![ThemeForge Interface](https://via.placeholder.com/800x450/0d0d14/00f0ff?text=ThemeForge+%E2%80%94+AI+Theme+Generator)

## ✨ Features

- **🤖 AI-Powered Generation** — Uses local LLMs via any OpenAI-compatible API (Ollama, LM Studio, vLLM, etc.)
- **🎨 Real-Time Preview** — See your theme rendered in a realistic VSCode-style canvas preview
- **🖼️ Image Color Extraction** — Upload an image to extract colors and generate matching themes
- **🌗 Dark & Light Themes** — Generate themes with customizable base type and contrast levels
- **⚡ Direct Installation** — Install themes directly to Cursor or VSCode with one click
- **📦 Export Options** — Download as ready-to-use extension ZIP or raw JSON
- **💾 Persistent Settings** — Your preferences are saved locally between sessions
- **🎲 Inspiration Prompts** — Random prompt generator for creative ideas
- **🖥️ Native Desktop App** — Runs as a standalone Electron application

## 🚀 Getting Started

### Prerequisites

1. **A local LLM server** running with OpenAI-compatible API support:
   - [Ollama](https://ollama.ai) (recommended) — `ollama serve`
   - [LM Studio](https://lmstudio.ai) — Enable local server in settings
   - [vLLM](https://github.com/vllm-project/vllm) — Run with OpenAI-compatible endpoint
   - Or any other OpenAI-compatible API

2. **Node.js 18+** (for development)

### Installation

#### Option 1: Run from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/louisbarrett/themeforge.git
   cd themeforge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

#### Option 2: Build Distributable

1. Clone and install dependencies (see above)

2. Build the application:
   ```bash
   # Build for your current platform
   npm run dist

   # Build for specific platforms
   npm run dist:mac    # macOS (DMG + ZIP)
   npm run dist:win    # Windows (NSIS installer + portable)
   npm run dist:linux  # Linux (AppImage + DEB)
   ```

3. Find the built application in the `dist/` folder

### Development Mode

Run with DevTools enabled:
```bash
npm start -- --dev
```

### Quick Start

1. **Start your LLM server** — Ensure Ollama or your preferred server is running
2. **Select a Model** — Click the refresh button to load available models
3. **Enter a Prompt** — Describe your ideal theme (e.g., "Cyberpunk neon with electric blue and hot pink")
4. **Adjust Options** — Choose dark/light base and contrast level
5. **Generate** — Click "Generate Theme" or press `Cmd/Ctrl + Enter`
6. **Install** — Click "Install to Cursor" or "Install to VSCode" to use your theme

## 🎨 Usage

### Writing Effective Prompts

The AI responds well to descriptive, evocative prompts:

```
✅ Good prompts:
• "A warm sunset theme with orange and purple hues"
• "Cyberpunk neon with electric blue and hot pink on dark background"
• "Forest at midnight - deep greens, misty grays, and moonlit silver"
• "Minimalist monochrome with subtle blue accents"
• "Retro synthwave - hot pink, electric purple, chrome silver"

❌ Less effective:
• "A nice theme" (too vague)
• "Blue" (not enough context)
```

### Using Image Colors

1. Click or drag an image to the upload area
2. ThemeForge extracts the dominant colors automatically
3. Click "Use" to add colors to your prompt
4. Generate to create a theme matching your image

### Theme Options

| Option | Values | Description |
|--------|--------|-------------|
| **Base Theme** | Dark / Light | Sets the foundation brightness |
| **Contrast** | Low / Normal / High | Adjusts color intensity and readability |
| **Temperature** | 0.0 - 1.0 | Controls AI creativity (higher = more experimental) |

### API Settings

- **Endpoint** — Your OpenAI-compatible API URL (default: `http://localhost:11434`)
- **Model** — Select from available models on your server
- Supports Ollama, LM Studio, vLLM, and other compatible servers

## 📦 Installing Generated Themes

### Method 1: Direct Install (Recommended)

1. Generate your theme
2. Click **"Install to Cursor"** or **"Install to VSCode"**
3. ThemeForge automatically detects and installs to the correct extensions folder
4. Restart your editor
5. Open Command Palette (`Cmd/Ctrl + Shift + P`) → "Color Theme" → Select your theme

### Method 2: ZIP Download

1. Click **"Download ZIP"**
2. Choose where to save the file
3. Extract the ZIP file
4. Copy the extracted folder to your extensions directory
5. Restart and select your theme

### Extension Paths

| Platform | Cursor | VSCode |
|----------|--------|--------|
| **macOS/Linux** | `~/.cursor/extensions/` | `~/.vscode/extensions/` |
| **Windows** | `%USERPROFILE%\.cursor\extensions\` | `%USERPROFILE%\.vscode\extensions\` |

## 🏗️ Project Structure

```
themeforge/
├── main.js             # Electron main process
├── preload.js          # Secure IPC bridge
├── index.html          # Main application HTML
├── app.js              # Application orchestrator
├── ollama-client.js    # OpenAI-compatible API client
├── canvas-renderer.js  # VSCode-style canvas preview
├── image-palette.js    # Image color extraction
├── theme-installer.js  # Direct installation & ZIP export
├── theme-schema.js     # VSCode theme schema & prompts
├── styles.css          # Cyberpunk-noir styling
├── package.json        # Electron & build configuration
└── assets/
    └── icon.svg        # App icon source
```

## 🔧 Technical Details

### Electron Features

- **Secure Context Isolation** — Renderer process runs in isolated context
- **Native File Dialogs** — Save files anywhere on your system
- **Direct File System Access** — Install themes without browser restrictions
- **Cross-Platform** — Works on macOS, Windows, and Linux

### Theme Generation

ThemeForge uses a simplified palette approach:
1. AI generates ~24 core colors based on your prompt
2. These expand into 100+ VSCode theme properties
3. Includes UI colors, syntax highlighting, terminal colors, and semantic tokens

### Supported Color Properties

- Editor (background, foreground, cursor, selection, line numbers)
- Sidebar & Activity Bar
- Tabs & Title Bar
- Status Bar & Panels
- Inputs, Buttons & Lists
- Terminal (16 ANSI colors)
- Git Decorations
- Syntax Highlighting (25+ token types)
- Semantic Highlighting

## 🎯 Tips & Tricks

1. **Use vivid descriptions** — "Ocean depths with bioluminescent accents" works better than "blue theme"
2. **Reference real things** — "Tokyo neon signs at night" or "Autumn forest at dusk"
3. **Specify color relationships** — "Warm tans with cool blue accents"
4. **Lower temperature** for more predictable results, higher for experimentation
5. **Click individual colors** in the palette to copy hex codes
6. **Upload inspiration images** — Extract colors from photos, art, or screenshots

## 🐛 Troubleshooting

### "Failed to connect to API"
- Ensure your LLM server is running
- Check the endpoint URL is correct
- The app automatically handles `/v1` suffix for OpenAI compatibility

### "No models found"
- Your LLM server may not have any models installed
- For Ollama: `ollama pull llama3.2` to install a model

### Theme not appearing after install
- Restart your editor completely
- Check the extensions folder for the theme directory
- Verify the theme appears in Command Palette → "Color Theme"

### Canvas preview is blank
- Wait for generation to complete
- Check browser console for errors (View → Toggle Developer Tools)

### App won't start
- Ensure Node.js 18+ is installed
- Try deleting `node_modules` and running `npm install` again

## 🏗️ Building App Icons

The source icon is at `assets/icon.svg`. To generate platform-specific icons:

```bash
# macOS - requires iconutil
# Convert SVG to multiple PNG sizes, then:
iconutil -c icns icon.iconset -o assets/icon.icns

# Windows - use a tool like imagemagick or online converter
convert icon.svg -resize 256x256 assets/icon.ico

# Linux
convert icon.svg -resize 512x512 assets/icon.png
```

## 📄 License

MIT License — Feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- Built with [Electron](https://electronjs.org) for cross-platform desktop support
- Uses [JSZip](https://stuk.github.io/jszip/) for extension packaging
- Fonts: [JetBrains Mono](https://www.jetbrains.com/lp/mono/) & [Outfit](https://fonts.google.com/specimen/Outfit)
- Inspired by the VSCode theming community

---

<p align="center">
  <strong>Generated with ❤️ by ThemeForge</strong><br>
  <em>Transform your ideas into beautiful code themes</em>
</p>
