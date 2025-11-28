const { contextBridge, ipcRenderer } = require('electron');
const { pathToFileURL } = require('url');

contextBridge.exposeInMainWorld('electronAPI', {
    loadFiles: () => ipcRenderer.invoke('uploadFiles'),
});