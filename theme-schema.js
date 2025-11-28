/**
 * VSCode Theme Schema Definition
 * Provides structure and prompt templates for AI-generated themes
 */

const ThemeSchema = {
    // Core color categories for theme generation
    colorCategories: {
        // Primary UI colors
        ui: [
            'editor.background',
            'editor.foreground',
            'sideBar.background',
            'sideBar.foreground',
            'activityBar.background',
            'activityBar.foreground',
            'statusBar.background',
            'statusBar.foreground',
            'titleBar.activeBackground',
            'titleBar.activeForeground',
            'tab.activeBackground',
            'tab.activeForeground',
            'tab.inactiveBackground',
            'tab.inactiveForeground',
            'panel.background',
            'panel.border',
        ],
        // Editor specific colors
        editor: [
            'editorCursor.foreground',
            'editor.lineHighlightBackground',
            'editor.selectionBackground',
            'editor.selectionHighlightBackground',
            'editorLineNumber.foreground',
            'editorLineNumber.activeForeground',
            'editorIndentGuide.background',
            'editorIndentGuide.activeBackground',
            'editorBracketMatch.background',
            'editorBracketMatch.border',
            'editorWhitespace.foreground',
        ],
        // Widget colors
        widgets: [
            'editorWidget.background',
            'editorWidget.border',
            'editorSuggestWidget.background',
            'editorSuggestWidget.selectedBackground',
            'input.background',
            'input.border',
            'input.foreground',
            'input.placeholderForeground',
            'dropdown.background',
            'dropdown.border',
            'dropdown.foreground',
            'button.background',
            'button.foreground',
            'button.hoverBackground',
        ],
        // Lists and trees
        lists: [
            'list.activeSelectionBackground',
            'list.activeSelectionForeground',
            'list.hoverBackground',
            'list.hoverForeground',
            'list.focusBackground',
            'list.highlightForeground',
        ],
        // Terminal colors
        terminal: [
            'terminal.background',
            'terminal.foreground',
            'terminal.ansiBlack',
            'terminal.ansiRed',
            'terminal.ansiGreen',
            'terminal.ansiYellow',
            'terminal.ansiBlue',
            'terminal.ansiMagenta',
            'terminal.ansiCyan',
            'terminal.ansiWhite',
            'terminal.ansiBrightBlack',
            'terminal.ansiBrightRed',
            'terminal.ansiBrightGreen',
            'terminal.ansiBrightYellow',
            'terminal.ansiBrightBlue',
            'terminal.ansiBrightMagenta',
            'terminal.ansiBrightCyan',
            'terminal.ansiBrightWhite',
        ],
        // Git decoration colors
        git: [
            'gitDecoration.addedResourceForeground',
            'gitDecoration.modifiedResourceForeground',
            'gitDecoration.deletedResourceForeground',
            'gitDecoration.untrackedResourceForeground',
            'gitDecoration.ignoredResourceForeground',
        ],
        // Accent and notification colors
        accents: [
            'focusBorder',
            'progressBar.background',
            'badge.background',
            'badge.foreground',
            'activityBarBadge.background',
            'activityBarBadge.foreground',
            'notificationCenter.border',
            'notifications.background',
            'notifications.foreground',
        ],
    },

    // Syntax token scopes for code highlighting
    tokenScopes: {
        comments: ['comment', 'punctuation.definition.comment'],
        strings: ['string', 'string.quoted', 'string.template'],
        numbers: ['constant.numeric', 'constant.numeric.integer', 'constant.numeric.float'],
        constants: ['constant', 'constant.language', 'constant.character'],
        keywords: ['keyword', 'keyword.control', 'keyword.operator.new'],
        storage: ['storage', 'storage.type', 'storage.modifier'],
        operators: ['keyword.operator', 'keyword.operator.assignment'],
        functions: ['entity.name.function', 'support.function', 'meta.function-call'],
        classes: ['entity.name.type', 'entity.name.class', 'support.class'],
        interfaces: ['entity.name.type.interface'],
        types: ['support.type', 'entity.name.type.alias'],
        variables: ['variable', 'variable.other', 'variable.language'],
        parameters: ['variable.parameter'],
        properties: ['variable.other.property', 'support.variable.property'],
        tags: ['entity.name.tag', 'punctuation.definition.tag'],
        attributes: ['entity.other.attribute-name'],
        punctuation: ['punctuation', 'meta.brace'],
        regex: ['string.regexp'],
        escape: ['constant.character.escape'],
        invalid: ['invalid', 'invalid.illegal'],
    },

    // Font style options
    fontStyles: ['', 'italic', 'bold', 'underline', 'italic bold'],

    // Generate the system prompt for Ollama
    generateSystemPrompt() {
        return `You are an expert VSCode theme designer. You create beautiful, cohesive color themes with excellent contrast and readability.

When generating a theme, follow these rules:
1. Ensure sufficient contrast between background and foreground colors (WCAG AA minimum)
2. Create a cohesive color palette with 5-8 main colors
3. Use semantic colors consistently (errors=red, warnings=yellow, success=green, info=blue)
4. Consider color blindness - don't rely solely on red/green distinction
5. Syntax highlighting should make code scannable and readable

Your output must be valid JSON matching the VSCode theme format exactly.`;
    },

    // Generate the user prompt with schema
    generateUserPrompt(description, options = {}) {
        const { baseTheme = 'dark', contrast = 'normal' } = options;
        
        const contrastGuidance = {
            low: 'Use subtle, muted colors with gentle contrast. Soft on the eyes.',
            normal: 'Use balanced contrast suitable for extended coding sessions.',
            high: 'Use strong contrast for maximum readability. Bold color differences.',
        };

        return `Create a VSCode color theme based on this description: "${description}"

Base Theme: ${baseTheme}
Contrast Level: ${contrast} - ${contrastGuidance[contrast]}

Generate a complete theme with the following JSON structure:

{
  "name": "Theme Name",
  "type": "${baseTheme}",
  "colors": {
    // Editor
    "editor.background": "#hex",
    "editor.foreground": "#hex",
    "editorCursor.foreground": "#hex",
    "editor.lineHighlightBackground": "#hex",
    "editor.selectionBackground": "#hex",
    "editor.selectionHighlightBackground": "#hex",
    "editorLineNumber.foreground": "#hex",
    "editorLineNumber.activeForeground": "#hex",
    "editorIndentGuide.background": "#hex",
    "editorIndentGuide.activeBackground": "#hex",
    "editorBracketMatch.background": "#hex",
    "editorBracketMatch.border": "#hex",
    
    // Sidebar
    "sideBar.background": "#hex",
    "sideBar.foreground": "#hex",
    "sideBarTitle.foreground": "#hex",
    "sideBarSectionHeader.background": "#hex",
    "sideBarSectionHeader.foreground": "#hex",
    
    // Activity Bar
    "activityBar.background": "#hex",
    "activityBar.foreground": "#hex",
    "activityBar.inactiveForeground": "#hex",
    "activityBarBadge.background": "#hex",
    "activityBarBadge.foreground": "#hex",
    
    // Tabs
    "tab.activeBackground": "#hex",
    "tab.activeForeground": "#hex",
    "tab.inactiveBackground": "#hex",
    "tab.inactiveForeground": "#hex",
    "tab.border": "#hex",
    "editorGroupHeader.tabsBackground": "#hex",
    
    // Title Bar
    "titleBar.activeBackground": "#hex",
    "titleBar.activeForeground": "#hex",
    "titleBar.inactiveBackground": "#hex",
    "titleBar.inactiveForeground": "#hex",
    
    // Status Bar
    "statusBar.background": "#hex",
    "statusBar.foreground": "#hex",
    "statusBar.debuggingBackground": "#hex",
    "statusBar.debuggingForeground": "#hex",
    "statusBar.noFolderBackground": "#hex",
    "statusBarItem.hoverBackground": "#hex",
    
    // Panel
    "panel.background": "#hex",
    "panel.border": "#hex",
    "panelTitle.activeBorder": "#hex",
    "panelTitle.activeForeground": "#hex",
    "panelTitle.inactiveForeground": "#hex",
    
    // Inputs
    "input.background": "#hex",
    "input.border": "#hex",
    "input.foreground": "#hex",
    "input.placeholderForeground": "#hex",
    "inputOption.activeBorder": "#hex",
    
    // Buttons
    "button.background": "#hex",
    "button.foreground": "#hex",
    "button.hoverBackground": "#hex",
    "button.secondaryBackground": "#hex",
    "button.secondaryForeground": "#hex",
    
    // Lists
    "list.activeSelectionBackground": "#hex",
    "list.activeSelectionForeground": "#hex",
    "list.hoverBackground": "#hex",
    "list.hoverForeground": "#hex",
    "list.focusBackground": "#hex",
    "list.highlightForeground": "#hex",
    
    // Scrollbar
    "scrollbar.shadow": "#hex",
    "scrollbarSlider.activeBackground": "#hex",
    "scrollbarSlider.background": "#hex",
    "scrollbarSlider.hoverBackground": "#hex",
    
    // Terminal
    "terminal.background": "#hex",
    "terminal.foreground": "#hex",
    "terminal.ansiBlack": "#hex",
    "terminal.ansiRed": "#hex",
    "terminal.ansiGreen": "#hex",
    "terminal.ansiYellow": "#hex",
    "terminal.ansiBlue": "#hex",
    "terminal.ansiMagenta": "#hex",
    "terminal.ansiCyan": "#hex",
    "terminal.ansiWhite": "#hex",
    "terminal.ansiBrightBlack": "#hex",
    "terminal.ansiBrightRed": "#hex",
    "terminal.ansiBrightGreen": "#hex",
    "terminal.ansiBrightYellow": "#hex",
    "terminal.ansiBrightBlue": "#hex",
    "terminal.ansiBrightMagenta": "#hex",
    "terminal.ansiBrightCyan": "#hex",
    "terminal.ansiBrightWhite": "#hex",
    
    // Miscellaneous
    "focusBorder": "#hex",
    "foreground": "#hex",
    "widget.shadow": "#hex",
    "selection.background": "#hex",
    "icon.foreground": "#hex",
    
    // Git
    "gitDecoration.addedResourceForeground": "#hex",
    "gitDecoration.modifiedResourceForeground": "#hex",
    "gitDecoration.deletedResourceForeground": "#hex",
    "gitDecoration.untrackedResourceForeground": "#hex",
    "gitDecoration.ignoredResourceForeground": "#hex",
    
    // Badges
    "badge.background": "#hex",
    "badge.foreground": "#hex",
    
    // Progress Bar
    "progressBar.background": "#hex",
    
    // Peek View
    "peekView.border": "#hex",
    "peekViewEditor.background": "#hex",
    "peekViewEditor.matchHighlightBackground": "#hex",
    "peekViewResult.background": "#hex",
    "peekViewResult.fileForeground": "#hex",
    "peekViewResult.lineForeground": "#hex",
    "peekViewResult.matchHighlightBackground": "#hex",
    "peekViewResult.selectionBackground": "#hex",
    "peekViewResult.selectionForeground": "#hex",
    "peekViewTitle.background": "#hex",
    "peekViewTitleDescription.foreground": "#hex",
    "peekViewTitleLabel.foreground": "#hex"
  },
  "tokenColors": [
    {
      "name": "Comments",
      "scope": ["comment", "punctuation.definition.comment"],
      "settings": { "foreground": "#hex", "fontStyle": "italic" }
    },
    {
      "name": "Strings",
      "scope": ["string", "string.quoted"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "Numbers",
      "scope": ["constant.numeric"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "Constants",
      "scope": ["constant", "constant.language", "constant.character"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "Keywords",
      "scope": ["keyword", "keyword.control", "keyword.operator.new"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "Storage/Types",
      "scope": ["storage", "storage.type", "storage.modifier"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "Operators",
      "scope": ["keyword.operator", "keyword.operator.assignment"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "Functions",
      "scope": ["entity.name.function", "support.function", "meta.function-call"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "Classes",
      "scope": ["entity.name.type", "entity.name.class", "support.class"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "Interfaces",
      "scope": ["entity.name.type.interface"],
      "settings": { "foreground": "#hex", "fontStyle": "italic" }
    },
    {
      "name": "Variables",
      "scope": ["variable", "variable.other"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "Parameters",
      "scope": ["variable.parameter"],
      "settings": { "foreground": "#hex", "fontStyle": "italic" }
    },
    {
      "name": "Properties",
      "scope": ["variable.other.property", "support.variable.property"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "HTML/XML Tags",
      "scope": ["entity.name.tag", "punctuation.definition.tag"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "HTML/XML Attributes",
      "scope": ["entity.other.attribute-name"],
      "settings": { "foreground": "#hex", "fontStyle": "italic" }
    },
    {
      "name": "CSS Selectors",
      "scope": ["entity.name.tag.css", "entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "CSS Properties",
      "scope": ["support.type.property-name.css"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "CSS Values",
      "scope": ["support.constant.property-value.css", "support.constant.color.css"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "Punctuation",
      "scope": ["punctuation", "meta.brace"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "Regex",
      "scope": ["string.regexp"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "Escape Characters",
      "scope": ["constant.character.escape"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "Invalid",
      "scope": ["invalid", "invalid.illegal"],
      "settings": { "foreground": "#hex", "fontStyle": "underline" }
    },
    {
      "name": "Markdown Headings",
      "scope": ["markup.heading", "entity.name.section.markdown"],
      "settings": { "foreground": "#hex", "fontStyle": "bold" }
    },
    {
      "name": "Markdown Bold",
      "scope": ["markup.bold"],
      "settings": { "fontStyle": "bold" }
    },
    {
      "name": "Markdown Italic",
      "scope": ["markup.italic"],
      "settings": { "fontStyle": "italic" }
    },
    {
      "name": "Markdown Link",
      "scope": ["markup.underline.link"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "Markdown Code",
      "scope": ["markup.inline.raw", "markup.fenced_code.block"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "JSON Keys",
      "scope": ["support.type.property-name.json"],
      "settings": { "foreground": "#hex" }
    },
    {
      "name": "JSON Values",
      "scope": ["string.quoted.double.json"],
      "settings": { "foreground": "#hex" }
    }
  ],
  "semanticHighlighting": true,
  "semanticTokenColors": {
    "variable.declaration": "#hex",
    "variable.readonly": "#hex",
    "parameter": "#hex",
    "property": "#hex",
    "function": "#hex",
    "method": "#hex",
    "class": "#hex",
    "interface": "#hex",
    "enum": "#hex",
    "enumMember": "#hex",
    "namespace": "#hex",
    "type": "#hex"
  }
}

IMPORTANT:
- Replace ALL "#hex" placeholders with actual hex color codes
- All colors must be valid 6-digit hex codes starting with #
- Ensure the JSON is valid and complete
- Create colors that match the theme description
- Only output the JSON, no explanations or markdown`;
    },

    // Simplified prompt for faster generation (fewer colors)
    generateSimplifiedPrompt(description, options = {}) {
        const { baseTheme = 'dark', contrast = 'normal' } = options;
        
        return `Create a VSCode color theme: "${description}"
Theme type: ${baseTheme}, Contrast: ${contrast}

Output ONLY valid JSON with this exact structure (replace #hex with real colors):

{
  "name": "Theme Name Based On Description",
  "type": "${baseTheme}",
  "palette": {
    "background": "#hex",
    "backgroundAlt": "#hex",
    "foreground": "#hex",
    "foregroundMuted": "#hex",
    "accent": "#hex",
    "accentSecondary": "#hex",
    "border": "#hex",
    "selection": "#hex",
    "comment": "#hex",
    "string": "#hex",
    "number": "#hex",
    "keyword": "#hex",
    "function": "#hex",
    "class": "#hex",
    "variable": "#hex",
    "parameter": "#hex",
    "property": "#hex",
    "operator": "#hex",
    "tag": "#hex",
    "attribute": "#hex",
    "error": "#hex",
    "warning": "#hex",
    "success": "#hex",
    "info": "#hex"
  }
}

Rules:
- All values must be valid 6-digit hex color codes
- Output ONLY the JSON, nothing else
- No markdown, no explanations
- Colors must reflect "${description}"`;
    },

    // Expand simplified palette to full VSCode theme
    expandPaletteToTheme(palette, name, type) {
        // Helper to create alpha variants
        const withAlpha = (hex, alpha) => {
            if (!hex) return '#00000000';
            const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
            return hex + a;
        };

        // Helper to lighten/darken colors
        const adjustBrightness = (hex, amount) => {
            if (!hex) return type === 'dark' ? '#333333' : '#cccccc';
            try {
                const num = parseInt(hex.slice(1), 16);
                const r = Math.min(255, Math.max(0, (num >> 16) + amount));
                const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
                const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
                return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
            } catch (e) {
                return hex;
            }
        };
        
        // Ensure all required palette colors exist with sensible defaults
        const isDark = type === 'dark';
        const bg = palette.background || (isDark ? '#1e1e1e' : '#ffffff');
        const fg = palette.foreground || (isDark ? '#d4d4d4' : '#333333');
        const accent = palette.accent || '#007acc';
        
        const p = {
            background: bg,
            backgroundAlt: palette.backgroundAlt || adjustBrightness(bg, isDark ? 15 : -10),
            foreground: fg,
            foregroundMuted: palette.foregroundMuted || adjustBrightness(fg, isDark ? -60 : 60),
            accent: accent,
            selection: palette.selection || (isDark ? '#264f78' : '#add6ff'),
            border: palette.border || adjustBrightness(bg, isDark ? 30 : -30),
            comment: palette.comment || (isDark ? '#6a9955' : '#008000'),
            string: palette.string || (isDark ? '#ce9178' : '#a31515'),
            number: palette.number || palette.string || (isDark ? '#b5cea8' : '#098658'),
            keyword: palette.keyword || (isDark ? '#569cd6' : '#0000ff'),
            function: palette.function || accent || '#dcdcaa',
            class: palette.class || palette.keyword || '#4ec9b0',
            variable: palette.variable || fg || '#9cdcfe',
            parameter: palette.parameter || palette.variable || fg,
            property: palette.property || palette.variable || '#9cdcfe',
            operator: palette.operator || fg,
            tag: palette.tag || palette.keyword || (isDark ? '#569cd6' : '#800000'),
            attribute: palette.attribute || palette.property || (isDark ? '#9cdcfe' : '#ff0000'),
            error: palette.error || '#f14c4c',
            warning: palette.warning || '#cca700',
            success: palette.success || '#89d185',
            info: palette.info || accent || '#3794ff'
        };
        
        // Fill in any remaining nulls with foreground
        Object.keys(p).forEach(key => {
            if (!p[key]) p[key] = fg;
        });

        return {
            name: name,
            type: type,
            colors: {
                // Editor
                "editor.background": p.background,
                "editor.foreground": p.foreground,
                "editorCursor.foreground": p.accent,
                "editor.lineHighlightBackground": withAlpha(p.foreground, 0.05),
                "editor.selectionBackground": withAlpha(p.selection, 0.4),
                "editor.selectionHighlightBackground": withAlpha(p.selection, 0.2),
                "editorLineNumber.foreground": p.foregroundMuted,
                "editorLineNumber.activeForeground": p.foreground,
                "editorIndentGuide.background": withAlpha(p.foreground, 0.08),
                "editorIndentGuide.activeBackground": withAlpha(p.foreground, 0.2),
                "editorBracketMatch.background": withAlpha(p.accent, 0.2),
                "editorBracketMatch.border": p.accent,
                "editorWhitespace.foreground": withAlpha(p.foreground, 0.15),
                
                // Sidebar
                "sideBar.background": p.backgroundAlt,
                "sideBar.foreground": p.foreground,
                "sideBarTitle.foreground": p.foreground,
                "sideBarSectionHeader.background": p.backgroundAlt,
                "sideBarSectionHeader.foreground": p.foregroundMuted,
                
                // Activity Bar
                "activityBar.background": p.backgroundAlt,
                "activityBar.foreground": p.foreground,
                "activityBar.inactiveForeground": p.foregroundMuted,
                "activityBarBadge.background": p.accent,
                "activityBarBadge.foreground": p.background,
                
                // Tabs
                "tab.activeBackground": p.background,
                "tab.activeForeground": p.foreground,
                "tab.inactiveBackground": p.backgroundAlt,
                "tab.inactiveForeground": p.foregroundMuted,
                "tab.border": p.border,
                "tab.activeBorder": p.accent,
                "tab.activeBorderTop": p.accent,
                "editorGroupHeader.tabsBackground": p.backgroundAlt,
                
                // Title Bar
                "titleBar.activeBackground": p.backgroundAlt,
                "titleBar.activeForeground": p.foreground,
                "titleBar.inactiveBackground": p.backgroundAlt,
                "titleBar.inactiveForeground": p.foregroundMuted,
                
                // Status Bar
                "statusBar.background": p.backgroundAlt,
                "statusBar.foreground": p.foreground,
                "statusBar.debuggingBackground": p.warning,
                "statusBar.debuggingForeground": p.background,
                "statusBar.noFolderBackground": p.backgroundAlt,
                "statusBarItem.hoverBackground": withAlpha(p.foreground, 0.1),
                
                // Panel
                "panel.background": p.background,
                "panel.border": p.border,
                "panelTitle.activeBorder": p.accent,
                "panelTitle.activeForeground": p.foreground,
                "panelTitle.inactiveForeground": p.foregroundMuted,
                
                // Inputs
                "input.background": p.backgroundAlt,
                "input.border": p.border,
                "input.foreground": p.foreground,
                "input.placeholderForeground": p.foregroundMuted,
                "inputOption.activeBorder": p.accent,
                
                // Buttons
                "button.background": p.accent,
                "button.foreground": p.background,
                "button.hoverBackground": adjustBrightness(p.accent, 20),
                "button.secondaryBackground": p.backgroundAlt,
                "button.secondaryForeground": p.foreground,
                
                // Lists
                "list.activeSelectionBackground": withAlpha(p.accent, 0.3),
                "list.activeSelectionForeground": p.foreground,
                "list.hoverBackground": withAlpha(p.foreground, 0.05),
                "list.hoverForeground": p.foreground,
                "list.focusBackground": withAlpha(p.accent, 0.2),
                "list.highlightForeground": p.accent,
                
                // Scrollbar
                "scrollbar.shadow": withAlpha("#000000", 0.3),
                "scrollbarSlider.activeBackground": withAlpha(p.foreground, 0.4),
                "scrollbarSlider.background": withAlpha(p.foreground, 0.15),
                "scrollbarSlider.hoverBackground": withAlpha(p.foreground, 0.25),
                
                // Terminal
                "terminal.background": p.background,
                "terminal.foreground": p.foreground,
                "terminal.ansiBlack": adjustBrightness(p.background, 30),
                "terminal.ansiRed": p.error,
                "terminal.ansiGreen": p.success,
                "terminal.ansiYellow": p.warning,
                "terminal.ansiBlue": p.info,
                "terminal.ansiMagenta": p.keyword,
                "terminal.ansiCyan": p.class,
                "terminal.ansiWhite": p.foreground,
                "terminal.ansiBrightBlack": p.foregroundMuted,
                "terminal.ansiBrightRed": adjustBrightness(p.error, 30),
                "terminal.ansiBrightGreen": adjustBrightness(p.success, 30),
                "terminal.ansiBrightYellow": adjustBrightness(p.warning, 30),
                "terminal.ansiBrightBlue": adjustBrightness(p.info, 30),
                "terminal.ansiBrightMagenta": adjustBrightness(p.keyword, 30),
                "terminal.ansiBrightCyan": adjustBrightness(p.class, 30),
                "terminal.ansiBrightWhite": adjustBrightness(p.foreground, 30),
                
                // Misc
                "focusBorder": p.accent,
                "foreground": p.foreground,
                "widget.shadow": withAlpha("#000000", 0.4),
                "selection.background": withAlpha(p.selection, 0.4),
                "icon.foreground": p.foregroundMuted,
                
                // Git
                "gitDecoration.addedResourceForeground": p.success,
                "gitDecoration.modifiedResourceForeground": p.warning,
                "gitDecoration.deletedResourceForeground": p.error,
                "gitDecoration.untrackedResourceForeground": p.info,
                "gitDecoration.ignoredResourceForeground": p.foregroundMuted,
                
                // Badges
                "badge.background": p.accent,
                "badge.foreground": p.background,
                
                // Progress
                "progressBar.background": p.accent,
                
                // Peek View
                "peekView.border": p.accent,
                "peekViewEditor.background": p.backgroundAlt,
                "peekViewEditor.matchHighlightBackground": withAlpha(p.warning, 0.3),
                "peekViewResult.background": p.background,
                "peekViewResult.fileForeground": p.foreground,
                "peekViewResult.lineForeground": p.foregroundMuted,
                "peekViewResult.matchHighlightBackground": withAlpha(p.warning, 0.3),
                "peekViewResult.selectionBackground": withAlpha(p.accent, 0.3),
                "peekViewResult.selectionForeground": p.foreground,
                "peekViewTitle.background": p.backgroundAlt,
                "peekViewTitleDescription.foreground": p.foregroundMuted,
                "peekViewTitleLabel.foreground": p.foreground,

                // Editor errors/warnings
                "editorError.foreground": p.error,
                "editorWarning.foreground": p.warning,
                "editorInfo.foreground": p.info,
                "editorHint.foreground": p.success,

                // Minimap
                "minimap.background": p.background,
                "minimap.selectionHighlight": withAlpha(p.selection, 0.6),
                "minimap.findMatchHighlight": withAlpha(p.warning, 0.6),

                // Breadcrumb
                "breadcrumb.foreground": p.foregroundMuted,
                "breadcrumb.focusForeground": p.foreground,
                "breadcrumb.activeSelectionForeground": p.foreground,
            },
            tokenColors: [
                {
                    name: "Comments",
                    scope: ["comment", "punctuation.definition.comment"],
                    settings: { foreground: p.comment, fontStyle: "italic" }
                },
                {
                    name: "Strings",
                    scope: ["string", "string.quoted", "string.template"],
                    settings: { foreground: p.string }
                },
                {
                    name: "Numbers",
                    scope: ["constant.numeric"],
                    settings: { foreground: p.number }
                },
                {
                    name: "Constants",
                    scope: ["constant", "constant.language", "constant.character"],
                    settings: { foreground: p.number }
                },
                {
                    name: "Keywords",
                    scope: ["keyword", "keyword.control", "keyword.operator.new", "keyword.operator.expression", "keyword.operator.logical"],
                    settings: { foreground: p.keyword }
                },
                {
                    name: "Storage/Types",
                    scope: ["storage", "storage.type", "storage.modifier"],
                    settings: { foreground: p.keyword }
                },
                {
                    name: "Operators",
                    scope: ["keyword.operator", "keyword.operator.assignment"],
                    settings: { foreground: p.operator }
                },
                {
                    name: "Functions",
                    scope: ["entity.name.function", "support.function", "meta.function-call", "variable.function"],
                    settings: { foreground: p.function }
                },
                {
                    name: "Classes",
                    scope: ["entity.name.type", "entity.name.class", "support.class", "entity.name.type.class"],
                    settings: { foreground: p.class }
                },
                {
                    name: "Interfaces",
                    scope: ["entity.name.type.interface"],
                    settings: { foreground: p.class, fontStyle: "italic" }
                },
                {
                    name: "Variables",
                    scope: ["variable", "variable.other", "variable.other.readwrite"],
                    settings: { foreground: p.variable }
                },
                {
                    name: "Parameters",
                    scope: ["variable.parameter"],
                    settings: { foreground: p.parameter, fontStyle: "italic" }
                },
                {
                    name: "Properties",
                    scope: ["variable.other.property", "support.variable.property", "variable.other.object.property"],
                    settings: { foreground: p.property }
                },
                {
                    name: "HTML/XML Tags",
                    scope: ["entity.name.tag", "punctuation.definition.tag"],
                    settings: { foreground: p.tag }
                },
                {
                    name: "HTML/XML Attributes",
                    scope: ["entity.other.attribute-name"],
                    settings: { foreground: p.attribute, fontStyle: "italic" }
                },
                {
                    name: "CSS Selectors",
                    scope: ["entity.name.tag.css", "entity.other.attribute-name.class.css", "entity.other.attribute-name.id.css"],
                    settings: { foreground: p.tag }
                },
                {
                    name: "CSS Properties",
                    scope: ["support.type.property-name.css", "support.type.property-name"],
                    settings: { foreground: p.property }
                },
                {
                    name: "CSS Values",
                    scope: ["support.constant.property-value.css", "support.constant.color.css", "constant.other.color"],
                    settings: { foreground: p.string }
                },
                {
                    name: "Punctuation",
                    scope: ["punctuation", "meta.brace"],
                    settings: { foreground: p.foregroundMuted }
                },
                {
                    name: "Regex",
                    scope: ["string.regexp"],
                    settings: { foreground: p.warning }
                },
                {
                    name: "Escape Characters",
                    scope: ["constant.character.escape"],
                    settings: { foreground: p.info }
                },
                {
                    name: "Invalid",
                    scope: ["invalid", "invalid.illegal"],
                    settings: { foreground: p.error, fontStyle: "underline" }
                },
                {
                    name: "Markdown Headings",
                    scope: ["markup.heading", "entity.name.section.markdown"],
                    settings: { foreground: p.keyword, fontStyle: "bold" }
                },
                {
                    name: "Markdown Bold",
                    scope: ["markup.bold"],
                    settings: { fontStyle: "bold" }
                },
                {
                    name: "Markdown Italic",
                    scope: ["markup.italic"],
                    settings: { fontStyle: "italic" }
                },
                {
                    name: "Markdown Link",
                    scope: ["markup.underline.link", "string.other.link"],
                    settings: { foreground: p.info }
                },
                {
                    name: "Markdown Code",
                    scope: ["markup.inline.raw", "markup.fenced_code.block"],
                    settings: { foreground: p.string }
                },
                {
                    name: "JSON Keys",
                    scope: ["support.type.property-name.json"],
                    settings: { foreground: p.property }
                },
                {
                    name: "JSON Values",
                    scope: ["string.quoted.double.json"],
                    settings: { foreground: p.string }
                },
                {
                    name: "Decorators/Annotations",
                    scope: ["meta.decorator", "meta.annotation"],
                    settings: { foreground: p.attribute }
                },
                {
                    name: "This/Self",
                    scope: ["variable.language.this", "variable.language.self"],
                    settings: { foreground: p.keyword, fontStyle: "italic" }
                },
                {
                    name: "Support",
                    scope: ["support.type", "support.class"],
                    settings: { foreground: p.class }
                },
                {
                    name: "Import/Export",
                    scope: ["keyword.control.import", "keyword.control.export", "keyword.control.from"],
                    settings: { foreground: p.keyword }
                },
                {
                    name: "Module names",
                    scope: ["entity.name.type.module"],
                    settings: { foreground: p.class }
                }
            ],
            semanticHighlighting: true,
            semanticTokenColors: {
                "variable.declaration": p.variable,
                "variable.readonly": p.number,
                "parameter": p.parameter,
                "property": p.property,
                "function": p.function,
                "method": p.function,
                "class": p.class,
                "interface": p.class,
                "enum": p.class,
                "enumMember": p.number,
                "namespace": p.class,
                "type": p.class
            }
        };
    },

    // Validate a generated theme
    validateTheme(theme) {
        const errors = [];
        
        if (!theme.name) errors.push('Missing theme name');
        if (!theme.type || !['dark', 'light'].includes(theme.type)) {
            errors.push('Invalid or missing theme type');
        }
        if (!theme.colors || typeof theme.colors !== 'object') {
            errors.push('Missing or invalid colors object');
        }
        if (!theme.tokenColors || !Array.isArray(theme.tokenColors)) {
            errors.push('Missing or invalid tokenColors array');
        }

        // Validate color format
        const hexRegex = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;
        if (theme.colors) {
            for (const [key, value] of Object.entries(theme.colors)) {
                if (value && !hexRegex.test(value)) {
                    errors.push(`Invalid color format for ${key}: ${value}`);
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    // Extract palette summary from theme
    extractPalette(theme) {
        const colors = theme.colors || {};
        const tokens = theme.tokenColors || [];
        
        // Get unique colors from the theme
        const allColors = new Set();
        
        // From UI colors
        Object.values(colors).forEach(color => {
            if (color && color.startsWith('#')) {
                allColors.add(color.slice(0, 7).toLowerCase());
            }
        });
        
        // From token colors
        tokens.forEach(token => {
            if (token.settings && token.settings.foreground) {
                allColors.add(token.settings.foreground.slice(0, 7).toLowerCase());
            }
        });

        // Key colors for display
        return {
            background: colors['editor.background'],
            foreground: colors['editor.foreground'],
            accent: colors['focusBorder'] || colors['button.background'],
            selection: colors['editor.selectionBackground'],
            sidebar: colors['sideBar.background'],
            statusbar: colors['statusBar.background'],
            comment: tokens.find(t => t.name === 'Comments')?.settings?.foreground,
            string: tokens.find(t => t.name === 'Strings')?.settings?.foreground,
            keyword: tokens.find(t => t.name === 'Keywords')?.settings?.foreground,
            function: tokens.find(t => t.name === 'Functions')?.settings?.foreground,
            class: tokens.find(t => t.name === 'Classes')?.settings?.foreground,
            allColors: Array.from(allColors)
        };
    }
};

// Export for use in other modules
window.ThemeSchema = ThemeSchema;

