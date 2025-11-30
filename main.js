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
        backgroundColor: '#121212',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools();
}

ipcMain.handle('uploadFiles', async () => {
    const musicFolder = path.join(os.homedir(), 'Music');

    try {
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

        const filePaths = await findMP3Files(musicFolder);
        console.log('filePaths', filePaths);

        const promisesFilePaths = await Promise.all(filePaths.map((filePath) => { // Promise.all() oczekuje a zostan odczytane metadane dla kadego pliku - jezeli przynajmniej jeden nie zwroci poprawnie calosc i zwrocona zostanie pusta tablica // wiec zamiast tego zwracamy null
            try {
                return mm.parseFile(filePath);
            } catch (err) {
                console.warn('Metadata parse failed for:', filePath.err);
                // return filePaths.map((file, index) => ({  // --> Mozemy wyfiltrowac pliki na ktorych byl blad i je zwrocic // w tym celu nalezy odkomentowac ten kod
                //     file,
                //     metadata: promisesFilePaths[index] || {},
                // }));
                return null;
            }
        }));

        console.log('promisesFilePaths', promisesFilePaths);

        return filePaths.map((file, index) => {
            return {
                file,
                metadata: promisesFilePaths[index],
            }
        });
    } catch (error) {
        console.error('Error reading music folder:', error);
        return [];
    }
});

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
