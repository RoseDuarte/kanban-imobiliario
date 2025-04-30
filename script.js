const columns = document.querySelectorAll('.column');
let isTouchDevice = 'ontouchstart' in window;

function enableDragAndDrop() {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const parentId = card.parentElement.id;

        if (!isTouchDevice && parentId !== 'done') {
            card.setAttribute('draggable', true);

            card.addEventListener('dragstart', () => {
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                saveToLocalStorage();
            });
        } else {
            card.removeAttribute('draggable');
        }
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();

            const dragging = document.querySelector('.dragging');
            if(!dragging) return;

            const fromColumnId = dragging?.parentElement?.id;
            const toColumn = column.id;

            if(fromColumnId === 'done' && toColumn !== 'done') return;

            if(fromColumnId === toColumn) return;

            const taskText = dragging.querySelector('span')?.textContent;
            dragging.remove();

            createdCard(taskText, toColumn);
            saveToLocalStorage();
        });
    });
}

enableDragAndDrop();

const addTaskBtn = document.getElementById('add-task-btn');
addTaskBtn.addEventListener('click', () => {
    const taskText = document.getElementById('new-task').value;
    const selectedColumnId = document.getElementById('column-select').value;

    if (taskText.trim() === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Campo vazio',
            text: 'Digite uma tarefa antes de adicionar.',
            confirmButtonColor: '#273E68'
        });
        return;
    }

    createdCard(taskText, selectedColumnId);
    document.getElementById('new-task').value = "";
    document.getElementById('new-task').focus(); // ✅ foca de volta no campo
    saveToLocalStorage();
});

function createdCard(text, columnId) {
    const newCard = document.createElement('div');
    newCard.className = 'card';

    if (!isTouchDevice && columnId !== 'done') {
        newCard.draggable = true;
    }

    const contentContainer = document.createElement('div');
    contentContainer.style.display = 'flex';
    contentContainer.style.justifyContent = 'space-between';
    contentContainer.style.alignItems = 'center';
    contentContainer.style.width = '100%';

    const cardText = document.createElement('span');
    cardText.textContent = text;
    contentContainer.appendChild(cardText);

    if (columnId === 'to-do' || columnId === 'in-progress') {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.transform = 'scale(1.2)';
        checkbox.style.cursor = 'pointer';
        checkbox.title = 'Concluir tarefa';

        checkbox.addEventListener('click', () => {
            newCard.remove();
            createdCard(text, 'done');
            saveToLocalStorage();
        });

        contentContainer.appendChild(checkbox);
    }

    if (columnId === 'done') {
        const deleteBtn = createDeleteButton(newCard);
        contentContainer.appendChild(deleteBtn);
    }

    newCard.appendChild(contentContainer);
    document.getElementById(columnId).appendChild(newCard);
    enableDragAndDrop();
}

function createDeleteButton(cardElement) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';

    const deleteIcon = document.createElement('img');
    deleteIcon.src = 'assets/trash-solid.svg';
    deleteIcon.alt = 'Deletar';
    deleteIcon.className = 'delete-icon';

    deleteBtn.appendChild(deleteIcon);

    deleteBtn.addEventListener('mousedown', (e) => e.stopPropagation());
    deleteBtn.addEventListener('touchstart', (e) => e.stopPropagation());

    deleteBtn.onclick = function () {
        Swal.fire({
            title: 'Tem certeza?',
            text: 'Essa tarefa será excluída.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                cardElement.remove();
                saveToLocalStorage();
            }
        });
    };

    return deleteBtn;
}

function saveToLocalStorage() {
    const data = {
        "to-do": [],
        "in-progress": [],
        "done": []
    };

    columns.forEach(column => {
        const columnId = column.id;
        const cards = column.querySelectorAll('.card span');
        cards.forEach(card => {
            data[columnId].push(card.textContent);
        });
    });

    localStorage.setItem('kanbanData', JSON.stringify(data));
}

function loadFromLocalStorage() {
    const savedData = JSON.parse(localStorage.getItem('kanbanData'));

    if (savedData) {
        Object.keys(savedData).forEach(columnId => {
            savedData[columnId].forEach(taskText => {
                createdCard(taskText, columnId);
            });
        });
    }
}

loadFromLocalStorage();

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'Deseja sair do sistema?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, sair',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('loggedIn');
                window.location.href = 'login.html';
            }
        });
    });
}
