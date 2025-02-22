const tg = window.Telegram.WebApp;
tg.expand();

let albums = {};

// Загружаем данные из CloudStorage и фиксируем ошибки
tg.CloudStorage.getItem("albums", (err, data) => {
    if (!err && data) {
        try {
            albums = JSON.parse(data);
            renderAlbums();
        } catch (e) {
            console.error("Ошибка загрузки данных:", e);
            albums = {};
        }
    }
});

document.getElementById('createAlbumBtn').addEventListener('click', createAlbum);
document.getElementById('shareAppBtn').addEventListener('click', shareApp);
document.getElementById('faqBtn').addEventListener('click', openFAQ);

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
    try {
        tg.CloudStorage.setItem("albums", JSON.stringify(albums), (err) => {
            if (err) console.warn("Ошибка сохранения:", err);
        });
    } catch (e) {
        console.error("Ошибка записи в CloudStorage:", e);
    }
}

function renderAlbums() {
    const albumsDiv = document.getElementById('albums');
    albumsDiv.innerHTML = '';

    for (const albumName in albums) {
        const albumDiv = document.createElement('div');
        albumDiv.className = 'album';
        albumDiv.innerHTML = `
            <h2 class="album-title" onclick="renameAlbum('${albumName}')">${albumName}</h2>
            <span class="edit-icon" onclick="renameAlbum('${albumName}')">📝</span>
            <button onclick="renderAlbum('${albumName}')">Открыть</button>
            <button onclick="addStep('${albumName}')">Добавить шаг</button>
            <button class="delete-album-btn" onclick="deleteAlbum('${albumName}')">🗑</button>
        `;
        albumsDiv.appendChild(albumDiv);
    }
}

function renderAlbum(albumName) {
    const albumsDiv = document.getElementById('albums');
    albumsDiv.innerHTML = `<h2>${albumName}</h2><button onclick="renderAlbums()">Назад</button>`;

    const addStepBtn = document.createElement('button');
    addStepBtn.textContent = "Добавить шаг";
    addStepBtn.onclick = () => addStep(albumName);
    albumsDiv.appendChild(addStepBtn);

    albums[albumName].forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step';
        stepDiv.innerHTML = `
            <img src="${step.image}" alt="Шаг ${index + 1}">
            <span class="step-caption">${step.caption}</span>
            <input type="checkbox" ${step.completed ? "checked" : ""} onclick="toggleStepCompletion('${albumName}', ${index})">
            <button onclick="deleteStep('${albumName}', ${index})">🗑</button>
        `;
        albumsDiv.appendChild(stepDiv);
    });
}

function shareApp() {
    try {
        tg.openTelegramLink("https://t.me/share/url?url=https://t.me/YOUR_BOT_USERNAME&text=Попробуй%20это%20визуальное%20расписание%20для%20своих%20детей!");
    } catch (e) {
        console.error("Ошибка отправки ссылки:", e);
    }
}

function openFAQ() {
    const faqContent = `
        <h2>Как правильно пользоваться приложением?</h2>
        <p>📌 <b>Что это за приложение?</b></p>
        <p>Это визуальное расписание, которое помогает детям с аутизмом и их родителям планировать день.</p>
        
        <p>📌 <b>Как создать альбом?</b></p>
        <p>Нажмите «Создать альбом», введите название и выберите эмоджи.</p>
        
        <p>📌 <b>Как добавить шаг?</b></p>
        <p>Откройте альбом, нажмите «Добавить шаг», введите подпись и загрузите фото.</p>
        
        <p>📌 <b>Как отмечать выполненные задачи?</b></p>
        <p>Отмечайте выполненные шаги галочками ☑️.</p>

        <p>📌 <b>Как удалить альбом или шаг?</b></p>
        <p>Нажмите 🗑 рядом с элементом.</p>

        <p>📌 <b>Как поделиться расписанием?</b></p>
        <p>Выберите альбом и нажмите «Поделиться».</p>

        <p>📌 <b>Где хранятся данные?</b></p>
        <p>Все данные хранятся в облаке Telegram (CloudStorage), не пропадают.</p>

        <p>📌 <b>Как связаться с разработчиком?</b></p>
        <p>📩 Telegram: <a href="https://t.me/i_am_ptrck">@i_am_ptrck</a></p>
        
        <button onclick="closeFAQ()">Назад</button>
    `;

    document.body.innerHTML = faqContent;
}

function closeFAQ() {
    location.reload();
}

renderAlbums();
