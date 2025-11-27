/**
 * Canvas-based Theme Preview Renderer
 * Renders a realistic VSCode-style editor preview on canvas
 */

class ThemeCanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;
        
        // Preview dimensions (VSCode-like proportions)
        this.width = 900;
        this.height = 600;
        
        // Layout constants
        this.layout = {
            activityBar: { width: 48 },
            sideBar: { width: 220 },
            editor: { lineHeight: 22, fontSize: 13 },
            tabs: { height: 36 },
            titleBar: { height: 32 },
            statusBar: { height: 24 },
            panel: { height: 120 }
        };

        // Sample code for preview
        this.sampleCode = this.getSampleCode();
        
        // Initialize canvas size
        this.resize();
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = this.canvas.parentElement;
        const maxWidth = container.clientWidth - 48;
        const maxHeight = container.clientHeight - 48;
        
        // Maintain aspect ratio
        const aspectRatio = this.width / this.height;
        let displayWidth = maxWidth;
        let displayHeight = displayWidth / aspectRatio;
        
        if (displayHeight > maxHeight) {
            displayHeight = maxHeight;
            displayWidth = displayHeight * aspectRatio;
        }
        
        // Set display size
        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;
        
        // Set actual canvas size (accounting for device pixel ratio)
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        
        // Scale context for retina displays
        this.ctx.scale(this.dpr, this.dpr);
    }

    getSampleCode() {
        return [
            { type: 'comment', text: '// ThemeForge - AI Generated Theme Preview' },
            { type: 'comment', text: '// A beautiful color scheme for your editor' },
            { type: 'blank', text: '' },
            { type: 'import', tokens: [
                { text: 'import', type: 'keyword' },
                { text: ' { ', type: 'punctuation' },
                { text: 'useState', type: 'function' },
                { text: ', ', type: 'punctuation' },
                { text: 'useEffect', type: 'function' },
                { text: ' } ', type: 'punctuation' },
                { text: 'from', type: 'keyword' },
                { text: " '", type: 'punctuation' },
                { text: 'react', type: 'string' },
                { text: "'", type: 'punctuation' },
            ]},
            { type: 'import', tokens: [
                { text: 'import', type: 'keyword' },
                { text: ' ', type: 'punctuation' },
                { text: 'ThemeProvider', type: 'class' },
                { text: ' ', type: 'punctuation' },
                { text: 'from', type: 'keyword' },
                { text: " '", type: 'punctuation' },
                { text: './providers', type: 'string' },
                { text: "'", type: 'punctuation' },
            ]},
            { type: 'blank', text: '' },
            { type: 'interface', tokens: [
                { text: 'interface', type: 'keyword' },
                { text: ' ', type: 'punctuation' },
                { text: 'ThemeConfig', type: 'class' },
                { text: ' {', type: 'punctuation' },
            ]},
            { type: 'property', tokens: [
                { text: '  name', type: 'property' },
                { text: ':', type: 'operator' },
                { text: ' string', type: 'class' },
                { text: ';', type: 'punctuation' },
            ]},
            { type: 'property', tokens: [
                { text: '  colors', type: 'property' },
                { text: ':', type: 'operator' },
                { text: ' Record', type: 'class' },
                { text: '<', type: 'operator' },
                { text: 'string', type: 'class' },
                { text: ', ', type: 'punctuation' },
                { text: 'string', type: 'class' },
                { text: '>', type: 'operator' },
                { text: ';', type: 'punctuation' },
            ]},
            { type: 'property', tokens: [
                { text: '  isDark', type: 'property' },
                { text: ':', type: 'operator' },
                { text: ' boolean', type: 'class' },
                { text: ';', type: 'punctuation' },
            ]},
            { type: 'close', tokens: [
                { text: '}', type: 'punctuation' },
            ]},
            { type: 'blank', text: '' },
            { type: 'const', tokens: [
                { text: 'const', type: 'keyword' },
                { text: ' ', type: 'punctuation' },
                { text: 'DEFAULT_THEME', type: 'variable' },
                { text: ':', type: 'operator' },
                { text: ' ThemeConfig', type: 'class' },
                { text: ' = {', type: 'punctuation' },
            ]},
            { type: 'property', tokens: [
                { text: '  name', type: 'property' },
                { text: ':', type: 'operator' },
                { text: " '", type: 'punctuation' },
                { text: 'Generated Theme', type: 'string' },
                { text: "'", type: 'punctuation' },
                { text: ',', type: 'punctuation' },
            ]},
            { type: 'property', tokens: [
                { text: '  colors', type: 'property' },
                { text: ':', type: 'operator' },
                { text: ' {}', type: 'punctuation' },
                { text: ',', type: 'punctuation' },
            ]},
            { type: 'property', tokens: [
                { text: '  isDark', type: 'property' },
                { text: ':', type: 'operator' },
                { text: ' true', type: 'number' },
                { text: ',', type: 'punctuation' },
            ]},
            { type: 'close', tokens: [
                { text: '};', type: 'punctuation' },
            ]},
            { type: 'blank', text: '' },
            { type: 'function', tokens: [
                { text: 'export', type: 'keyword' },
                { text: ' ', type: 'punctuation' },
                { text: 'function', type: 'keyword' },
                { text: ' ', type: 'punctuation' },
                { text: 'useTheme', type: 'function' },
                { text: '(', type: 'punctuation' },
                { text: 'config', type: 'parameter' },
                { text: '?:', type: 'operator' },
                { text: ' ThemeConfig', type: 'class' },
                { text: ') {', type: 'punctuation' },
            ]},
            { type: 'statement', tokens: [
                { text: '  ', type: 'punctuation' },
                { text: 'const', type: 'keyword' },
                { text: ' [', type: 'punctuation' },
                { text: 'theme', type: 'variable' },
                { text: ', ', type: 'punctuation' },
                { text: 'setTheme', type: 'function' },
                { text: '] = ', type: 'punctuation' },
                { text: 'useState', type: 'function' },
                { text: '(', type: 'punctuation' },
                { text: 'config', type: 'parameter' },
                { text: ' || ', type: 'operator' },
                { text: 'DEFAULT_THEME', type: 'variable' },
                { text: ');', type: 'punctuation' },
            ]},
            { type: 'blank', text: '' },
            { type: 'statement', tokens: [
                { text: '  ', type: 'punctuation' },
                { text: 'useEffect', type: 'function' },
                { text: '(() => {', type: 'punctuation' },
            ]},
            { type: 'statement', tokens: [
                { text: '    ', type: 'punctuation' },
                { text: 'document', type: 'variable' },
                { text: '.', type: 'operator' },
                { text: 'body', type: 'property' },
                { text: '.', type: 'operator' },
                { text: 'dataset', type: 'property' },
                { text: '.', type: 'operator' },
                { text: 'theme', type: 'property' },
                { text: ' = ', type: 'operator' },
                { text: 'theme', type: 'variable' },
                { text: '.', type: 'operator' },
                { text: 'name', type: 'property' },
                { text: ';', type: 'punctuation' },
            ]},
            { type: 'statement', tokens: [
                { text: '  }, [', type: 'punctuation' },
                { text: 'theme', type: 'variable' },
                { text: ']);', type: 'punctuation' },
            ]},
            { type: 'blank', text: '' },
            { type: 'statement', tokens: [
                { text: '  ', type: 'punctuation' },
                { text: 'return', type: 'keyword' },
                { text: ' { ', type: 'punctuation' },
                { text: 'theme', type: 'property' },
                { text: ', ', type: 'punctuation' },
                { text: 'setTheme', type: 'property' },
                { text: ' };', type: 'punctuation' },
            ]},
            { type: 'close', tokens: [
                { text: '}', type: 'punctuation' },
            ]},
        ];
    }

    // Get color for a token type from the theme
    getTokenColor(theme, tokenType) {
        const palette = theme.palette || {};
        const tokenColors = theme.tokenColors || [];
        
        // Map token types to palette colors
        const paletteMap = {
            'comment': palette.comment,
            'string': palette.string,
            'number': palette.number,
            'keyword': palette.keyword,
            'function': palette.function,
            'class': palette.class,
            'variable': palette.variable,
            'parameter': palette.parameter,
            'property': palette.property,
            'operator': palette.operator,
            'tag': palette.tag,
            'attribute': palette.attribute,
            'punctuation': palette.foregroundMuted || palette.foreground,
        };

        if (paletteMap[tokenType]) {
            return paletteMap[tokenType];
        }

        // Fallback to searching tokenColors
        const tokenMap = {
            'comment': 'Comments',
            'string': 'Strings',
            'number': 'Numbers',
            'keyword': 'Keywords',
            'function': 'Functions',
            'class': 'Classes',
            'variable': 'Variables',
            'parameter': 'Parameters',
            'property': 'Properties',
            'operator': 'Operators',
            'punctuation': 'Punctuation',
            'tag': 'HTML/XML Tags',
            'attribute': 'HTML/XML Attributes',
        };

        const tokenName = tokenMap[tokenType];
        const tokenColor = tokenColors.find(t => t.name === tokenName);
        
        if (tokenColor?.settings?.foreground) {
            return tokenColor.settings.foreground;
        }

        // Ultimate fallback
        return palette.foreground || theme.colors?.['editor.foreground'] || '#ffffff';
    }

    render(theme) {
        if (!theme) return;
        
        const ctx = this.ctx;
        const { width, height } = this;
        const { activityBar, sideBar, editor, tabs, titleBar, statusBar, panel } = this.layout;
        
        // Get colors from theme
        const colors = theme.colors || {};
        const palette = theme.palette || {};
        
        const getColor = (key, fallback) => colors[key] || palette[key] || fallback;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Background
        const bgColor = getColor('editor.background', palette.background || '#1e1e2e');
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        
        // Title Bar
        const titleBarColor = getColor('titleBar.activeBackground', palette.backgroundAlt || '#16161e');
        ctx.fillStyle = titleBarColor;
        ctx.fillRect(0, 0, width, titleBar.height);
        
        // Title Bar text
        ctx.fillStyle = getColor('titleBar.activeForeground', palette.foreground || '#c0caf5');
        ctx.font = `500 12px "JetBrains Mono", monospace`;
        ctx.fillText('ThemeForge — preview.tsx', width / 2 - 80, titleBar.height / 2 + 4);
        
        // Window controls (macOS style)
        const controlColors = ['#ff5f57', '#febc2e', '#28c840'];
        controlColors.forEach((color, i) => {
            ctx.beginPath();
            ctx.arc(20 + i * 20, titleBar.height / 2, 6, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        });
        
        // Activity Bar
        const activityBarColor = getColor('activityBar.background', palette.backgroundAlt || '#16161e');
        ctx.fillStyle = activityBarColor;
        ctx.fillRect(0, titleBar.height, activityBar.width, height - titleBar.height);
        
        // Activity Bar icons (simplified)
        const iconColor = getColor('activityBar.foreground', palette.foreground || '#c0caf5');
        const inactiveIconColor = getColor('activityBar.inactiveForeground', palette.foregroundMuted || '#5a5a6e');
        
        const activityIcons = [
            { active: true, y: 60 },
            { active: false, y: 108 },
            { active: false, y: 156 },
            { active: false, y: 204 },
            { active: false, y: 252 },
        ];
        
        activityIcons.forEach(icon => {
            ctx.fillStyle = icon.active ? iconColor : inactiveIconColor;
            ctx.fillRect(14, icon.y, 20, 20);
            
            if (icon.active) {
                ctx.fillStyle = getColor('activityBar.activeBorder', palette.accent || '#00f0ff');
                ctx.fillRect(0, icon.y - 4, 2, 28);
            }
        });
        
        // Sidebar
        const sideBarX = activityBar.width;
        const sideBarColor = getColor('sideBar.background', palette.backgroundAlt || '#16161e');
        ctx.fillStyle = sideBarColor;
        ctx.fillRect(sideBarX, titleBar.height, sideBar.width, height - titleBar.height);
        
        // Sidebar border
        ctx.fillStyle = getColor('sideBar.border', palette.border || 'rgba(255,255,255,0.1)');
        ctx.fillRect(sideBarX + sideBar.width - 1, titleBar.height, 1, height - titleBar.height);
        
        // Sidebar title
        ctx.fillStyle = getColor('sideBarSectionHeader.foreground', palette.foregroundMuted || '#9898a8');
        ctx.font = `600 11px "Outfit", sans-serif`;
        ctx.fillText('EXPLORER', sideBarX + 12, titleBar.height + 24);
        
        // File tree items
        const fileTree = [
            { name: 'themegen', indent: 0, isFolder: true, expanded: true },
            { name: 'src', indent: 1, isFolder: true, expanded: true },
            { name: 'components', indent: 2, isFolder: true, expanded: false },
            { name: 'hooks', indent: 2, isFolder: true, expanded: false },
            { name: 'preview.tsx', indent: 2, isFolder: false, active: true },
            { name: 'theme-schema.ts', indent: 2, isFolder: false },
            { name: 'canvas-renderer.ts', indent: 2, isFolder: false },
            { name: 'ollama-client.ts', indent: 2, isFolder: false },
            { name: 'utils.ts', indent: 2, isFolder: false },
            { name: 'public', indent: 1, isFolder: true, expanded: false },
            { name: 'package.json', indent: 1, isFolder: false },
            { name: 'tsconfig.json', indent: 1, isFolder: false },
        ];
        
        let fileY = titleBar.height + 44;
        fileTree.forEach(file => {
            const x = sideBarX + 12 + file.indent * 16;
            
            // Highlight active file
            if (file.active) {
                ctx.fillStyle = getColor('list.activeSelectionBackground', 'rgba(0, 240, 255, 0.15)');
                ctx.fillRect(sideBarX, fileY - 4, sideBar.width, 22);
            }
            
            // Icon
            ctx.fillStyle = file.isFolder 
                ? getColor('icon.foreground', palette.warning || '#e0af68')
                : getColor('icon.foreground', palette.info || '#7aa2f7');
            ctx.fillRect(x, fileY + 2, 12, 12);
            
            // File name
            ctx.fillStyle = file.active 
                ? getColor('list.activeSelectionForeground', palette.foreground || '#e4e4ef')
                : getColor('sideBar.foreground', palette.foreground || '#e4e4ef');
            ctx.font = `400 12px "JetBrains Mono", monospace`;
            ctx.fillText(file.name, x + 18, fileY + 12);
            
            fileY += 22;
        });
        
        // Editor area
        const editorX = activityBar.width + sideBar.width;
        const editorWidth = width - editorX;
        
        // Tab bar
        const tabBarY = titleBar.height;
        ctx.fillStyle = getColor('editorGroupHeader.tabsBackground', palette.backgroundAlt || '#16161e');
        ctx.fillRect(editorX, tabBarY, editorWidth, tabs.height);
        
        // Active tab
        const tabWidth = 160;
        ctx.fillStyle = getColor('tab.activeBackground', palette.background || '#1e1e2e');
        ctx.fillRect(editorX, tabBarY, tabWidth, tabs.height);
        
        // Tab active indicator
        ctx.fillStyle = getColor('tab.activeBorderTop', palette.accent || '#00f0ff');
        ctx.fillRect(editorX, tabBarY, tabWidth, 2);
        
        // Tab text
        ctx.fillStyle = getColor('tab.activeForeground', palette.foreground || '#e4e4ef');
        ctx.font = `400 12px "JetBrains Mono", monospace`;
        ctx.fillText('preview.tsx', editorX + 28, tabBarY + tabs.height / 2 + 4);
        
        // Inactive tab
        ctx.fillStyle = getColor('tab.inactiveBackground', palette.backgroundAlt || '#16161e');
        ctx.fillRect(editorX + tabWidth, tabBarY, tabWidth, tabs.height);
        ctx.fillStyle = getColor('tab.inactiveForeground', palette.foregroundMuted || '#5a5a6e');
        ctx.fillText('theme-schema.ts', editorX + tabWidth + 28, tabBarY + tabs.height / 2 + 4);
        
        // Editor content area
        const contentY = titleBar.height + tabs.height;
        const contentHeight = height - contentY - statusBar.height - panel.height;
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(editorX, contentY, editorWidth, contentHeight);
        
        // Line numbers gutter
        const gutterWidth = 50;
        ctx.fillStyle = getColor('editorGutter.background', bgColor);
        ctx.fillRect(editorX, contentY, gutterWidth, contentHeight);
        
        // Render code with syntax highlighting
        const lineNumberColor = getColor('editorLineNumber.foreground', palette.foregroundMuted || '#3b4261');
        const activeLineNumberColor = getColor('editorLineNumber.activeForeground', palette.foreground || '#737aa2');
        const activeLineHighlight = getColor('editor.lineHighlightBackground', 'rgba(255,255,255,0.03)');
        
        let codeY = contentY + 8;
        const codeX = editorX + gutterWidth + 12;
        const activeLineIndex = 19; // Highlight a specific line
        
        this.sampleCode.forEach((line, index) => {
            const lineNum = index + 1;
            const isActiveLine = index === activeLineIndex;
            
            // Active line highlight
            if (isActiveLine) {
                ctx.fillStyle = activeLineHighlight;
                ctx.fillRect(editorX, codeY - 4, editorWidth, editor.lineHeight);
            }
            
            // Line number
            ctx.fillStyle = isActiveLine ? activeLineNumberColor : lineNumberColor;
            ctx.font = `400 ${editor.fontSize}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'right';
            ctx.fillText(lineNum.toString(), editorX + gutterWidth - 8, codeY + editor.fontSize - 2);
            ctx.textAlign = 'left';
            
            // Code content
            if (line.type === 'comment') {
                ctx.fillStyle = this.getTokenColor(theme, 'comment');
                ctx.font = `italic ${editor.fontSize}px "JetBrains Mono", monospace`;
                ctx.fillText(line.text, codeX, codeY + editor.fontSize - 2);
            } else if (line.type === 'blank') {
                // Empty line
            } else if (line.tokens) {
                let tokenX = codeX;
                line.tokens.forEach(token => {
                    ctx.fillStyle = this.getTokenColor(theme, token.type);
                    ctx.font = token.type === 'parameter' 
                        ? `italic ${editor.fontSize}px "JetBrains Mono", monospace`
                        : `400 ${editor.fontSize}px "JetBrains Mono", monospace`;
                    ctx.fillText(token.text, tokenX, codeY + editor.fontSize - 2);
                    tokenX += ctx.measureText(token.text).width;
                });
            }
            
            codeY += editor.lineHeight;
        });
        
        // Cursor
        const cursorLine = activeLineIndex;
        const cursorY = contentY + 8 + cursorLine * editor.lineHeight;
        ctx.fillStyle = getColor('editorCursor.foreground', palette.accent || '#00f0ff');
        ctx.fillRect(codeX + 140, cursorY - 2, 2, editor.lineHeight - 4);
        
        // Panel (Terminal)
        const panelY = height - statusBar.height - panel.height;
        ctx.fillStyle = getColor('panel.background', palette.background || '#1e1e2e');
        ctx.fillRect(editorX, panelY, editorWidth, panel.height);
        
        // Panel border
        ctx.fillStyle = getColor('panel.border', palette.border || 'rgba(255,255,255,0.1)');
        ctx.fillRect(editorX, panelY, editorWidth, 1);
        
        // Panel tabs
        ctx.fillStyle = getColor('panelTitle.activeForeground', palette.foreground || '#e4e4ef');
        ctx.font = `500 11px "Outfit", sans-serif`;
        ctx.fillText('TERMINAL', editorX + 12, panelY + 18);
        
        ctx.fillStyle = getColor('panelTitle.inactiveForeground', palette.foregroundMuted || '#5a5a6e');
        ctx.fillText('PROBLEMS', editorX + 90, panelY + 18);
        ctx.fillText('OUTPUT', editorX + 170, panelY + 18);
        
        // Active panel indicator
        ctx.fillStyle = getColor('panelTitle.activeBorder', palette.accent || '#00f0ff');
        ctx.fillRect(editorX + 12, panelY + 24, 60, 2);
        
        // Terminal content
        const terminalY = panelY + 36;
        ctx.fillStyle = getColor('terminal.foreground', palette.foreground || '#e4e4ef');
        ctx.font = `400 12px "JetBrains Mono", monospace`;
        ctx.fillText('$ npm run dev', editorX + 12, terminalY + 14);
        
        ctx.fillStyle = getColor('terminal.ansiGreen', palette.success || '#00ff88');
        ctx.fillText('✓ Ready in 1.2s', editorX + 12, terminalY + 36);
        
        ctx.fillStyle = getColor('terminal.ansiCyan', palette.info || '#00f0ff');
        ctx.fillText('➜ Local: http://localhost:3000', editorX + 12, terminalY + 58);
        
        // Status Bar
        const statusY = height - statusBar.height;
        ctx.fillStyle = getColor('statusBar.background', palette.backgroundAlt || '#16161e');
        ctx.fillRect(0, statusY, width, statusBar.height);
        
        // Status bar items
        ctx.font = `400 11px "JetBrains Mono", monospace`;
        
        // Branch indicator
        ctx.fillStyle = getColor('statusBar.foreground', palette.foreground || '#c0caf5');
        ctx.fillText('⎇ main', 12, statusY + 16);
        
        // Status items right side
        const rightItems = ['TypeScript', 'UTF-8', 'LF', 'Ln 20, Col 45'];
        let rightX = width - 12;
        rightItems.reverse().forEach(item => {
            const itemWidth = ctx.measureText(item).width + 16;
            rightX -= itemWidth;
            ctx.fillText(item, rightX, statusY + 16);
        });
        
        // Notification badge on activity bar
        ctx.fillStyle = getColor('activityBarBadge.background', palette.accent || '#00f0ff');
        ctx.beginPath();
        ctx.arc(38, 154, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = getColor('activityBarBadge.foreground', palette.background || '#0a0a0f');
        ctx.font = `600 9px "Outfit", sans-serif`;
        ctx.fillText('3', 35, 157);
        
        // Selection highlight demo
        ctx.fillStyle = getColor('editor.selectionBackground', 'rgba(0, 240, 255, 0.3)');
        ctx.fillRect(codeX + 80, contentY + 8 + 3 * editor.lineHeight - 4, 100, editor.lineHeight);
    }

    // Clear the canvas
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    // Render a loading state
    renderLoading() {
        const ctx = this.ctx;
        const { width, height } = this;
        
        // Dark background
        ctx.fillStyle = '#0d0d14';
        ctx.fillRect(0, 0, width, height);
        
        // Loading spinner
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 30;
        
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        const now = Date.now();
        const angle = (now / 500) % (Math.PI * 2);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, angle, angle + Math.PI * 1.5);
        ctx.stroke();
        
        // Loading text
        ctx.fillStyle = '#9898a8';
        ctx.font = '14px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Generating theme...', centerX, centerY + 60);
        ctx.textAlign = 'left';
    }

    // Animate loading
    startLoadingAnimation() {
        this.isLoading = true;
        const animate = () => {
            if (!this.isLoading) return;
            this.renderLoading();
            requestAnimationFrame(animate);
        };
        animate();
    }

    stopLoadingAnimation() {
        this.isLoading = false;
    }
}

// Export
window.ThemeCanvasRenderer = ThemeCanvasRenderer;

