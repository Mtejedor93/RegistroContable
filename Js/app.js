// Modal
const ModalNewRegister = document.getElementById("ModalNewRegister");
const Modal = document.querySelector(".modal")
const CloseModal = document.getElementById("cancelBtn");
ModalNewRegister.addEventListener("click", () => {
    Modal.classList.add("modalShow")
});
CloseModal.addEventListener("click", () => {
    Modal.classList.remove("modalShow")
    Form.reset();
});
Modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("modalShow")) {
        Modal.classList.remove("modalShow")
        Form.reset();
    }
});
// Registro
const Form = document.getElementById("registerForm");
const register = {
    type: "",
    description: "",
    amount: 0,
    date: ""
}
// Crear registro
const registers = [];
const addRegister = document.getElementById("addRegister");
addRegister.addEventListener("click", (e) => {
    e.preventDefault();

    register.type = document.getElementById("type").value;
    register.description = document.getElementById("description").value;
    register.amount = document.getElementById("amount").value;
    register.date = document.getElementById("date").value;
    if (register.type !== "" && register.description !== "" && register.amount !== "" && register.date !== "") {
        registers.push({ ...register });
        console.log(registers);
        createDb();
        loadTransactions();
        Form.reset();
        Modal.classList.remove("modalShow");
    } else {
        alert("Por favor, complete todos los campos.");
        return
    }
});
//crear base de datos desde cero
function createDb() {
    // Abrir (o crear) la base de datos
    const request = indexedDB.open('FinanzasDB', 1);

    // Crear estructura si es nueva
    request.onupgradeneeded = function (event) {
        const db = event.target.result;

        // Crear almacén de transacciones con clave automática
        const store = db.createObjectStore('transacciones', { autoIncrement: true });

        // Crear índices para búsquedas
        store.createIndex('porTipo', 'type', { unique: false });
        store.createIndex('porFecha', 'date', { unique: false });
    };

    // Éxito al abrir
    request.onsuccess = function (event) {
        const db = event.target.result;

        // Crear una transacción para escribir
        const tx = db.transaction('transacciones', 'readwrite');
        const store = tx.objectStore('transacciones');
        const nuevaTransaccion = { ...register };
        // Guardar en la base de datos
        store.add(nuevaTransaccion);

        tx.oncomplete = () => console.log('Transacción guardada');
    };

    // Error al abrir
    request.onerror = function (event) {
        console.error('Error al abrir IndexedDB', event);
    };
}


//show registers
// Crear botóns y tabla
const showTableBtn = document.getElementById('whatTable');

showTableBtn.addEventListener('click', () => {
    // Verificar si el modal ya existe
    if (!document.getElementById('modalSelector')) {
        // Crear fondo oscuro
        const overlay = document.createElement('div');
        overlay.className = 'modalOverlay';

        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'modalSelector';
        modal.id = 'modalSelector';

        const titulo = document.createElement('h3');
        titulo.textContent = 'Selecciona una opción:';
        modal.appendChild(titulo);

        const opciones = [
            { value: 'income', text: 'Ingresos' },
            { value: 'expense', text: 'Gastos' }
        ];

        opciones.forEach(({ value, text }) => {
            const btn = document.createElement('button');
            btn.textContent = text;
            btn.className = 'modalBtn';
            btn.onclick = () => {
                //loadTransactions({ target: { value } });

                loadTransactions(value); // más directo

                overlay.classList.remove('show');
                setTimeout(() => document.body.removeChild(overlay), 300);
            };
            modal.appendChild(btn);
        });

        // Cerrar al hacer clic fuera del modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('show');
                setTimeout(() => document.body.removeChild(overlay), 300);
            }
        });

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Activar animación
        requestAnimationFrame(() => overlay.classList.add('show'));
    }
});


let currentPage = 0;
const rowsPerPage = 12;

function loadTransactions(type) {
    const request = indexedDB.open('FinanzasDB', 1);

    request.onsuccess = function (event) {
        const db = event.target.result;
        const tx = db.transaction('transacciones', 'readonly');
        const store = tx.objectStore('transacciones');

        const getAll = store.getAll();

        getAll.onsuccess = function () {
            const datos = getAll.result;

            // Filtrar por tipo
            const filteredData = type === 'all' ? datos : datos.filter(item => item.type === type);

            // Ordenar del último al primero
            const reversedData = filteredData.reverse();

            // Calcular paginación
            const totalPages = Math.ceil(reversedData.length / rowsPerPage);
            const startIndex = currentPage * rowsPerPage;
            const endIndex = startIndex + rowsPerPage;
            const pageData = reversedData.slice(startIndex, endIndex);

            // Actualizar título
            titleTable.textContent = 'Registros de ' + (type === 'income' ? 'ingresos' : type === 'expense' ? 'gastos' : 'todos');

            // Mostrar registros
            const showRegister = document.getElementById("cellTable");
            showRegister.innerHTML = "";

            pageData.forEach(item => {
                const row = document.createElement('tr');

                const tdDate = document.createElement('td');
                tdDate.textContent = item.date;

                const tdDescription = document.createElement('td');
                tdDescription.textContent = item.description;

                const tdAmount = document.createElement('td');
                tdAmount.textContent = `$${item.amount.toLocaleString()}`;

                row.appendChild(tdDate);
                row.appendChild(tdDescription);
                row.appendChild(tdAmount);
                showRegister.appendChild(row);
            });
            // Mostrar total
            viewTotal(pageData);

            // Crear botones de navegación
            const pagination = document.getElementById("paginationControls") || document.createElement('div');
            pagination.id = "paginationControls";
            pagination.innerHTML = "";
            pagination.style.marginTop = "10px";

            if (currentPage > 0) {
                const prevBtn = document.createElement('button');
                prevBtn.textContent = 'Prev';
                prevBtn.className = 'btn';
                prevBtn.onclick = () => {
                    currentPage--;
                    loadTransactions(type);
                };
                pagination.appendChild(prevBtn);
            }

            if (currentPage < totalPages - 1) {
                const nextBtn = document.createElement('button');
                nextBtn.textContent = 'Next';
                nextBtn.className = 'btn';
                nextBtn.style.marginLeft = "10px";
                nextBtn.onclick = () => {
                    currentPage++;
                    loadTransactions(type);
                };
                pagination.appendChild(nextBtn);
            }

            // Agregar controles al DOM
           table.parentElement.appendChild(pagination);
        };
    };

    request.onerror = function (event) {
        console.error('Error al abrir la base de datos', event);
    };
}
/*
function loadTransactions(type) {
    const request = indexedDB.open('FinanzasDB', 1);

    request.onsuccess = function (event) {
        const db = event.target.result;
        const tx = db.transaction('transacciones', 'readonly');
        const store = tx.objectStore('transacciones');

        const getAll = store.getAll();

        getAll.onsuccess = function () {
            const datos = getAll.result;

            // Actualizar título de la tabla
            titleTable.textContent = 'Registros de ' + (type === 'income' ? 'ingresos' : 'gastos');

            // Filtrar datos por tipo
            const filteredData = datos.filter(item => item.type === type);

            const showRegister = document.getElementById("cellTable");
            showRegister.innerHTML = ""; // Limpiar tabla

            // Mostrar registros filtrados
            filteredData.forEach(item => {
                const row = document.createElement('tr');

                const tdDate = document.createElement('td');
                tdDate.textContent = item.date;

                const tdDescription = document.createElement('td');
                tdDescription.textContent = item.description;

                const tdAmount = document.createElement('td');
                tdAmount.textContent = `$${item.amount.toLocaleString()}`;

                row.appendChild(tdDate);
                row.appendChild(tdDescription);
                row.appendChild(tdAmount);
                showRegister.appendChild(row);
            });

            // Mostrar total
            viewTotal(filteredData);
        };
    };

    request.onerror = function (event) {
        console.error('Error al abrir la base de datos', event);
    };
}*/
/*
function loadTransactions(tag) {
    const request = indexedDB.open('FinanzasDB', 1);

    request.onsuccess = function (event) {
        const db = event.target.result;
        const tx = db.transaction('transacciones', 'readonly');
        const store = tx.objectStore('transacciones');

        const getAll = store.getAll();

        getAll.onsuccess = function () {
            const datos = getAll.result;

            // Obtener el valor del filtro
            const filtro = tag;
            titleTable.textContent = 'Registros de' +
                (filtro.target.value ? ` ${filtro.target.value === 'income' ? 'ingresos' : 'gastos'}` : '');
            // Aplicar filtro si no es "Todos"
            const filteredData = datos.filter(item => item.type === filtro.target.value);

            const showRegister = document.getElementById("cellTable");
            showRegister.innerHTML = ""; // Limpiar tabla

            filteredData.forEach(item => {
                const row = document.createElement('tr');
                const tdDate = document.createElement('td');
                tdDate.textContent = item.date;
                const tdDescription = document.createElement('td');
                tdDescription.textContent = item.description;
                const tdAmount = document.createElement('td');
                tdAmount.textContent = `$${item.amount.toLocaleString()}`;
                row.appendChild(tdDate);
                row.appendChild(tdDescription);
                row.appendChild(tdAmount);
                showRegister.appendChild(row);
            });
            viewTotal(filteredData)
        };
    };
    request.onerror = function (event) {
        console.error('Error al abrir la base de datos', event);
    };
}
*/
//Total table
function viewTotal(filteredData) {
    const total = filteredData.reduce((acum, item) => {
        return acum + Number(item.amount); // Asegura que amount sea numérico
    }, 0);
    // Eliminar resumen anterior si existe
    const resumenExistente = document.getElementById('resumenTotal');
    if (resumenExistente) resumenExistente.remove();
    // Crear y mostrar resumen
    tdTotal.textContent = `$${total.toLocaleString()}`;
}

//descarga DataBase
const DownloadDatabaseBtn = document.getElementById("DownloadDatabase");
DownloadDatabaseBtn.addEventListener("click", exportData);
function exportData() {
    const request = indexedDB.open('FinanzasDB', 1);

    request.onsuccess = function (event) {
        const db = event.target.result;
        const tx = db.transaction('transacciones', 'readonly');
        const store = tx.objectStore('transacciones');

        const all = store.getAll();

        all.onsuccess = function () {
            const data = all.result;
            const fecha = new Date();
            //console.log(fecha.toLocaleDateString()); // Ejemplo: "7/10/2025"
            downloadAsJSON(data, 'dataBase_' + `${fecha.toLocaleDateString()}` + '.json');

        };
    };

    request.onerror = function (event) {
        console.error('Error al abrir la base de datos', event);
    };
}

//convertir a JSON y descargar
function downloadAsJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = filename;
    enlace.click();

    URL.revokeObjectURL(url); // Limpieza
}

