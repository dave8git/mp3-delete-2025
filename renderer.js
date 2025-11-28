window.addEventListener('DOMContentLoaded', async () => {
    const files = await window.electronAPI.loadFiles();
    console.log('files', files);
});