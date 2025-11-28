/**
 * ThemeForge - Preload Script
 * Exposes safe Electron APIs to the renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Platform info
    platform: process.platform,
    
    // Get extension paths
    getExtensionPaths: () => ipcRenderer.invoke('get-extension-paths'),
    
    // Check if directory exists
    directoryExists: (dirPath) => ipcRenderer.invoke('directory-exists', dirPath),
    
    // Install theme to extensions folder
    installTheme: (data) => ipcRenderer.invoke('install-theme', data),
    
    // Select a directory using native dialog
    selectDirectory: (options) => ipcRenderer.invoke('select-directory', options || {}),
    
    // Save file with dialog
    saveFile: (options) => ipcRenderer.invoke('save-file', options),
    
    // Save JSON file
    saveJson: (options) => ipcRenderer.invoke('save-json', options),
    
    // Open folder in file manager
    openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
    
    // Get app info
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),
    
    // Check for Cursor/VSCode installations
    checkInstallations: () => ipcRenderer.invoke('check-installations'),
    
    // Get native theme
    getNativeTheme: () => ipcRenderer.invoke('get-native-theme'),
    
    // Read file
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    
    // Show error dialog
    showError: (options) => ipcRenderer.invoke('show-error', options),
    
    // Show message box
    showMessage: (options) => ipcRenderer.invoke('show-message', options),
    
    // Theme Library operations
    themeLibrary: {
        getAll: () => ipcRenderer.invoke('theme-library-get-all'),
        save: (theme) => ipcRenderer.invoke('theme-library-save', theme),
        delete: (themeId) => ipcRenderer.invoke('theme-library-delete', themeId),
        get: (themeId) => ipcRenderer.invoke('theme-library-get', themeId),
        export: () => ipcRenderer.invoke('theme-library-export'),
        import: () => ipcRenderer.invoke('theme-library-import')
    },
    
    // Settings operations
    settings: {
        get: () => ipcRenderer.invoke('settings-get'),
        save: (settings) => ipcRenderer.invoke('settings-save', settings),
        reset: () => ipcRenderer.invoke('settings-reset')
    },
    
    // App theme operations (for applying theme to ThemeForge itself)
    appTheme: {
        get: () => ipcRenderer.invoke('app-theme-get'),
        save: (theme) => ipcRenderer.invoke('app-theme-save', theme),
        clear: () => ipcRenderer.invoke('app-theme-clear')
    },
    
    // Get user data path
    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
    
    // Check if running in Electron
    isElectron: true
});

// Log when preload is ready
console.log('ThemeForge preload script loaded');

