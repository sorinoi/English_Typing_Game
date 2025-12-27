const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    // Create the browser window
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false
        },
        icon: path.join(__dirname, 'build/icon.png'),
        title: 'English Typing Game',
        backgroundColor: '#667eea',
        resizable: true,
        minimizable: true,
        maximizable: true
    });

    // Load the index.html file
    mainWindow.loadFile('index.html');

    // Open DevTools in development (optional - comment out for production)
    // mainWindow.webContents.openDevTools();

    // Remove menu bar
    mainWindow.setMenuBarVisibility(false);
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // On macOS, re-create a window when dock icon is clicked and no windows are open
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
