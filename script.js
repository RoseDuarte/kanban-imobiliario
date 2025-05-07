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

            const taskText = dragging.querySelector('span')?.textContent || "";

            const dateSpan = dragging.querySelector('.meta-info small:nth-child(1)');
            const timeSpan = dragging.querySelector('.meta-info small:nth-child(2)');

            let dateText = "";
            let timeText = "";

            if(dateSpan) {
                dateText = dateSpan.getAttribute('data-date') || '';
            }

            if(timeSpan && timeSpan.textContent.includes('⏰')) {
                timeText = timeSpan.textContent.replace('⏰ ', '');
            }
        
            dragging.remove();
            createdCard(taskText, toColumn, dateText, timeText);
            saveToLocalStorage();
        });
    });
}

enableDragAndDrop();
loadFromLocalStorage();

const addTaskBtn = document.getElementById('add-task-btn');
addTaskBtn.addEventListener('click', () => {
    const taskText = document.getElementById('new-task').value;
    const taskDate = document.getElementById('taskDate').value;
    const taskTime = document.getElementById('taskTime').value;
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

    createdCard(taskText, selectedColumnId, taskDate, taskTime);

    document.getElementById('new-task').value = "";
    document.getElementById('taskDate').value = "";
    document.getElementById('taskTime').value = "";
    document.getElementById('new-task').focus(); 
    
    saveToLocalStorage();
});

function createdCard(text, columnId, date = '', time = '') {
    const newCard = document.createElement('div');
    newCard.className = 'card';

    if (!isTouchDevice && columnId !== 'done') {
        newCard.draggable = true;
    }

    const contentContainer = document.createElement('div');
    contentContainer.className = 'content-container';

    const leftContent = document.createElement('div');
    leftContent.className = 'left-content';

    const cardText = document.createElement('span');
    cardText.className = 'card-text';
    cardText.textContent = text;
    leftContent.appendChild(cardText);

    const metaInfo = document.createElement('div');
    metaInfo.className = 'meta-info';

    if(date) {
        const [year, month, day] = date.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        const dateSpan = document.createElement('small');
        dateSpan.textContent = `🗓️ ${formattedDate}`;
        dateSpan.setAttribute('data-date', date);
        metaInfo.appendChild(dateSpan);
    }

    if(time) {
        const timeSpan = document.createElement('small');
        timeSpan.textContent = `⏰ ${time}`;
        timeSpan.setAttribute('data-time', time);
        metaInfo.appendChild(timeSpan);
    }

    leftContent.appendChild(metaInfo);
    contentContainer.appendChild(leftContent);

    const rightContent = document.createElement('div');
    rightContent.className = 'right-content';

    if (columnId === 'to-do' || columnId === 'in-progress') {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.title = 'Concluir tarefa';
        checkbox.className = 'task-checkbox';

        checkbox.addEventListener('click', () => {
            const rawDate = newCard.querySelector('.meta-info small:nth-child(1)')?.getAttribute('data-date') || "";
            const rawTime = newCard.querySelector('.meta-info small:nth-child(2)')?.textContent?.replace('⏰ ', '') || "";

            newCard.remove();
            createdCard(text, 'done', rawDate, rawTime);
            saveToLocalStorage();
        });

        rightContent.appendChild(checkbox);
    }

    if (columnId === 'done') {
        const deleteBtn = createDeleteButton(newCard);
        rightContent.appendChild(deleteBtn);
    }

    contentContainer.appendChild(rightContent);
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
    const taskData = {};

    columns.forEach(column => {
        const columnId = column.id;
        const cards = column.querySelectorAll('.card');
        taskData[columnId] = [];

        cards.forEach(card => {
            const text = card.querySelector('.card-text')?.textContent || '';
            const date = card.querySelector('small[data-date]')?.getAttribute('data-date') || '';
            const time = card.querySelector('small[data-time]')?.getAttribute('data-time') || '';

            taskData[columnId].push({ text, date, time });
        });
    });

    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(taskData));
    }
}

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
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });
    });
}

function loadFromLocalStorage() {
    const currentUser = localStorage.getItem('currentUser');
    if(!currentUser) return;

    const data = JSON.parse(localStorage.getItem(`tasks_${currentUser}`));
    if(!data) return;

    document.querySelectorAll('.column').forEach(column => {
        const title = column.querySelector('h2');
        column.innerHTML = '';
        column.appendChild(title);
    });

    for(let columnId in data) {
        data[columnId].forEach(task => {
            createdCard(task.text, columnId, task.date, task.time)
        })
    }
}