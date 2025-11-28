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
        
        // App theme buttons
        this.applyToAppBtn = document.getElementById('applyToApp');
        this.resetAppThemeBtn = document.getElementById('resetAppTheme');
        
        // Library buttons
        this.openLibraryBtn = document.getElementById('openLibrary');
        this.createFromScratchBtn = document.getElementById('createFromScratch');
        this.saveThemeToLibraryBtn = document.getElementById('saveThemeToLibrary');
        this.editColorsBtn = document.getElementById('editColors');
        
        // Library modal
        this.libraryModal = document.getElementById('libraryModal');
        this.libraryGrid = document.getElementById('libraryGrid');
        this.closeLibraryBtn = document.getElementById('closeLibrary');
        this.importLibraryBtn = document.getElementById('importLibrary');
        this.exportLibraryBtn = document.getElementById('exportLibrary');
        
        // Color editor modal
        this.colorEditorModal = document.getElementById('colorEditorModal');
        this.editorTitle = document.getElementById('editorTitle');
        this.editThemeName = document.getElementById('editThemeName');
        this.editorColors = document.getElementById('editorColors');
        this.editorCanvas = document.getElementById('editorCanvas');
        this.closeColorEditorBtn = document.getElementById('closeColorEditor');
        this.cancelColorEditorBtn = document.getElementById('cancelColorEditor');
        this.saveToLibraryBtn = document.getElementById('saveToLibrary');
        this.applyEditedThemeBtn = document.getElementById('applyEditedTheme');
        this.editThemeTypeBtns = document.querySelectorAll('[data-edit-theme]');
        
        // Toast container
        this.toastContainer = document.getElementById('toastContainer');
        
        // Editor state
        this.editorRenderer = null;
        this.editingTheme = null;
        this.editingPalette = null;
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
        this.exportJsonBtn.addEventListener('click', async () => await this.exportJson());
        this.copyColorsBtn.addEventListener('click', () => this.copyColors());

        // Randomize button
        this.randomizeBtn.addEventListener('click', () => this.randomizePrompt());

        // Fullscreen button
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Reset settings button
        this.resetSettingsBtn.addEventListener('click', () => this.resetToDefaults());
        
        // App theme buttons
        this.applyToAppBtn.addEventListener('click', () => this.applyThemeToApp());
        this.resetAppThemeBtn.addEventListener('click', () => this.resetAppTheme());
        
        // Library buttons
        this.openLibraryBtn.addEventListener('click', () => this.openLibrary());
        this.closeLibraryBtn.addEventListener('click', () => this.closeLibrary());
        this.createFromScratchBtn.addEventListener('click', () => this.createFromScratch());
        this.saveThemeToLibraryBtn.addEventListener('click', () => this.saveCurrentThemeToLibrary());
        this.editColorsBtn.addEventListener('click', () => this.openColorEditor());
        this.importLibraryBtn.addEventListener('click', () => this.importLibrary());
        this.exportLibraryBtn.addEventListener('click', () => this.exportLibrary());
        
        // Color editor buttons
        this.closeColorEditorBtn.addEventListener('click', () => this.closeColorEditor());
        this.cancelColorEditorBtn.addEventListener('click', () => this.closeColorEditor());
        this.saveToLibraryBtn.addEventListener('click', () => this.saveEditedThemeToLibrary());
        this.applyEditedThemeBtn.addEventListener('click', () => this.applyEditedTheme());
        
        // Theme type toggle in editor
        this.editThemeTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.editThemeTypeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (this.editingTheme) {
                    this.editingTheme.type = btn.dataset.editTheme;
                    this.updateEditorPreview();
                }
            });
        });
        
        // Close modals on overlay click
        this.libraryModal.addEventListener('click', (e) => {
            if (e.target === this.libraryModal) this.closeLibrary();
        });
        this.colorEditorModal.addEventListener('click', (e) => {
            if (e.target === this.colorEditorModal) this.closeColorEditor();
        });
        
        // Close modals on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.libraryModal.classList.contains('active')) this.closeLibrary();
                if (this.colorEditorModal.classList.contains('active')) this.closeColorEditor();
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (this.currentTheme) {
                this.renderer.render(this.currentTheme);
            }
        });
        
        // Load any saved app theme
        this.loadAppliedTheme();
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
        this.applyToAppBtn.disabled = false;
        this.editColorsBtn.disabled = false;
        this.saveThemeToLibraryBtn.disabled = false;
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
                this.setStatus('ZIP saved!', 'success');
                this.showToast(`Saved ${result.fileName}`, 'success');
                
                // Show installation hint
                setTimeout(() => {
                    this.showToast('Extract ZIP to ~/.cursor/extensions or ~/.vscode/extensions', 'success');
                }, 1500);
            }
        } catch (error) {
            if (error.message === 'Save cancelled') {
                this.setStatus('Save cancelled', 'error');
                this.showToast('Save cancelled', 'error');
            } else {
                console.error('ZIP creation error:', error);
                this.setStatus('Save failed', 'error');
                this.showToast(`Failed to create ZIP: ${error.message}`, 'error');
            }
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

    async exportJson() {
        if (!this.currentTheme) return;
        
        try {
            const result = await this.installer.downloadAsJson(this.currentTheme);
            if (result.success) {
                this.showToast('Theme JSON saved!', 'success');
            }
        } catch (error) {
            if (error.message === 'Save cancelled') {
                this.showToast('Save cancelled', 'error');
            } else {
                // Fallback to old method for web
                const themeName = this.currentTheme.name || 'generated-theme';
                const themeSlug = themeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                this.downloadJson(this.currentTheme, `${themeSlug}.json`);
                this.showToast('Theme JSON downloaded!', 'success');
            }
        }
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

    /**
     * Apply the current theme to ThemeForge's UI
     */
    applyThemeToApp() {
        if (!this.currentTheme) return;
        
        const palette = this.currentTheme.palette || ThemeSchema.extractPalette(this.currentTheme);
        const colors = this.currentTheme.colors || {};
        
        // Build theme data
        const themeData = {
            name: this.currentTheme.name,
            palette: palette,
            colors: colors,
            type: this.currentTheme.type
        };
        
        // Apply the colors
        this.applyThemeColors(themeData);
        
        // Save to localStorage
        localStorage.setItem('themeforge-app-theme', JSON.stringify(themeData));
        
        this.showToast(`Applied "${this.currentTheme.name}" to ThemeForge!`, 'success');
    }

    /**
     * Reset ThemeForge to its default theme
     */
    resetAppTheme() {
        const root = document.documentElement;
        
        // Reset to default values
        root.style.setProperty('--bg-deep', '#0a0a0f');
        root.style.setProperty('--bg-primary', '#0d0d14');
        root.style.setProperty('--bg-secondary', '#12121c');
        root.style.setProperty('--bg-tertiary', '#181824');
        root.style.setProperty('--bg-elevated', '#1e1e2e');
        
        root.style.setProperty('--text-primary', '#e4e4ef');
        root.style.setProperty('--text-secondary', '#9898a8');
        root.style.setProperty('--text-muted', '#5a5a6e');
        root.style.setProperty('--text-dim', '#3a3a4a');
        
        root.style.setProperty('--accent-primary', '#00f0ff');
        root.style.setProperty('--accent-primary-dim', 'rgba(0, 240, 255, 0.15)');
        root.style.setProperty('--accent-primary-glow', 'rgba(0, 240, 255, 0.4)');
        root.style.setProperty('--accent-secondary', '#ff006e');
        root.style.setProperty('--accent-secondary-dim', 'rgba(255, 0, 110, 0.15)');
        root.style.setProperty('--accent-tertiary', '#8b5cf6');
        root.style.setProperty('--accent-success', '#00ff88');
        root.style.setProperty('--accent-warning', '#ffaa00');
        root.style.setProperty('--accent-error', '#ff4466');
        
        root.style.setProperty('--border-subtle', 'rgba(255, 255, 255, 0.04)');
        root.style.setProperty('--border-default', 'rgba(255, 255, 255, 0.08)');
        root.style.setProperty('--border-strong', 'rgba(255, 255, 255, 0.12)');
        root.style.setProperty('--border-accent', 'rgba(0, 240, 255, 0.3)');
        
        root.style.setProperty('--shadow-glow', '0 0 30px rgba(0, 240, 255, 0.4)');
        
        // Remove from localStorage
        localStorage.removeItem('themeforge-app-theme');
        
        this.showToast('Reset to default theme', 'success');
    }

    /**
     * Load previously applied theme from localStorage
     */
    loadAppliedTheme() {
        try {
            const saved = localStorage.getItem('themeforge-app-theme');
            if (saved) {
                const themeData = JSON.parse(saved);
                // Apply the saved theme directly without showing toast
                this.applyThemeColors(themeData);
                console.log('Loaded saved app theme:', themeData.name);
            }
        } catch (error) {
            console.warn('Failed to load saved app theme:', error);
        }
    }

    /**
     * Apply theme colors to CSS variables (internal helper)
     */
    applyThemeColors(themeData) {
        const palette = themeData.palette || {};
        const colors = themeData.colors || {};
        const isDark = themeData.type !== 'light';
        
        const root = document.documentElement;
        
        // Core backgrounds
        const bg = palette.background || colors['editor.background'] || (isDark ? '#1e1e2e' : '#ffffff');
        const bgAlt = palette.backgroundAlt || colors['sideBar.background'] || this.adjustColor(bg, isDark ? 10 : -10);
        
        root.style.setProperty('--bg-deep', this.adjustColor(bg, isDark ? -10 : 10));
        root.style.setProperty('--bg-primary', bg);
        root.style.setProperty('--bg-secondary', bgAlt);
        root.style.setProperty('--bg-tertiary', this.adjustColor(bgAlt, isDark ? 15 : -15));
        root.style.setProperty('--bg-elevated', this.adjustColor(bgAlt, isDark ? 25 : -25));
        
        // Text colors
        const fg = palette.foreground || colors['editor.foreground'] || (isDark ? '#e4e4ef' : '#333333');
        const fgMuted = palette.foregroundMuted || this.adjustColor(fg, isDark ? -80 : 80);
        
        root.style.setProperty('--text-primary', fg);
        root.style.setProperty('--text-secondary', this.adjustColor(fg, isDark ? -40 : 40));
        root.style.setProperty('--text-muted', fgMuted);
        root.style.setProperty('--text-dim', this.adjustColor(fgMuted, isDark ? -30 : 30));
        
        // Accent colors
        const accent = palette.accent || colors['focusBorder'] || '#00f0ff';
        const accentSecondary = palette.accentSecondary || palette.keyword || '#ff006e';
        const accentTertiary = palette.class || palette.function || '#8b5cf6';
        
        root.style.setProperty('--accent-primary', accent);
        root.style.setProperty('--accent-primary-dim', this.hexToRgba(accent, 0.15));
        root.style.setProperty('--accent-primary-glow', this.hexToRgba(accent, 0.4));
        root.style.setProperty('--accent-secondary', accentSecondary);
        root.style.setProperty('--accent-secondary-dim', this.hexToRgba(accentSecondary, 0.15));
        root.style.setProperty('--accent-tertiary', accentTertiary);
        
        // Status colors
        root.style.setProperty('--accent-success', palette.success || '#00ff88');
        root.style.setProperty('--accent-warning', palette.warning || '#ffaa00');
        root.style.setProperty('--accent-error', palette.error || '#ff4466');
        
        // Borders
        root.style.setProperty('--border-subtle', this.hexToRgba(fg, 0.04));
        root.style.setProperty('--border-default', this.hexToRgba(fg, 0.08));
        root.style.setProperty('--border-strong', this.hexToRgba(fg, 0.12));
        root.style.setProperty('--border-accent', this.hexToRgba(accent, 0.3));
        
        // Update glow shadow
        root.style.setProperty('--shadow-glow', `0 0 30px ${this.hexToRgba(accent, 0.4)}`);
    }

    /**
     * Adjust a hex color brightness
     */
    adjustColor(hex, amount) {
        if (!hex || !hex.startsWith('#')) return hex;
        try {
            const num = parseInt(hex.slice(1), 16);
            const r = Math.min(255, Math.max(0, (num >> 16) + amount));
            const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
            const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
            return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
        } catch (e) {
            return hex;
        }
    }

    /**
     * Convert hex to rgba
     */
    hexToRgba(hex, alpha) {
        if (!hex || !hex.startsWith('#')) return `rgba(0, 0, 0, ${alpha})`;
        try {
            const num = parseInt(hex.slice(1), 16);
            const r = (num >> 16) & 0xFF;
            const g = (num >> 8) & 0xFF;
            const b = num & 0xFF;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch (e) {
            return `rgba(0, 0, 0, ${alpha})`;
        }
    }

    // ============================================
    // Theme Library Methods
    // ============================================

    /**
     * Open theme library modal
     */
    async openLibrary() {
        await this.loadLibraryThemes();
        this.libraryModal.classList.add('active');
    }

    /**
     * Close theme library modal
     */
    closeLibrary() {
        this.libraryModal.classList.remove('active');
    }

    /**
     * Load and render themes in library
     */
    async loadLibraryThemes() {
        let themes = [];
        
        // Try Electron API first, fall back to localStorage
        if (window.electronAPI?.themeLibrary) {
            themes = await window.electronAPI.themeLibrary.getAll();
        } else {
            const saved = localStorage.getItem('themeforge-library');
            if (saved) {
                themes = JSON.parse(saved).themes || [];
            }
        }
        
        if (themes.length === 0) {
            this.libraryGrid.innerHTML = `
                <div class="library-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p>No saved themes yet</p>
                    <span>Generate a theme and save it to your library</span>
                </div>
            `;
            return;
        }
        
        this.libraryGrid.innerHTML = themes.map(theme => this.renderThemeCard(theme)).join('');
        
        // Add event listeners to cards
        this.libraryGrid.querySelectorAll('.theme-card').forEach(card => {
            const themeId = card.dataset.id;
            
            card.querySelector('.load-theme')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadThemeFromLibrary(themeId);
            });
            
            card.querySelector('.edit-theme')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editThemeFromLibrary(themeId);
            });
            
            card.querySelector('.delete-theme')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteThemeFromLibrary(themeId);
            });
            
            // Double-click to load
            card.addEventListener('dblclick', () => {
                this.loadThemeFromLibrary(themeId);
            });
        });
    }

    /**
     * Render a theme card for library
     */
    renderThemeCard(theme) {
        const palette = theme.palette || {};
        const colors = [
            palette.background || '#1e1e2e',
            palette.accent || '#00f0ff',
            palette.keyword || '#ff006e',
            palette.string || '#00ff88',
            palette.function || '#8b5cf6'
        ];
        
        const date = theme.createdAt ? new Date(theme.createdAt).toLocaleDateString() : 'Unknown';
        
        return `
            <div class="theme-card" data-id="${theme.id}">
                <div class="theme-card-preview">
                    ${colors.map(c => `<div class="theme-card-color" style="background: ${c}"></div>`).join('')}
                </div>
                <div class="theme-card-info">
                    <div class="theme-card-name">${theme.name || 'Untitled Theme'}</div>
                    <div class="theme-card-meta">
                        <span class="theme-card-type">${theme.type || 'dark'}</span>
                        <span>${date}</span>
                    </div>
                </div>
                <div class="theme-card-actions">
                    <button class="btn btn-sm load-theme" title="Load theme">Load</button>
                    <button class="btn btn-sm edit-theme" title="Edit colors">Edit</button>
                    <button class="btn btn-sm btn-ghost delete-theme" title="Delete">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Save current theme to library
     */
    async saveCurrentThemeToLibrary() {
        if (!this.currentTheme) {
            this.showToast('No theme to save', 'error');
            return;
        }
        
        const themeToSave = {
            ...this.currentTheme,
            palette: this.currentTheme.palette || ThemeSchema.extractPalette(this.currentTheme)
        };
        
        await this.saveThemeToLibrary(themeToSave);
    }

    /**
     * Save a theme to library
     */
    async saveThemeToLibrary(theme) {
        try {
            if (window.electronAPI?.themeLibrary) {
                const result = await window.electronAPI.themeLibrary.save(theme);
                if (result.success) {
                    this.showToast(`"${theme.name}" saved to library!`, 'success');
                } else {
                    throw new Error(result.error);
                }
            } else {
                // Fallback to localStorage
                const saved = localStorage.getItem('themeforge-library');
                const library = saved ? JSON.parse(saved) : { themes: [] };
                
                if (!theme.id) {
                    theme.id = `theme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                }
                theme.createdAt = theme.createdAt || new Date().toISOString();
                theme.updatedAt = new Date().toISOString();
                
                const existingIndex = library.themes.findIndex(t => t.id === theme.id);
                if (existingIndex >= 0) {
                    library.themes[existingIndex] = theme;
                } else {
                    library.themes.unshift(theme);
                }
                
                localStorage.setItem('themeforge-library', JSON.stringify(library));
                this.showToast(`"${theme.name}" saved to library!`, 'success');
            }
        } catch (error) {
            console.error('Failed to save theme:', error);
            this.showToast(`Failed to save: ${error.message}`, 'error');
        }
    }

    /**
     * Load theme from library
     */
    async loadThemeFromLibrary(themeId) {
        try {
            let theme;
            
            if (window.electronAPI?.themeLibrary) {
                theme = await window.electronAPI.themeLibrary.get(themeId);
            } else {
                const saved = localStorage.getItem('themeforge-library');
                const library = saved ? JSON.parse(saved) : { themes: [] };
                theme = library.themes.find(t => t.id === themeId);
            }
            
            if (!theme) {
                this.showToast('Theme not found', 'error');
                return;
            }
            
            // Expand palette if needed
            if (theme.palette && !theme.colors) {
                const expanded = ThemeSchema.expandPaletteToTheme(theme.palette, theme.name, theme.type);
                theme = { ...theme, ...expanded };
            }
            
            this.currentTheme = theme;
            this.renderer.render(theme);
            this.updatePaletteDisplay(theme);
            this.updateThemeInfo(theme);
            this.enableExportButtons();
            this.canvasOverlay.classList.add('hidden');
            
            this.closeLibrary();
            this.showToast(`Loaded "${theme.name}"`, 'success');
            
        } catch (error) {
            console.error('Failed to load theme:', error);
            this.showToast(`Failed to load: ${error.message}`, 'error');
        }
    }

    /**
     * Edit theme from library
     */
    async editThemeFromLibrary(themeId) {
        try {
            let theme;
            
            if (window.electronAPI?.themeLibrary) {
                theme = await window.electronAPI.themeLibrary.get(themeId);
            } else {
                const saved = localStorage.getItem('themeforge-library');
                const library = saved ? JSON.parse(saved) : { themes: [] };
                theme = library.themes.find(t => t.id === themeId);
            }
            
            if (theme) {
                this.closeLibrary();
                this.openColorEditorWithTheme(theme);
            }
        } catch (error) {
            console.error('Failed to edit theme:', error);
            this.showToast(`Failed to edit: ${error.message}`, 'error');
        }
    }

    /**
     * Delete theme from library
     */
    async deleteThemeFromLibrary(themeId) {
        if (!confirm('Are you sure you want to delete this theme?')) {
            return;
        }
        
        try {
            if (window.electronAPI?.themeLibrary) {
                await window.electronAPI.themeLibrary.delete(themeId);
            } else {
                const saved = localStorage.getItem('themeforge-library');
                const library = saved ? JSON.parse(saved) : { themes: [] };
                library.themes = library.themes.filter(t => t.id !== themeId);
                localStorage.setItem('themeforge-library', JSON.stringify(library));
            }
            
            await this.loadLibraryThemes();
            this.showToast('Theme deleted', 'success');
            
        } catch (error) {
            console.error('Failed to delete theme:', error);
            this.showToast(`Failed to delete: ${error.message}`, 'error');
        }
    }

    /**
     * Import theme library
     */
    async importLibrary() {
        try {
            if (window.electronAPI?.themeLibrary) {
                const result = await window.electronAPI.themeLibrary.import();
                if (result.canceled) return;
                if (result.success) {
                    this.showToast(`Imported ${result.imported} themes`, 'success');
                    await this.loadLibraryThemes();
                } else {
                    throw new Error(result.error);
                }
            } else {
                this.showToast('Import not available in web mode', 'error');
            }
        } catch (error) {
            console.error('Failed to import:', error);
            this.showToast(`Failed to import: ${error.message}`, 'error');
        }
    }

    /**
     * Export theme library
     */
    async exportLibrary() {
        try {
            if (window.electronAPI?.themeLibrary) {
                const result = await window.electronAPI.themeLibrary.export();
                if (result.canceled) return;
                if (result.success) {
                    this.showToast('Library exported successfully', 'success');
                } else {
                    throw new Error(result.error);
                }
            } else {
                // Fallback: download as JSON
                const saved = localStorage.getItem('themeforge-library');
                if (saved) {
                    this.downloadJson(JSON.parse(saved), 'themeforge-library.json');
                    this.showToast('Library exported', 'success');
                }
            }
        } catch (error) {
            console.error('Failed to export:', error);
            this.showToast(`Failed to export: ${error.message}`, 'error');
        }
    }

    // ============================================
    // Color Editor Methods
    // ============================================

    /**
     * Open color editor with current theme
     */
    openColorEditor() {
        if (!this.currentTheme) {
            this.showToast('No theme to edit', 'error');
            return;
        }
        this.openColorEditorWithTheme({ ...this.currentTheme });
    }

    /**
     * Create a new theme from scratch
     */
    createFromScratch() {
        const defaultPalette = {
            background: '#1a1b26',
            backgroundAlt: '#16161e',
            foreground: '#c0caf5',
            foregroundMuted: '#565f89',
            accent: '#7aa2f7',
            accentSecondary: '#bb9af7',
            selection: '#33467c',
            comment: '#565f89',
            string: '#9ece6a',
            number: '#ff9e64',
            keyword: '#bb9af7',
            function: '#7aa2f7',
            class: '#2ac3de',
            variable: '#c0caf5',
            property: '#73daca',
            operator: '#89ddff',
            error: '#f7768e',
            warning: '#e0af68',
            success: '#9ece6a',
            info: '#7aa2f7'
        };
        
        const newTheme = {
            name: 'My Custom Theme',
            type: 'dark',
            palette: defaultPalette
        };
        
        this.openColorEditorWithTheme(newTheme);
    }

    /**
     * Open color editor with a specific theme
     */
    openColorEditorWithTheme(theme) {
        this.editingTheme = theme;
        this.editingPalette = { ...(theme.palette || ThemeSchema.extractPalette(theme)) };
        
        // Set theme name
        this.editThemeName.value = theme.name || 'Untitled Theme';
        
        // Set theme type toggle
        this.editThemeTypeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.editTheme === (theme.type || 'dark'));
        });
        
        // Update title
        this.editorTitle.textContent = theme.id ? 'Edit Theme Colors' : 'Create New Theme';
        
        // Render color inputs
        this.renderColorInputs();
        
        // Initialize editor canvas renderer
        if (!this.editorRenderer) {
            this.editorRenderer = new ThemeCanvasRenderer('editorCanvas');
        }
        this.updateEditorPreview();
        
        // Show modal
        this.colorEditorModal.classList.add('active');
    }

    /**
     * Render color input fields
     */
    renderColorInputs() {
        const categories = {
            'Base Colors': ['background', 'backgroundAlt', 'foreground', 'foregroundMuted'],
            'Accent Colors': ['accent', 'accentSecondary', 'selection'],
            'Syntax Colors': ['comment', 'string', 'number', 'keyword', 'function', 'class', 'variable', 'property', 'operator'],
            'Status Colors': ['error', 'warning', 'success', 'info']
        };
        
        const labels = {
            background: 'Background',
            backgroundAlt: 'Secondary BG',
            foreground: 'Foreground',
            foregroundMuted: 'Muted Text',
            accent: 'Primary Accent',
            accentSecondary: 'Secondary Accent',
            selection: 'Selection',
            comment: 'Comments',
            string: 'Strings',
            number: 'Numbers',
            keyword: 'Keywords',
            function: 'Functions',
            class: 'Classes',
            variable: 'Variables',
            property: 'Properties',
            operator: 'Operators',
            error: 'Error',
            warning: 'Warning',
            success: 'Success',
            info: 'Info'
        };
        
        let html = '';
        
        for (const [category, keys] of Object.entries(categories)) {
            html += `<div class="color-category">${category}</div>`;
            
            for (const key of keys) {
                const value = this.editingPalette[key] || '#888888';
                html += `
                    <div class="color-edit-row">
                        <label>${labels[key] || key}</label>
                        <div class="color-edit-input">
                            <input type="color" data-key="${key}" value="${value}">
                            <input type="text" data-key="${key}" value="${value}" maxlength="7">
                        </div>
                    </div>
                `;
            }
        }
        
        this.editorColors.innerHTML = html;
        
        // Add event listeners
        this.editorColors.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                const key = e.target.dataset.key;
                let value = e.target.value;
                
                // Ensure valid hex format
                if (e.target.type === 'text' && !value.startsWith('#')) {
                    value = '#' + value;
                }
                
                this.editingPalette[key] = value;
                
                // Sync color and text inputs
                const row = e.target.closest('.color-edit-row');
                row.querySelectorAll('input').forEach(inp => {
                    if (inp !== e.target) {
                        inp.value = value;
                    }
                });
                
                this.updateEditorPreview();
            });
        });
    }

    /**
     * Update the editor preview canvas
     */
    updateEditorPreview() {
        if (!this.editorRenderer || !this.editingTheme) return;
        
        // Build theme from palette
        const fullTheme = ThemeSchema.expandPaletteToTheme(
            this.editingPalette,
            this.editThemeName.value || 'Preview',
            this.editingTheme.type || 'dark'
        );
        fullTheme.palette = this.editingPalette;
        
        this.editorRenderer.render(fullTheme);
    }

    /**
     * Close color editor
     */
    closeColorEditor() {
        this.colorEditorModal.classList.remove('active');
        this.editingTheme = null;
        this.editingPalette = null;
    }

    /**
     * Save edited theme to library
     */
    async saveEditedThemeToLibrary() {
        if (!this.editingTheme || !this.editingPalette) return;
        
        const theme = {
            ...this.editingTheme,
            name: this.editThemeName.value || 'Untitled Theme',
            type: this.editingTheme.type || 'dark',
            palette: { ...this.editingPalette }
        };
        
        // Expand to full theme
        const fullTheme = ThemeSchema.expandPaletteToTheme(theme.palette, theme.name, theme.type);
        theme.colors = fullTheme.colors;
        theme.tokenColors = fullTheme.tokenColors;
        
        await this.saveThemeToLibrary(theme);
        this.closeColorEditor();
    }

    /**
     * Apply edited theme as current theme
     */
    applyEditedTheme() {
        if (!this.editingTheme || !this.editingPalette) return;
        
        const theme = {
            ...this.editingTheme,
            name: this.editThemeName.value || 'Untitled Theme',
            type: this.editingTheme.type || 'dark',
            palette: { ...this.editingPalette }
        };
        
        // Expand to full theme
        const fullTheme = ThemeSchema.expandPaletteToTheme(theme.palette, theme.name, theme.type);
        theme.colors = fullTheme.colors;
        theme.tokenColors = fullTheme.tokenColors;
        
        this.currentTheme = theme;
        this.renderer.render(theme);
        this.updatePaletteDisplay(theme);
        this.updateThemeInfo(theme);
        this.enableExportButtons();
        this.canvasOverlay.classList.add('hidden');
        
        this.closeColorEditor();
        this.showToast(`Applied "${theme.name}"`, 'success');
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
document.addEventListener('DOMContentLoaded', async () => {
    console.log('ThemeForge initializing...');
    
    // Detect Electron mode
    const isElectron = !!(window.electronAPI && window.electronAPI.isElectron);
    console.log(`Running in ${isElectron ? 'Electron' : 'Web'} mode`);
    
    // Log app info in Electron mode
    if (isElectron) {
        try {
            const appInfo = await window.electronAPI.getAppInfo();
            console.log('App Info:', appInfo);
            
            // Check installations
            const installations = await window.electronAPI.checkInstallations();
            console.log('Installations:', installations);
        } catch (e) {
            console.warn('Could not get Electron app info:', e);
        }
    }
    
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
