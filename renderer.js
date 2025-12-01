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

window.addEventListener('DOMContentLoaded', async () => {
    musicFiles = await window.electronAPI.loadFiles();
});