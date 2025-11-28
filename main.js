/**
 * ThemeForge - Electron Main Process
 * Handles window management, native file operations, and IPC
 */

const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Set the app name (shown in menu bar on macOS)
app.name = 'ThemeForge';

// User data paths
const userDataPath = app.getPath('userData');
const themeLibraryPath = path.join(userDataPath, 'theme-library.json');
const settingsPath = path.join(userDataPath, 'settings.json');
const appThemePath = path.join(userDataPath, 'app-theme.json');

// Default settings
const defaultSettings = {
    ollamaUrl: 'http://localhost:11434',
    model: '',
    temperature: 0.7,
    baseTheme: 'dark',
    contrast: 'normal',
    windowBounds: null
};

/**
 * Initialize settings file
 */
function initSettings() {
    if (!fs.existsSync(settingsPath)) {
        fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
    }
}

/**
 * Read settings
 */
function readSettings() {
    try {
        initSettings();
        const data = fs.readFileSync(settingsPath, 'utf8');
        return { ...defaultSettings, ...JSON.parse(data) };
    } catch (error) {
        console.error('Error reading settings:', error);
        return { ...defaultSettings };
    }
}

/**
 * Write settings
 */
function writeSettings(settings) {
    try {
        const current = readSettings();
        const merged = { ...current, ...settings };
        fs.writeFileSync(settingsPath, JSON.stringify(merged, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing settings:', error);
        return false;
    }
}

/**
 * Read app theme
 */
function readAppTheme() {
    try {
        if (fs.existsSync(appThemePath)) {
            const data = fs.readFileSync(appThemePath, 'utf8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error('Error reading app theme:', error);
        return null;
    }
}

/**
 * Write app theme
 */
function writeAppTheme(theme) {
    try {
        if (theme === null) {
            if (fs.existsSync(appThemePath)) {
                fs.unlinkSync(appThemePath);
            }
        } else {
            fs.writeFileSync(appThemePath, JSON.stringify(theme, null, 2));
        }
        return true;
    } catch (error) {
        console.error('Error writing app theme:', error);
        return false;
    }
}

/**
 * Initialize theme library file
 */
function initThemeLibrary() {
    if (!fs.existsSync(themeLibraryPath)) {
        fs.writeFileSync(themeLibraryPath, JSON.stringify({ themes: [] }, null, 2));
    }
}

/**
 * Read theme library
 */
function readThemeLibrary() {
    try {
        initThemeLibrary();
        const data = fs.readFileSync(themeLibraryPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading theme library:', error);
        return { themes: [] };
    }
}

/**
 * Write theme library
 */
function writeThemeLibrary(library) {
    try {
        fs.writeFileSync(themeLibraryPath, JSON.stringify(library, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing theme library:', error);
        return false;
    }
}

// Keep a global reference of the window object
let mainWindow;

// Determine extension paths based on platform
function getExtensionPaths() {
    const homeDir = os.homedir();
    
    return {
        cursor: path.join(homeDir, '.cursor', 'extensions'),
        vscode: path.join(homeDir, '.vscode', 'extensions'),
        userData: userDataPath
    };
}

// Create the browser window
function createWindow() {
    // Get saved window bounds
    const settings = readSettings();
    const bounds = settings.windowBounds || { width: 1400, height: 900 };
    
    mainWindow = new BrowserWindow({
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        minWidth: 1000,
        minHeight: 700,
        backgroundColor: '#0a0a0f',
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 20, y: 18 },
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            sandbox: false
        },
        show: false,
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    // Load the index.html
    mainWindow.loadFile('index.html');

    // Show window when ready to avoid flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Open DevTools in development
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    // Save window bounds on resize/move
    const saveBounds = () => {
        if (!mainWindow.isMaximized() && !mainWindow.isMinimized()) {
            const bounds = mainWindow.getBounds();
            writeSettings({ windowBounds: bounds });
        }
    };
    
    mainWindow.on('resize', saveBounds);
    mainWindow.on('move', saveBounds);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

// App lifecycle events
app.whenReady().then(() => {
    // Set up application menu with proper app name
    const template = [
        {
            label: app.name,
            submenu: [
                { role: 'about', label: `About ${app.name}` },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide', label: `Hide ${app.name}` },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit', label: `Quit ${app.name}` }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' },
                { type: 'separator' },
                { role: 'close' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ============================================
// IPC Handlers for Native Operations
// ============================================

/**
 * Get the extension paths for Cursor and VSCode
 */
ipcMain.handle('get-extension-paths', () => {
    return getExtensionPaths();
});

/**
 * Check if a directory exists
 */
ipcMain.handle('directory-exists', (event, dirPath) => {
    try {
        return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    } catch {
        return false;
    }
});

/**
 * Install theme to a specific extensions directory
 * @param {string} extensionsPath - The path to the extensions directory
 * @param {string} folderName - The extension folder name
 * @param {Object} files - Object mapping file paths to content
 */
ipcMain.handle('install-theme', async (event, { extensionsPath, folderName, files }) => {
    try {
        const extensionDir = path.join(extensionsPath, folderName);
        
        // Create the extension directory
        if (!fs.existsSync(extensionDir)) {
            fs.mkdirSync(extensionDir, { recursive: true });
        }

        // Write all files
        for (const [filePath, content] of Object.entries(files)) {
            const fullPath = path.join(extensionDir, filePath);
            const dir = path.dirname(fullPath);
            
            // Create subdirectories if needed
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(fullPath, content, 'utf8');
        }

        return {
            success: true,
            path: extensionDir,
            message: `Theme installed to ${extensionDir}`
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
});

/**
 * Show a directory picker dialog
 */
ipcMain.handle('select-directory', async (event, { title, defaultPath }) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: title || 'Select Extensions Folder',
        defaultPath: defaultPath,
        properties: ['openDirectory', 'createDirectory'],
        buttonLabel: 'Select Folder'
    });

    if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true };
    }

    return {
        canceled: false,
        path: result.filePaths[0]
    };
});

/**
 * Save a file using the save dialog
 */
ipcMain.handle('save-file', async (event, { defaultName, content, filters }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Theme',
        defaultPath: defaultName,
        filters: filters || [
            { name: 'ZIP Archive', extensions: ['zip'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (result.canceled || !result.filePath) {
        return { canceled: true };
    }

    try {
        // Content can be a base64 string or Buffer
        const buffer = Buffer.isBuffer(content) 
            ? content 
            : Buffer.from(content, 'base64');
        
        fs.writeFileSync(result.filePath, buffer);
        
        return {
            canceled: false,
            filePath: result.filePath,
            success: true
        };
    } catch (error) {
        return {
            canceled: false,
            success: false,
            error: error.message
        };
    }
});

/**
 * Save JSON file
 */
ipcMain.handle('save-json', async (event, { defaultName, content }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Theme JSON',
        defaultPath: defaultName,
        filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (result.canceled || !result.filePath) {
        return { canceled: true };
    }

    try {
        fs.writeFileSync(result.filePath, content, 'utf8');
        return {
            canceled: false,
            filePath: result.filePath,
            success: true
        };
    } catch (error) {
        return {
            canceled: false,
            success: false,
            error: error.message
        };
    }
});

/**
 * Open a folder in the system file manager
 */
ipcMain.handle('open-folder', async (event, folderPath) => {
    try {
        await shell.openPath(folderPath);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

/**
 * Get app info
 */
ipcMain.handle('get-app-info', () => {
    return {
        version: app.getVersion(),
        platform: process.platform,
        arch: process.arch,
        electronVersion: process.versions.electron,
        nodeVersion: process.versions.node,
        chromeVersion: process.versions.chrome
    };
});

/**
 * Check for Cursor/VSCode installation
 */
ipcMain.handle('check-installations', () => {
    const paths = getExtensionPaths();
    
    return {
        cursor: {
            installed: fs.existsSync(paths.cursor),
            path: paths.cursor
        },
        vscode: {
            installed: fs.existsSync(paths.vscode),
            path: paths.vscode
        }
    };
});

/**
 * Get native theme preference
 */
ipcMain.handle('get-native-theme', () => {
    return {
        shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
        themeSource: nativeTheme.themeSource
    };
});

/**
 * Read file from disk
 */
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return { success: true, content };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

/**
 * Show error dialog
 */
ipcMain.handle('show-error', async (event, { title, content }) => {
    await dialog.showErrorBox(title || 'Error', content);
});

/**
 * Show message box
 */
ipcMain.handle('show-message', async (event, options) => {
    const result = await dialog.showMessageBox(mainWindow, {
        type: options.type || 'info',
        title: options.title || 'ThemeForge',
        message: options.message,
        detail: options.detail,
        buttons: options.buttons || ['OK'],
        defaultId: options.defaultId || 0,
        cancelId: options.cancelId
    });
    
    return {
        response: result.response,
        checkboxChecked: result.checkboxChecked
    };
});

// ============================================
// Theme Library IPC Handlers
// ============================================

/**
 * Get all themes from library
 */
ipcMain.handle('theme-library-get-all', () => {
    const library = readThemeLibrary();
    return library.themes || [];
});

/**
 * Save a theme to library
 */
ipcMain.handle('theme-library-save', (event, theme) => {
    try {
        const library = readThemeLibrary();
        
        // Generate unique ID if not present
        if (!theme.id) {
            theme.id = `theme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Add timestamps
        theme.updatedAt = new Date().toISOString();
        if (!theme.createdAt) {
            theme.createdAt = theme.updatedAt;
        }
        
        // Check if theme exists (update) or is new (add)
        const existingIndex = library.themes.findIndex(t => t.id === theme.id);
        if (existingIndex >= 0) {
            library.themes[existingIndex] = theme;
        } else {
            library.themes.unshift(theme); // Add to beginning
        }
        
        writeThemeLibrary(library);
        return { success: true, theme };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

/**
 * Delete a theme from library
 */
ipcMain.handle('theme-library-delete', (event, themeId) => {
    try {
        const library = readThemeLibrary();
        library.themes = library.themes.filter(t => t.id !== themeId);
        writeThemeLibrary(library);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

/**
 * Get a single theme by ID
 */
ipcMain.handle('theme-library-get', (event, themeId) => {
    const library = readThemeLibrary();
    return library.themes.find(t => t.id === themeId) || null;
});

/**
 * Export theme library
 */
ipcMain.handle('theme-library-export', async () => {
    const library = readThemeLibrary();
    
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Theme Library',
        defaultPath: 'themeforge-library.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });
    
    if (result.canceled) {
        return { canceled: true };
    }
    
    try {
        fs.writeFileSync(result.filePath, JSON.stringify(library, null, 2));
        return { success: true, filePath: result.filePath };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

/**
 * Import theme library
 */
ipcMain.handle('theme-library-import', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Import Theme Library',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile']
    });
    
    if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true };
    }
    
    try {
        const content = fs.readFileSync(result.filePaths[0], 'utf8');
        const imported = JSON.parse(content);
        
        if (!imported.themes || !Array.isArray(imported.themes)) {
            return { success: false, error: 'Invalid theme library format' };
        }
        
        const library = readThemeLibrary();
        
        // Merge themes, avoiding duplicates by ID
        const existingIds = new Set(library.themes.map(t => t.id));
        const newThemes = imported.themes.filter(t => !existingIds.has(t.id));
        
        library.themes = [...newThemes, ...library.themes];
        writeThemeLibrary(library);
        
        return { success: true, imported: newThemes.length, total: library.themes.length };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// ============================================
// Settings IPC Handlers
// ============================================

/**
 * Get all settings
 */
ipcMain.handle('settings-get', () => {
    return readSettings();
});

/**
 * Save settings (merges with existing)
 */
ipcMain.handle('settings-save', (event, settings) => {
    return writeSettings(settings);
});

/**
 * Reset settings to defaults
 */
ipcMain.handle('settings-reset', () => {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

/**
 * Get app theme
 */
ipcMain.handle('app-theme-get', () => {
    return readAppTheme();
});

/**
 * Save app theme
 */
ipcMain.handle('app-theme-save', (event, theme) => {
    return writeAppTheme(theme);
});

/**
 * Clear app theme (reset to default)
 */
ipcMain.handle('app-theme-clear', () => {
    return writeAppTheme(null);
});

/**
 * Get user data path
 */
ipcMain.handle('get-user-data-path', () => {
    return userDataPath;
});

