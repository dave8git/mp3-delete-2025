const playPauseBtn = document.getElementById('play-pause-btn');
const deleteBtn = document.getElementById('delete-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');

let musicFiles;
let audioPlayer = new Audio();
let currentIndex = 0;
console.log('musicFiles', musicFiles);

function loadSong(index) {
    audioPlayer.src = musicFiles[index].file;
    loadDisplay(musicFiles[index].metadata.common);
    audioPlayer.play().catch(err => {
        console.error('Failed to play:');
        console.log('File cannot be opened!');
    });
};

function loadDisplay(metadata) {
    songTitle.innerText = metadata.title;
    songArtist.innerText = metadata.artist;
}

function nextSong() {
    currentIndex++;
    if(currentIndex >= musicFiles.length) currentIndex = 0; // jak dojdziesz do końca tablicy z piosenkami zacznij od początku
    loadSong(currentIndex);
};

function prevSong() {
    currentIndex--;
    if (currentIndex < 0) currentIndex = musicFiles.length - 1; // jak dojdziesz do początku to zacznij grać ostatnią (i potem poprzednie)
    loadSong(currentIndex);
}

playPauseBtn.addEventListener('click', async () => {
    console.log('song loaded');
    if (audioPlayer.pause) {
        loadSong(currentIndex);
    } else {
        audioPlayer.pause();
    }
});

nextBtn.addEventListener('click', () => {
    nextSong();
});

prevBtn.addEventListener('click', () => {
    prevSong();
});

deleteBtn.addEventListener('click', async () => {
    audioPlayer.pause();
    audioPlayer.src = "";
    audioPlayer.load();
    await new Promise(res => setTimeout(res, 50));
    console.log('musicFiles[currentIndex]', musicFiles[currentIndex].file);
    const result = await window.electronAPI.deleteFile(musicFiles[currentIndex].file);
    console.log('result', result);
    if(result.success) {
        musicFiles.splice(currentIndex, 1);
        if (musicFiles.length > 0) {
            currentIndex = Math.min(currentIndex, musicFiles.length - 1); // Math.min zwroci ten parametr ktory bedzie mial mniejsza wartosc // ex. currentIndex = Math.min(12, 9); // currentIndex becomes 9
            loadSong(currentIndex);
        } else {
            songTitle.innerText = "No songs left";
            songArtist.innerText = "";
        }
    } else {
        console.error("Delete failed:", result.error);
    }
});

window.addEventListener('DOMContentLoaded', async () => {
    musicFiles = await window.electronAPI.loadFiles();
});