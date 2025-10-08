// Sección principal
const sectionContainer = document.querySelector('.container');

// Contenedor de tabla
const containerTable = document.createElement('div');
containerTable.className = 'containerTable';

const titleTable = document.createElement('h3');
titleTable.className = 'titleTable';
titleTable.textContent = 'Tabla de Registros';
containerTable.appendChild(titleTable);

// Tabla
const table = document.createElement('table');
table.className = 'viewTable';

// Encabezado
const thead = document.createElement('thead');
thead.className = 'headerTable';
const headerRow = document.createElement('tr');
['Fecha', 'Descripción', 'Monto'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
});
thead.appendChild(headerRow);
table.appendChild(thead);

// Cuerpo
const tbody = document.createElement('tbody');
tbody.id = 'cellTable';
tbody.className = 'bodyTable';
table.appendChild(tbody);

// Pie de tabla
const tfoot = document.createElement('tfoot');
tfoot.className = 'footTable';
const footRow = document.createElement('tr');

const tdLabel = document.createElement('td');
tdLabel.colSpan = 2;
tdLabel.innerHTML = '<strong>Total :</strong>';

const tdTotal = document.createElement('td');
tdTotal.id = 'total';
tdTotal.textContent = '$0';

footRow.append(tdLabel, tdTotal);
tfoot.appendChild(footRow);
table.appendChild(tfoot);

containerTable.appendChild(table);
sectionContainer.appendChild(containerTable);

document.body.appendChild(sectionContainer);

// Sección modal
const modalSection = document.createElement('section');
modalSection.className = 'modal';

const modalContainer = document.createElement('div');
modalContainer.className = 'modalContainer';

const titleModal = document.createElement('h3');
titleModal.className = 'titleModal';
titleModal.textContent = 'Nuevo Registro';
modalContainer.appendChild(titleModal);

// Formulario
const form = document.createElement('form');
form.id = 'registerForm';
form.className = 'formModal';

const fields = [
    { label: 'Fecha:', type: 'date', id: 'date', name: 'date' },
    { label: 'Descripción:', type: 'text', id: 'description', name: 'description' },
    { label: 'Monto:', type: 'number', id: 'amount', name: 'amount', step: '0.01' }
];

fields.forEach(({ label, type, id, name, step }) => {
    const lbl = document.createElement('label');
    lbl.setAttribute('for', id);
    lbl.textContent = label;

    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.name = name;
    input.required = true;
    if (step) input.step = step;

    form.append(lbl, input);
});

// Select tipo
const labelTipo = document.createElement('label');
labelTipo.setAttribute('for', 'type');
labelTipo.textContent = 'Tipo:';

const select = document.createElement('select');
select.id = 'type';
select.name = 'type';
select.required = true;

const options = [
    {value:"", text: "", disabled: true , selected: true},
    { value: 'income', text: 'Ingreso' },
    { value: 'expense', text: 'Gasto' }
];

options.forEach(({ value, text }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    select.appendChild(option);
});

form.append(labelTipo, select);

// Botones del modal
const modalButtons = document.createElement('div');
modalButtons.className = 'modalButtons';

const addBtn = document.createElement('button');
addBtn.id = 'addRegister';
addBtn.className = 'btn';
addBtn.textContent = 'Agregar';

const cancelBtn = document.createElement('div');
cancelBtn.id = 'cancelBtn';
cancelBtn.className = 'btn';
cancelBtn.textContent = 'Cancelar';

modalButtons.append(addBtn, cancelBtn);
form.appendChild(modalButtons);

modalContainer.appendChild(form);
modalSection.appendChild(modalContainer);
document.body.appendChild(modalSection);
