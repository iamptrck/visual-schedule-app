{\rtf1\ansi\ansicpg1251\cocoartf2820
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const tg = window.Telegram.WebApp;\
tg.ready();\
\
let albums = JSON.parse(localStorage.getItem('albums')) || \{\};\
\
function createAlbum() \{\
    const albumName = prompt("\uc0\u1042 \u1074 \u1077 \u1076 \u1080 \u1090 \u1077  \u1085 \u1072 \u1079 \u1074 \u1072 \u1085 \u1080 \u1077  \u1072 \u1083 \u1100 \u1073 \u1086 \u1084 \u1072 :");\
    if (albumName) \{\
        albums[albumName] = [];\
        saveAlbums();\
        renderAlbums();\
    \}\
\}\
\
function addStep(albumName) \{\
    const fileInput = document.createElement('input');\
    fileInput.type = 'file';\
    fileInput.accept = 'image/*';\
    fileInput.onchange = (e) => \{\
        const file = e.target.files[0];\
        const reader = new FileReader();\
        reader.onload = () => \{\
            const caption = prompt("\uc0\u1042 \u1074 \u1077 \u1076 \u1080 \u1090 \u1077  \u1087 \u1086 \u1076 \u1087 \u1080 \u1089 \u1100  \u1082  \u1092 \u1086 \u1090 \u1086 :");\
            if (caption) \{\
                albums[albumName].push(\{ image: reader.result, caption \});\
                saveAlbums();\
                renderAlbum(albumName);\
            \}\
        \};\
        reader.readAsDataURL(file);\
    \};\
    fileInput.click();\
\}\
\
function saveAlbums() \{\
    localStorage.setItem('albums', JSON.stringify(albums));\
\}\
\
function renderAlbums() \{\
    const albumsDiv = document.getElementById('albums');\
    albumsDiv.innerHTML = '';\
    for (const albumName in albums) \{\
        const albumDiv = document.createElement('div');\
        albumDiv.className = 'album';\
        albumDiv.innerHTML = `<h2>$\{albumName\}</h2><button onclick="renderAlbum('$\{albumName\}')">\uc0\u1054 \u1090 \u1082 \u1088 \u1099 \u1090 \u1100 </button><button onclick="addStep('$\{albumName\}')">\u1044 \u1086 \u1073 \u1072 \u1074 \u1080 \u1090 \u1100  \u1096 \u1072 \u1075 </button>`;\
        albumsDiv.appendChild(albumDiv);\
    \}\
\}\
\
function renderAlbum(albumName) \{\
    const albumsDiv = document.getElementById('albums');\
    albumsDiv.innerHTML = `<h2>$\{albumName\}</h2>`;\
    albums[albumName].forEach((step, index) => \{\
        const stepDiv = document.createElement('div');\
        stepDiv.className = 'step';\
        stepDiv.innerHTML = `\
            <span class="step-number">$\{index + 1\}</span>\
            <img src="$\{step.image\}" alt="Step $\{index + 1\}">\
            <span class="step-caption">$\{step.caption\}</span>\
        `;\
        albumsDiv.appendChild(stepDiv);\
    \});\
    const backButton = document.createElement('button');\
    backButton.textContent = '\uc0\u1053 \u1072 \u1079 \u1072 \u1076 ';\
    backButton.onclick = renderAlbums;\
    albumsDiv.appendChild(backButton);\
\}\
\
renderAlbums();}