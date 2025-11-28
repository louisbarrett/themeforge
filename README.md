# ThemeForge

**AI-Powered Color Theme Generator for VSCode & Cursor**

ThemeForge is a browser-based tool that generates beautiful, cohesive color themes for your code editor using local AI models. Simply describe the aesthetic you want, and watch as your custom theme comes to life with a real-time VSCode-style preview.

![ThemeForge Interface](https://via.placeholder.com/800x450/0d0d14/00f0ff?text=ThemeForge+%E2%80%94+AI+Theme+Generator)

## ✨ Features

- **🤖 AI-Powered Generation** — Uses local LLMs via any OpenAI-compatible API (Ollama, LM Studio, vLLM, etc.)
- **🎨 Real-Time Preview** — See your theme rendered in a realistic VSCode-style canvas preview
- **🌗 Dark & Light Themes** — Generate themes with customizable base type and contrast levels
- **⚡ Direct Installation** — Install themes directly to Cursor or VSCode with one click
- **📦 Export Options** — Download as ready-to-use extension ZIP or raw JSON
- **💾 Persistent Settings** — Your preferences are saved locally between sessions
- **🎲 Inspiration Prompts** — Random prompt generator for creative ideas

## 🚀 Getting Started

### Prerequisites

1. **A local LLM server** running with OpenAI-compatible API support:
   - [Ollama](https://ollama.ai) (recommended) — `ollama serve`
   - [LM Studio](https://lmstudio.ai) — Enable local server in settings
   - [vLLM](https://github.com/vllm-project/vllm) — Run with OpenAI-compatible endpoint
   - Or any other OpenAI-compatible API

2. **A modern web browser** with JavaScript enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/louisbarrett/themeforge.git
   cd themeforge
   ```

2. Start a local web server:
   ```bash
   # Using Python
   python -m http.server 8080

   # Using Node.js
   npx serve .

   # Using PHP
   php -S localhost:8080
   ```

3. Open `http://localhost:8080` in your browser

4. Ensure your LLM server is running (default: `http://localhost:11434`)

### Quick Start

1. **Select a Model** — Click the refresh button to load available models from your LLM server
2. **Enter a Prompt** — Describe your ideal theme (e.g., "Cyberpunk neon with electric blue and hot pink")
3. **Adjust Options** — Choose dark/light base and contrast level
4. **Generate** — Click "Generate Theme" or press `Cmd/Ctrl + Enter`
5. **Install** — Click "Install to Cursor" or "Install to VSCode" to use your theme

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
3. Select your extensions folder when prompted:
   - **Cursor**: `~/.cursor/extensions`
   - **VSCode**: `~/.vscode/extensions`
4. Restart your editor
5. Open Command Palette (`Cmd/Ctrl + Shift + P`) → "Color Theme" → Select your theme

### Method 2: ZIP Download

1. Click **"Download ZIP"**
2. Extract the ZIP file
3. Copy the extracted folder to your extensions directory
4. Restart and select your theme

### Extension Paths

| Platform | Cursor | VSCode |
|----------|--------|--------|
| **macOS/Linux** | `~/.cursor/extensions/` | `~/.vscode/extensions/` |
| **Windows** | `%USERPROFILE%\.cursor\extensions\` | `%USERPROFILE%\.vscode\extensions\` |

## 🏗️ Project Structure

```
themeforge/
├── index.html          # Main application HTML
├── app.js              # Application orchestrator
├── ollama-client.js    # OpenAI-compatible API client
├── canvas-renderer.js  # VSCode-style canvas preview
├── theme-installer.js  # Direct installation & ZIP export
├── theme-schema.js     # VSCode theme schema & prompts
├── styles.css          # Cyberpunk-noir styling
└── README.md           # This file
```

## 🔧 Technical Details

### Browser APIs Used

- **Canvas API** — Renders the realistic editor preview
- **File System Access API** — Enables direct theme installation (Chrome/Edge)
- **Fetch API** — Communicates with the LLM server
- **localStorage** — Persists user settings

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

## 🐛 Troubleshooting

### "Failed to connect to API"
- Ensure your LLM server is running
- Check the endpoint URL is correct
- Try adding `/v1` to the endpoint if using a non-Ollama server

### "No models found"
- Your LLM server may not have any models installed
- For Ollama: `ollama pull llama3.2` to install a model

### Theme not appearing after install
- Restart your editor completely
- Check the extensions folder for the theme directory
- Verify the theme appears in Command Palette → "Color Theme"

### Canvas preview is blank
- Wait for generation to complete
- Check browser console for errors
- Ensure JavaScript is enabled

## 📄 License

MIT License — Feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- Built with vanilla JavaScript — no framework dependencies
- Uses [JSZip](https://stuk.github.io/jszip/) for extension packaging
- Fonts: [JetBrains Mono](https://www.jetbrains.com/lp/mono/) & [Outfit](https://fonts.google.com/specimen/Outfit)
- Inspired by the VSCode theming community

---

<p align="center">
  <strong>Generated with ❤️ by ThemeForge</strong><br>
  <em>Transform your ideas into beautiful code themes</em>
</p>

