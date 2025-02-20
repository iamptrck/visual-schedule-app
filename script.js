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

function editStepText(albumName, index) {
    const newCaption = prompt("Редактировать подпись:", albums[albumName][index].caption);
    if (newCaption !== null) {
        albums[albumName][index].caption = newCaption;
        saveAlbums();
        renderAlbum(albumName);
    }
}

function sendAlbum(albumName) {
    const message = `📅 Визуальное расписание: ${albumName}\n\n` + 
        albums[albumName].map((step, i) => `✅ ${i + 1}. ${step.caption}`).join("\n");

    tg.showPopup({
        title: "Отправка альбома",
        message: "Выберите, кому отправить расписание",
        buttons: [{ text: "Отправить в Telegram", id: "send" }]
    });

    tg.onEvent('popupClosed', (data) => {
        if (data.button_id === "send") {
            tg.sendData(JSON.stringify({ text: message }));
        }
    });
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
            <h2>${albumName}</h2>
            <button onclick="renderAlbum('${albumName}')">Открыть</button>
            <button onclick="addStep('${albumName}')">Добавить шаг</button>
            <button onclick="deleteAlbum('${albumName}')">Удалить альбом</button>
            <button onclick="sendAlbum('${albumName}')">📤 Поделиться</button>
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
            <img src="${step.image}" alt="Шаг ${index + 1}" onclick="viewImage('${step.image}')">
            <span class="step-caption" onclick="editStepText('${albumName}', ${index})">${step.caption}</span>
            <input type="checkbox" ${step.completed ? "checked" : ""} onclick="toggleStepCompletion('${albumName}', ${index})">
            <button onclick="deleteStep('${albumName}', ${index})">🗑</button>
        `;
        albumsDiv.appendChild(stepDiv);
    });
}

function viewImage(src) {
    const imgWindow = window.open();
    imgWindow.document.write(`<img src="${src}" style="width:100%; height:auto;">`);
}

renderAlbums();
