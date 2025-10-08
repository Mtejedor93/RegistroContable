// Crear sección contenedora
const sectionBtn = document.createElement('section');
sectionBtn.className = 'controlsButtons';

// Crear contenedor interno
const btnContainer = document.createElement('div');

// Crear botones
const btnNewRegister = document.createElement('div');
btnNewRegister.className = 'btnControls';
btnNewRegister.id = 'ModalNewRegister';
btnNewRegister.textContent = 'Nuevo Registro';

const btnUploadFile = document.createElement('div');
btnUploadFile.className = 'btnControls';
btnUploadFile.textContent = 'Subir datos';

const btnUploadInput = document.createElement('input');
btnUploadInput.type = 'file';
btnUploadInput.id = 'jsonUploader';
btnUploadInput.accept = '.json';
btnUploadInput.style.display = 'none';


const btnDownloadFile = document.createElement('div');
btnDownloadFile.className = 'btnControls';
btnDownloadFile.id = 'DownloadDatabase';
btnDownloadFile.textContent = 'Descargar';

const btnShowTable = document.createElement('div');
btnShowTable.className = 'btnControls';
btnShowTable.id = 'whatTable';
btnShowTable.textContent = 'Ver registros';

// Agregar botones al contenedor
btnContainer.appendChild(btnNewRegister);
btnContainer.appendChild(btnUploadFile);
btnContainer.appendChild(btnUploadInput);
btnContainer.appendChild(btnDownloadFile);
btnContainer.appendChild(btnShowTable);

// Agregar contenedor a la sección
sectionBtn.appendChild(btnContainer);

// Agregar sección al body
document.body.appendChild(sectionBtn);

function addMenuToggle() {
    const screenSize = window.innerWidth;
    const menuToggleId = 'menuToggleBtn';
    const menuToggleExisting = document.getElementById(menuToggleId);

    if (screenSize < 768) {
        // Si no existe el botón, lo creamos
        if (!menuToggleExisting) {
            const menuToggle = document.createElement('div');
            menuToggle.id = menuToggleId;
            menuToggle.className = 'menu-toggle';
            menuToggle.textContent = '☰';
            menuToggle.addEventListener('click', toggleMenu);

            const navBar = document.querySelector('.navBar');
            navBar.appendChild(menuToggle);
            if (sectionBtn.parentNode) {
                sectionBtn.parentNode.removeChild(sectionBtn);
            }

        }

    } else {
        // Si existe el botón en pantallas grandes, lo eliminamos
        if (menuToggleExisting) {
            menuToggleExisting.remove();
        }
        if (screenSize > 769 && !sectionBtn.parentNode) {
            document.body.appendChild(sectionBtn);
        }
    }
}

function toggleMenu() {
    const menuToggle = document.getElementById('menuToggleBtn');

    const menuExisting = document.querySelector('.controlsButtons');

    if (!menuExisting) {
        const menuDiv = document.createElement('div');
        menuDiv.className = 'controlsButtons';
        document.body.addEventListener('click', function (e) {
            if (e.target.classList.contains('btnControls')) {
                const menuDiv = document.querySelector('.controlsButtons');
                if (menuDiv) closeAnimatedMenu(menuDiv);
            }
        });
        menuDiv.appendChild(sectionBtn);
        document.body.appendChild(menuDiv);
        if (menuToggle) menuToggle.textContent = '✖';

        setTimeout(() => {
            document.addEventListener('click', e => {
                if (!menuDiv.contains(e.target) && !e.target.matches('#menuToggleBtn')) {
                    closeAnimatedMenu(menuDiv);
                }
            });
        }, 0);
    } else {
        closeAnimatedMenu(menuExisting);
    }
}

function closeAnimatedMenu(menuDiv) {
    const menuToggle = document.getElementById('menuToggleBtn');
    menuDiv.style.animation = 'slideOut 0.4s forwards';
    setTimeout(() => {
        menuDiv.remove();
    }, 400); // Espera a que termine la animación
    menuToggle.textContent = '☰';
}
// Ejecutar al cargar y al redimensionar
window.addEventListener('load', addMenuToggle);
window.addEventListener('resize', addMenuToggle);


//carga de archivo y creacion de nueva base de datos
// Al hacer clic en el botón, activar el input
btnUploadFile.addEventListener('click', () => {
    btnUploadInput.click();
});

// Manejar archivo seleccionado
btnUploadInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!Array.isArray(data)) {
                throw new Error("El archivo JSON debe contener un array de transacciones.");
            }

            // Eliminar base de datos si existe
            const deleteRequest = indexedDB.deleteDatabase('FinanzasDB');
            deleteRequest.onsuccess = () => {
                console.log('Base de datos eliminada correctamente.');
                createDbWithData(data);
            };
            deleteRequest.onerror = () => {
                console.error('Error al eliminar la base de datos.');
            };
        } catch (err) {
            console.error('Error al procesar el archivo JSON:', err);
        }
    };
    reader.readAsText(file);
});

// Crear nueva base de datos y cargar datos
function createDbWithData(transacciones) {
    const request = indexedDB.open('FinanzasDB', 1);

    request.onupgradeneeded = function (event) {
        const db = event.target.result;
        const store = db.createObjectStore('transacciones', { autoIncrement: true });
        store.createIndex('porTipo', 'type', { unique: false });
        store.createIndex('porFecha', 'date', { unique: false });
    };

    request.onsuccess = function (event) {
        const db = event.target.result;
        const tx = db.transaction('transacciones', 'readwrite');
        const store = tx.objectStore('transacciones');

        transacciones.forEach(item => {
            store.add(item);
        });

        tx.oncomplete = () => alert('Datos cargados correctamente.');
    };

    request.onerror = function (event) {
        console.error('Error al abrir IndexedDB', event);
    };
}

