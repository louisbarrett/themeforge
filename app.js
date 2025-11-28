/**
 * ThemeForge - Main Application
 * Orchestrates UI, canvas rendering, and Ollama API integration
 */

class ThemeForgeApp {
    constructor() {
        // Initialize components
        this.renderer = new ThemeCanvasRenderer('themeCanvas');
        this.ollama = new OllamaClient();
        this.installer = new ThemeInstaller();
        this.paletteExtractor = new ImagePaletteExtractor();
        
        // State
        this.currentTheme = null;
        this.isGenerating = false;
        this.selectedModel = '';
        this.options = {
            baseTheme: 'dark',
            contrast: 'normal',
            temperature: 0.7
        };
        
        // Image state
        this.uploadedImage = {
            file: null,
            extractedColors: [],  // Extracted palette
            dominant: null        // Dominant color
        };

        // Initialize UI
        this.initializeElements();
        this.attachEventListeners();
        this.loadSavedSettings();
        this.refreshModels();
    }

    initializeElements() {
        // Main controls
        this.promptInput = document.getElementById('promptInput');
        this.charCount = document.getElementById('charCount');
        this.generateBtn = document.getElementById('generateBtn');
        this.statusBar = document.getElementById('statusBar');
        this.canvasOverlay = document.getElementById('canvasOverlay');
        
        // Ollama settings
        this.ollamaUrlInput = document.getElementById('ollamaUrl');
        this.modelSelect = document.getElementById('modelSelect');
        this.refreshModelsBtn = document.getElementById('refreshModels');
        this.temperatureInput = document.getElementById('temperature');
        this.tempValue = document.getElementById('tempValue');
        
        // Options
        this.themeToggleBtns = document.querySelectorAll('[data-theme]');
        this.contrastToggleBtns = document.querySelectorAll('[data-contrast]');
        
        // Image upload elements
        this.imageUploadArea = document.getElementById('imageUploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.uploadPlaceholder = document.getElementById('uploadPlaceholder');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImage = document.getElementById('previewImage');
        this.removeImageBtn = document.getElementById('removeImage');
        this.extractedPalette = document.getElementById('extractedPalette');
        this.extractedSwatches = document.getElementById('extractedSwatches');
        this.useExtractedColorsBtn = document.getElementById('useExtractedColors');
        
        // Palette & Info
        this.paletteGrid = document.getElementById('paletteGrid');
        this.themeInfo = document.getElementById('themeInfo');
        
        // Install buttons
        this.installCursorBtn = document.getElementById('installCursor');
        this.installVscodeBtn = document.getElementById('installVscode');
        
        // Export buttons
        this.downloadZipBtn = document.getElementById('downloadZip');
        this.exportJsonBtn = document.getElementById('exportJson');
        this.copyColorsBtn = document.getElementById('copyColors');
        
        // Other buttons
        this.randomizeBtn = document.getElementById('randomizeBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.resetSettingsBtn = document.getElementById('resetSettings');
        
        // Toast container
        this.toastContainer = document.getElementById('toastContainer');
    }

    attachEventListeners() {
        // Prompt input
        this.promptInput.addEventListener('input', () => {
            this.charCount.textContent = this.promptInput.value.length;
        });

        this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                this.generateTheme();
            }
        });

        // Generate button
        this.generateBtn.addEventListener('click', () => this.generateTheme());

        // Ollama URL change - use both input and change events
        this.ollamaUrlInput.addEventListener('input', () => {
            // Update immediately as user types
            this.ollama.setBaseUrl(this.ollamaUrlInput.value);
        });
        
        this.ollamaUrlInput.addEventListener('change', () => {
            // Save and refresh when user finishes editing (blur/enter)
            this.ollama.setBaseUrl(this.ollamaUrlInput.value);
            this.saveSettings();
            this.refreshModels();
        });
        
        // Also handle Enter key in URL input
        this.ollamaUrlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.ollamaUrlInput.blur(); // Trigger change event
            }
        });

        // Refresh models
        this.refreshModelsBtn.addEventListener('click', () => this.refreshModels());

        // Model select
        this.modelSelect.addEventListener('change', () => {
            this.selectedModel = this.modelSelect.value;
            this.saveSettings();
        });

        // Temperature slider
        this.temperatureInput.addEventListener('input', () => {
            this.options.temperature = parseFloat(this.temperatureInput.value);
            this.tempValue.textContent = this.options.temperature.toFixed(1);
            this.saveSettings();
        });

        // Theme toggle (dark/light)
        this.themeToggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const themeValue = btn.dataset.theme;
                console.log('Theme toggle clicked:', themeValue);
                
                // Remove active from all theme buttons
                this.themeToggleBtns.forEach(b => b.classList.remove('active'));
                // Add active to clicked button
                btn.classList.add('active');
                
                // Update state
                this.options.baseTheme = themeValue;
                this.saveSettings();
                
                // Visual feedback
                this.showToast(`Base theme: ${themeValue}`, 'success');
            });
        });

        // Contrast toggle (low/normal/high)
        this.contrastToggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const contrastValue = btn.dataset.contrast;
                console.log('Contrast toggle clicked:', contrastValue);
                
                // Remove active from all contrast buttons
                this.contrastToggleBtns.forEach(b => b.classList.remove('active'));
                // Add active to clicked button
                btn.classList.add('active');
                
                // Update state
                this.options.contrast = contrastValue;
                this.saveSettings();
                
                // Visual feedback
                this.showToast(`Contrast: ${contrastValue}`, 'success');
            });
        });

        // Image upload events
        this.setupImageUploadListeners();

        // Install buttons
        this.installCursorBtn.addEventListener('click', () => this.installTheme('cursor'));
        this.installVscodeBtn.addEventListener('click', () => this.installTheme('vscode'));
        
        // Export buttons
        this.downloadZipBtn.addEventListener('click', () => this.downloadThemeZip());
        this.exportJsonBtn.addEventListener('click', () => this.exportJson());
        this.copyColorsBtn.addEventListener('click', () => this.copyColors());

        // Randomize button
        this.randomizeBtn.addEventListener('click', () => this.randomizePrompt());

        // Fullscreen button
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Reset settings button
        this.resetSettingsBtn.addEventListener('click', () => this.resetToDefaults());

        // Window resize
        window.addEventListener('resize', () => {
            if (this.currentTheme) {
                this.renderer.render(this.currentTheme);
            }
        });
    }

    /**
     * Setup image upload event listeners
     */
    setupImageUploadListeners() {
        // Click to upload
        this.imageUploadArea.addEventListener('click', (e) => {
            if (e.target === this.removeImageBtn || this.removeImageBtn.contains(e.target)) {
                return; // Don't trigger upload when clicking remove
            }
            this.imageInput.click();
        });

        // File input change
        this.imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        });

        // Drag and drop
        this.imageUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.imageUploadArea.classList.add('drag-over');
        });

        this.imageUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.imageUploadArea.classList.remove('drag-over');
        });

        this.imageUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.imageUploadArea.classList.remove('drag-over');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleImageUpload(file);
            } else {
                this.showToast('Please drop an image file', 'error');
            }
        });

        // Remove image button
        this.removeImageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearUploadedImage();
        });

        // Use extracted colors button
        this.useExtractedColorsBtn.addEventListener('click', () => {
            if (this.uploadedImage.extractedColors.length > 0) {
                // Add color info to prompt
                const colorList = this.uploadedImage.extractedColors.slice(0, 5).join(', ');
                const currentPrompt = this.promptInput.value.trim();
                
                if (!currentPrompt.includes('colors:')) {
                    const newPrompt = currentPrompt 
                        ? `${currentPrompt}\n\nBase colors: ${colorList}`
                        : `Theme using these colors: ${colorList}`;
                    this.promptInput.value = newPrompt;
                    this.charCount.textContent = newPrompt.length;
                    this.showToast('Colors added to prompt', 'success');
                }
            }
        });
    }

    /**
     * Handle image upload
     */
    async handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select an image file', 'error');
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('Image too large. Maximum size is 10MB', 'error');
            return;
        }

        this.setStatus('Processing image...', 'loading');

        try {
            // Extract palette from image
            const result = await this.paletteExtractor.extractPalette(file, 8);
            
            this.uploadedImage = {
                file: file,
                extractedColors: result.colors,
                dominant: result.dominant
            };

            // Show preview
            this.showImagePreview(file);
            
            // Show extracted colors
            this.showExtractedPalette(result.colors);
            
            this.setStatus('Image loaded! Colors extracted.', 'success');
            this.showToast(`Extracted ${result.colors.length} colors from image`, 'success');

        } catch (error) {
            console.error('Image processing error:', error);
            this.setStatus('Failed to process image', 'error');
            this.showToast('Failed to process image: ' + error.message, 'error');
        }
    }

    /**
     * Show image preview
     */
    showImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewImage.src = e.target.result;
            this.uploadPlaceholder.style.display = 'none';
            this.imagePreview.style.display = 'flex';
            this.imageUploadArea.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    }

    /**
     * Show extracted color palette
     */
    showExtractedPalette(colors) {
        this.extractedSwatches.innerHTML = colors.map((color, idx) => `
            <div class="extracted-swatch" 
                 style="background-color: ${color}" 
                 data-color="${color}"
                 title="${color}">
                ${idx === 0 ? '<span class="swatch-label">Dom</span>' : ''}
            </div>
        `).join('');

        this.extractedPalette.classList.add('visible');

        // Add click-to-copy on swatches
        this.extractedSwatches.querySelectorAll('.extracted-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                e.stopPropagation();
                const color = swatch.dataset.color;
                navigator.clipboard.writeText(color);
                this.showToast(`Copied ${color}`, 'success');
            });
        });
    }

    /**
     * Clear uploaded image
     */
    clearUploadedImage() {
        this.uploadedImage = {
            file: null,
            extractedColors: [],
            dominant: null
        };

        this.previewImage.src = '';
        this.uploadPlaceholder.style.display = 'flex';
        this.imagePreview.style.display = 'none';
        this.imageUploadArea.classList.remove('has-image');
        this.extractedPalette.classList.remove('visible');
        this.extractedSwatches.innerHTML = '';
        this.imageInput.value = '';

        this.showToast('Image removed', 'success');
    }

    async refreshModels() {
        const currentUrl = this.ollama.baseUrl;
        this.setStatus(`Connecting to ${currentUrl}...`, 'loading');
        console.log('Refreshing models from:', currentUrl);
        
        try {
            const models = await this.ollama.getModels();
            
            // Clear and populate select
            this.modelSelect.innerHTML = '<option value="">Select a model...</option>';
            
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id || model.name;
                
                // Show size if available
                const sizeStr = model.size ? ` (${this.formatSize(model.size)})` : '';
                option.textContent = `${model.id || model.name}${sizeStr}`;
                
                this.modelSelect.appendChild(option);
            });

            // Restore selected model if available
            const modelId = m => m.id || m.name;
            if (this.selectedModel && models.find(m => modelId(m) === this.selectedModel)) {
                this.modelSelect.value = this.selectedModel;
            } else if (models.length > 0) {
                // Auto-select first model
                this.modelSelect.value = modelId(models[0]);
                this.selectedModel = modelId(models[0]);
            }

            this.setStatus(`Connected! Found ${models.length} model${models.length !== 1 ? 's' : ''}`, 'success');
            
        } catch (error) {
            this.setStatus('Failed to connect to API', 'error');
            this.showToast(error.message, 'error');
            console.error('Model fetch error:', error);
        }
    }

    async generateTheme() {
        const prompt = this.promptInput.value.trim();
        const hasImage = this.uploadedImage.file !== null;
        
        // Allow generation with just an image (no text prompt required)
        if (!prompt && !hasImage) {
            this.showToast('Please enter a theme description or upload an image', 'error');
            this.promptInput.focus();
            return;
        }

        if (!this.selectedModel && !this.modelSelect.value) {
            this.showToast('Please select a model', 'error');
            return;
        }

        const model = this.modelSelect.value || this.selectedModel;
        
        this.isGenerating = true;
        this.generateBtn.classList.add('loading');
        this.generateBtn.disabled = true;
        this.canvasOverlay.classList.add('hidden');
        
        this.renderer.startLoadingAnimation();
        
        // Update status based on whether we're using extracted colors
        if (hasImage) {
            this.setStatus('Generating theme from colors...', 'loading');
        } else {
            this.setStatus('Generating theme...', 'loading');
        }

        try {
            const theme = await this.ollama.generateWithRetry(prompt, {
                model: model,
                temperature: this.options.temperature,
                baseTheme: this.options.baseTheme,
                contrast: this.options.contrast,
                extractedColors: hasImage ? this.uploadedImage.extractedColors : null,
                onProgress: (progress) => {
                    if (progress.tokens % 10 === 0) {
                        this.setStatus(`Generating... ${progress.tokens} tokens`, 'loading');
                    }
                }
            });

            this.currentTheme = theme;
            this.renderer.stopLoadingAnimation();
            this.renderer.render(theme);
            
            this.updatePaletteDisplay(theme);
            this.updateThemeInfo(theme);
            this.enableExportButtons();
            
            const sourceInfo = hasImage ? ' (from extracted colors)' : '';
            this.setStatus(`Theme generated successfully!${sourceInfo}`, 'success');
            this.showToast(`"${theme.name}" generated!`, 'success');

        } catch (error) {
            this.renderer.stopLoadingAnimation();
            this.setStatus('Generation failed', 'error');
            this.showToast(error.message, 'error');
            console.error('Generation error:', error);
            
        } finally {
            this.isGenerating = false;
            this.generateBtn.classList.remove('loading');
            this.generateBtn.disabled = false;
        }
    }

    updatePaletteDisplay(theme) {
        const palette = theme.palette || ThemeSchema.extractPalette(theme);
        
        const colors = [
            { name: 'Background', key: 'background' },
            { name: 'Foreground', key: 'foreground' },
            { name: 'Accent', key: 'accent' },
            { name: 'Selection', key: 'selection' },
            { name: 'Comment', key: 'comment' },
            { name: 'String', key: 'string' },
            { name: 'Keyword', key: 'keyword' },
            { name: 'Function', key: 'function' },
            { name: 'Class', key: 'class' },
            { name: 'Variable', key: 'variable' },
            { name: 'Property', key: 'property' },
            { name: 'Error', key: 'error' },
            { name: 'Warning', key: 'warning' },
            { name: 'Success', key: 'success' },
        ];

        this.paletteGrid.innerHTML = colors.map(color => {
            const hex = palette[color.key] || '#888888';
            return `
                <div class="color-item" data-color="${hex}" title="Click to copy">
                    <div class="color-swatch" style="background-color: ${hex}"></div>
                    <div class="color-info">
                        <span class="color-name">${color.name}</span>
                        <span class="color-hex">${hex}</span>
                    </div>
                    <button class="color-copy" title="Copy color">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        // Add click handlers for copying
        this.paletteGrid.querySelectorAll('.color-item').forEach(item => {
            item.addEventListener('click', () => {
                const color = item.dataset.color;
                navigator.clipboard.writeText(color);
                this.showToast(`Copied ${color}`, 'success');
            });
        });
    }

    updateThemeInfo(theme) {
        this.themeInfo.innerHTML = `
            <div class="info-row">
                <span class="info-label">Name</span>
                <span class="info-value">${theme.name || 'Generated Theme'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Type</span>
                <span class="info-value">${theme.type || this.options.baseTheme}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Token Colors</span>
                <span class="info-value">${theme.tokenColors?.length || 0}</span>
            </div>
            <div class="info-row">
                <span class="info-label">UI Colors</span>
                <span class="info-value">${Object.keys(theme.colors || {}).length}</span>
            </div>
        `;
    }

    enableExportButtons() {
        this.installCursorBtn.disabled = false;
        this.installVscodeBtn.disabled = false;
        this.downloadZipBtn.disabled = false;
        this.exportJsonBtn.disabled = false;
        this.copyColorsBtn.disabled = false;
    }

    /**
     * Install theme directly to Cursor or VSCode extensions folder
     */
    async installTheme(targetApp) {
        if (!this.currentTheme) return;

        const appName = targetApp === 'cursor' ? 'Cursor' : 'VS Code';
        
        // Check if direct install is supported
        if (!this.installer.canInstallDirectly()) {
            // Fallback: show instructions and download ZIP
            this.showToast(`Direct install not supported. Downloading ZIP instead...`, 'error');
            await this.downloadThemeZip();
            this.showInstallInstructions(targetApp);
            return;
        }

        try {
            this.setStatus(`Installing to ${appName}...`, 'loading');
            
            // Show helpful hint about which folder to select
            const hint = targetApp === 'cursor' 
                ? '~/.cursor/extensions' 
                : '~/.vscode/extensions';
            this.showToast(`Select your ${appName} extensions folder: ${hint}`, 'success');

            const result = await this.installer.installToFolder(this.currentTheme, targetApp);
            
            if (result.success) {
                this.setStatus('Theme installed!', 'success');
                this.showToast(result.message, 'success');
                
                // Show reload reminder
                setTimeout(() => {
                    this.showToast(`Restart ${appName} and select "${this.currentTheme.name}" from Color Themes`, 'success');
                }, 2000);
            }
        } catch (error) {
            console.error('Install error:', error);
            
            if (error.message === 'Installation cancelled') {
                this.setStatus('Installation cancelled', 'error');
                this.showToast('Installation cancelled', 'error');
            } else {
                this.setStatus('Installation failed', 'error');
                this.showToast(`Failed to install: ${error.message}`, 'error');
                
                // Offer ZIP download as fallback
                if (confirm(`Direct installation failed. Would you like to download the theme as a ZIP file instead?`)) {
                    await this.downloadThemeZip();
                }
            }
        }
    }

    /**
     * Download theme as ZIP file
     */
    async downloadThemeZip() {
        if (!this.currentTheme) return;

        try {
            this.setStatus('Creating ZIP package...', 'loading');
            const result = await this.installer.downloadAsZip(this.currentTheme);
            
            if (result.success) {
                this.setStatus('ZIP downloaded!', 'success');
                this.showToast(`Downloaded ${result.fileName}`, 'success');
                
                // Show installation hint
                setTimeout(() => {
                    this.showToast('Extract ZIP to ~/.cursor/extensions or ~/.vscode/extensions', 'success');
                }, 1500);
            }
        } catch (error) {
            console.error('ZIP creation error:', error);
            this.setStatus('Download failed', 'error');
            this.showToast(`Failed to create ZIP: ${error.message}`, 'error');
        }
    }

    /**
     * Show installation instructions modal/toast
     */
    showInstallInstructions(targetApp) {
        const instructions = this.installer.getInstallInstructions(targetApp);
        console.log(instructions);
        
        // For now, just log to console. Could add a modal later.
        this.showToast('Check console for detailed installation instructions', 'success');
    }

    exportJson() {
        if (!this.currentTheme) return;
        
        const themeName = this.currentTheme.name || 'generated-theme';
        const themeSlug = themeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        this.downloadJson(this.currentTheme, `${themeSlug}.json`);
        this.showToast('Theme JSON downloaded!', 'success');
    }

    copyColors() {
        if (!this.currentTheme) return;
        
        const palette = this.currentTheme.palette || ThemeSchema.extractPalette(this.currentTheme);
        const colorsText = Object.entries(palette)
            .filter(([key]) => key !== 'allColors')
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        
        navigator.clipboard.writeText(colorsText);
        this.showToast('Colors copied to clipboard!', 'success');
    }

    downloadJson(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    randomizePrompt() {
        const randomPrompt = SamplePrompts[Math.floor(Math.random() * SamplePrompts.length)];
        this.promptInput.value = randomPrompt;
        this.charCount.textContent = randomPrompt.length;
        this.promptInput.focus();
    }

    toggleFullscreen() {
        const canvas = this.renderer.canvas;
        
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            canvas.requestFullscreen();
        }
    }

    setStatus(message, type = '') {
        this.statusBar.className = 'status-bar ' + type;
        this.statusBar.querySelector('.status-text').textContent = message;
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' 
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
        
        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
        `;
        
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }

    saveSettings() {
        const settings = {
            ollamaUrl: this.ollama.baseUrl, // Save the normalized URL
            model: this.selectedModel,
            temperature: this.options.temperature,
            baseTheme: this.options.baseTheme,
            contrast: this.options.contrast
        };
        localStorage.setItem('themeforge-settings', JSON.stringify(settings));
        console.log('Settings saved:', settings);
    }

    resetToDefaults() {
        // Clear localStorage
        localStorage.removeItem('themeforge-settings');
        
        // Reset to defaults (base URL without /v1, normalizeUrl will add it)
        const defaultUrl = 'http://localhost:11434';
        this.ollamaUrlInput.value = defaultUrl;
        this.ollama.setBaseUrl(defaultUrl);
        
        this.options.temperature = 0.7;
        this.temperatureInput.value = 0.7;
        this.tempValue.textContent = '0.7';
        
        this.options.baseTheme = 'dark';
        this.themeToggleBtns.forEach(btn => {
            if (btn.dataset.theme === 'dark') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        this.options.contrast = 'normal';
        this.contrastToggleBtns.forEach(btn => {
            if (btn.dataset.contrast === 'normal') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        this.selectedModel = '';
        this.modelSelect.value = '';
        
        this.showToast('Settings reset to defaults', 'success');
        console.log('Settings reset to defaults');
        
        // Refresh models with new URL
        this.refreshModels();
    }

    loadSavedSettings() {
        try {
            const saved = localStorage.getItem('themeforge-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                if (settings.ollamaUrl) {
                    // Set and normalize the URL
                    this.ollama.setBaseUrl(settings.ollamaUrl);
                    // Update input to show the normalized URL
                    this.ollamaUrlInput.value = this.ollama.baseUrl;
                }
                
                if (settings.model) {
                    this.selectedModel = settings.model;
                }
                
                if (settings.temperature !== undefined) {
                    this.options.temperature = settings.temperature;
                    this.temperatureInput.value = settings.temperature;
                    this.tempValue.textContent = settings.temperature.toFixed(1);
                }
                
                if (settings.baseTheme) {
                    this.options.baseTheme = settings.baseTheme;
                    // Explicitly remove/add classes instead of toggle
                    this.themeToggleBtns.forEach(btn => {
                        if (btn.dataset.theme === settings.baseTheme) {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    });
                }
                
                if (settings.contrast) {
                    this.options.contrast = settings.contrast;
                    // Explicitly remove/add classes instead of toggle
                    this.contrastToggleBtns.forEach(btn => {
                        if (btn.dataset.contrast === settings.contrast) {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    });
                }
            }
        } catch (error) {
            console.warn('Failed to load saved settings:', error);
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('ThemeForge initializing...');
    
    try {
        window.app = new ThemeForgeApp();
        console.log('ThemeForge initialized successfully');
        console.log('Current settings:', {
            ollamaUrl: window.app.ollama.baseUrl,
            baseTheme: window.app.options.baseTheme,
            contrast: window.app.options.contrast,
            temperature: window.app.options.temperature
        });
    } catch (error) {
        console.error('Failed to initialize ThemeForge:', error);
        
        // Try to clear potentially corrupted settings and retry
        if (confirm('ThemeForge failed to initialize. Clear saved settings and retry?')) {
            localStorage.removeItem('themeforge-settings');
            location.reload();
        }
    }
});

// Global helper to clear settings (accessible from console)
window.clearThemeForgeSettings = function() {
    localStorage.removeItem('themeforge-settings');
    console.log('Settings cleared. Refresh the page to apply.');
    return 'Settings cleared. Refresh the page.';
};
