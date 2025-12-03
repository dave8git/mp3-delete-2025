const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs/promises');
const mm = require('music-metadata');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        minWidth: 800,
        minHeight: 500,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            webgl: false,          // disable GPU-heavy WebGL
            experimentalFeatures: false,
            spellcheck: false,
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools();
}

// Utils

async function findMP3Files(dir) {
    let mp3Files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const subFiles = await findMP3Files(fullPath);
            mp3Files = mp3Files.concat(subFiles);
        } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.mp3') {
            mp3Files.push(fullPath);
        }
    }
    return mp3Files;
}

async function parseInBatches(arr, batchSize = 5) {
    const result = [];
    for (let i = 0; i < arr.length; i += batchSize) {
        const slice = arr.slice(i, i + batchSize);
        for (const file of slice) {
            result.push(await mm.parseFile(file));
        }
    }
    return result;
}

// IPC handlers

ipcMain.handle('uploadFiles', async () => {
    const musicFolder = path.join(os.homedir(), 'Music');

    try {
        const filePaths = await findMP3Files(musicFolder);
        const parsedFiles = await parseInBatches(filePaths);

        return filePaths.map((file, index) => {
            return {
                file,
                metadata: parsedFiles[index],
            }
        });
    } catch (error) {
        console.error('Error reading music folder:', error);
        return [];
    }
});

ipcMain.handle('deleteFile', async (event, filePath) => {
    try {
        await fs.unlink(filePath);
        return { success: true };
    } catch {
        console.error('Failed to delete file');
        return { success: false };
    }
});

// APP Lifecycle

app.disableHardwareAcceleration();

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        // macOS: recreate window when dock icon is clicked
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
