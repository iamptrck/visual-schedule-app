const tg = window.Telegram.WebApp;
tg.expand();

let albums = {};

// Загрузка данных при старте
tg.CloudStorage.getItem("albums", (err, data) => {
    if (!err && data) {
        albums = JSON.parse(data);
        renderAlbums();
    }
});

document.getElementById('createAlbumBtn').addEventListener('click', createAlbum);

function createAlbum() {
    const albumName = prompt("Введите название альбома:");
    if (albumName && !albums[albumName]) {
        albums[albumName] = [];
        saveAlbums();
        renderAlbums();
    } else {
        alert("Альбом уже существует или имя пустое!");
    }
}

function addStep(albumName) {
    const caption = prompt("Введите подпись к шагу:");
    if (caption) {
        const step = { image: 'https://via.placeholder.com/100', caption }; // Временно используем заглушку
        albums[albumName].push(step);
        saveAlbums();
        renderAlbum(albumName);
    }
}

function deleteAlbum(albumName) {
    if (confirm(`Вы уверены, что хотите удалить альбом "${albumName}"?`)) {
        delete albums[albumName];
        saveAlbums();
        renderAlbums();
    }
}

function deleteStep(albumName, index) {
    if (confirm("Удалить этот шаг?")) {
        albums[albumName].splice(index, 1);
        saveAlbums();
        renderAlbum(albumName);
    }
}

function saveAlbums() {
    tg.CloudStorage.setItem("albums", JSON.stringify(albums), (err) => {
        if (err) console.warn("Ошибка при сохранении данных:", err);
    });
}

function renderAlbums() {
    const albumsDiv = document.getElementById('albums');
    albumsDiv.innerHTML = '';

    for (const albumName in albums) {
        const albumDiv = document.createElement('div');
        albumDiv.className = 'album';
        albumDiv.innerHTML = `
            <h2>${albumName}</h2>
            <button onclick="renderAlbum('${albumName}')">Открыть</button>
            <button onclick="addStep('${albumName}')">Добавить шаг</button>
            <button onclick="deleteAlbum('${albumName}')">Удалить альбом</button>
        `;
        albumsDiv.appendChild(albumDiv);
    }
}

function renderAlbum(albumName) {
    const albumsDiv = document.getElementById('albums');
    albumsDiv.innerHTML = `<h2>${albumName}</h2><button onclick="renderAlbums()">Назад</button>`;

    albums[albumName].forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step';
        stepDiv.innerHTML = `
            <span class="step-number">${index + 1}</span>
            <img src="${step.image}" alt="Шаг ${index + 1}">
            <span class="step-caption">${step.caption}</span>
            <button onclick="deleteStep('${albumName}', ${index})">Удалить</button>
        `;
        albumsDiv.appendChild(stepDiv);
    });
}

renderAlbums();
