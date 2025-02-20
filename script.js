const tg = window.Telegram.WebApp;
tg.expand();

let albums = {};

// Загружаем данные из Telegram CloudStorage
tg.CloudStorage.getItem("albums", (err, data) => {
    if (!err && data) {
        albums = JSON.parse(data);
        renderAlbums();
    }
});

document.getElementById('createAlbumBtn').addEventListener('click', createAlbum);
document.getElementById('shareAppBtn').addEventListener('click', shareApp);

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

function renameAlbum(albumName) {
    const newName = prompt("Введите новое название альбома:", albumName);
    if (newName && newName !== albumName && !albums[newName]) {
        albums[newName] = albums[albumName];
        delete albums[albumName];
        saveAlbums();
        renderAlbums();
    }
}

function addStep(albumName) {
    const caption = prompt("Введите подпись к шагу:");
    if (!caption) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            albums[albumName].push({ image: reader.result, caption, completed: false });
            saveAlbums();
            renderAlbum(albumName);
        };
        reader.readAsDataURL(file);
    };
    fileInput.click();
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

function toggleStepCompletion(albumName, index) {
    albums[albumName][index].completed = !albums[albumName][index].completed;
    saveAlbums();
    renderAlbum(albumName);
}

function saveAlbums() {
    tg.CloudStorage.setItem("albums", JSON.stringify(albums), (err) => {
        if (err) console.warn("Ошибка сохранения:", err);
    });
}

function renderAlbums() {
    const albumsDiv = document.getElementById('albums');
    albumsDiv.innerHTML = '';

    for (const albumName in albums) {
        const albumDiv = document.createElement('div');
        albumDiv.className = 'album';
        albumDiv.innerHTML = `
            <h2 class="album-title" onclick="renameAlbum('${albumName}')">${albumName}</h2>
            <span class="edit-icon" onclick="renameAlbum('${albumName}')">✏️</span>
            <button onclick="renderAlbum('${albumName}')">Открыть</button>
            <button onclick="addStep('${albumName}')">Добавить шаг</button>
            <button onclick="deleteAlbum('${albumName}')">🗑</button>
        `;
        albumsDiv.appendChild(albumDiv);
    }
    
    // Добавляем кнопку "Создать альбом" внизу списка
    const createButton = document.createElement('button');
    createButton.textContent = "Создать альбом";
    createButton.onclick = createAlbum;
    albumsDiv.appendChild(createButton);
}

function renderAlbum(albumName) {
    const albumsDiv = document.getElementById('albums');
    albumsDiv.innerHTML = `<h2>${albumName}</h2><button onclick="renderAlbums()">Назад</button>`;

    if (albums[albumName].length === 0) {
        albumsDiv.innerHTML += `<button onclick="addStep('${albumName}')">Добавить шаг</button>`;
    }

    albums[albumName].forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step';
        stepDiv.draggable = true;
        stepDiv.ondragstart = (e) => { e.dataTransfer.setData('index', index); };
        stepDiv.ondragover = (e) => { e.preventDefault(); };
        stepDiv.ondrop = (e) => { reorderSteps(albumName, index, e.dataTransfer.getData('index')); };

        stepDiv.innerHTML = `
            <img src="${step.image}" alt="Шаг ${index + 1}">
            <span class="step-caption">${step.caption}</span>
            <input type="checkbox" ${step.completed ? "checked" : ""} onclick="toggleStepCompletion('${albumName}', ${index})">
            <button onclick="deleteStep('${albumName}', ${index})">🗑</button>
        `;
        albumsDiv.appendChild(stepDiv);
    });
}

function reorderSteps(albumName, newIndex, oldIndex) {
    let moved = albums[albumName].splice(oldIndex, 1)[0];
    albums[albumName].splice(newIndex, 0, moved);
    saveAlbums();
    renderAlbum(albumName);
}

renderAlbums();
