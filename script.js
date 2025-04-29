const columns = document.querySelectorAll('.column');
let isTouchDevice = 'ontouchstart' in window; // Detecta se o dispositivo suporta toque

function enableDragAndDrop() {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        
        if (!isTouchDevice) {
            card.addEventListener('dragstart', () => {
                card.classList.add('dragging');
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                saveToLocalStorage();
            });
        } else {
            
            card.addEventListener('touchstart', (e) => {
                card.classList.add('dragging');
                card.style.position = 'absolute'; 
                document.body.appendChild(card);
                card.style.zIndex = 1000; 
            });

            card.addEventListener('touchend', () => {
                card.classList.remove('dragging');
                card.style.position = ''; 
                card.style.zIndex = ''; 
                columns.forEach(column => {
                    column.appendChild(card); 
                });
                saveToLocalStorage();
            });

            card.addEventListener('touchmove', (e) => {
                const touch = e.touches[0];
                card.style.left = touch.pageX - card.offsetWidth / 2 + 'px'; 
                card.style.top = touch.pageY - card.offsetHeight / 2 + 'px'; 
            });
        }
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();

            const dragging = document.querySelector('.dragging');
            if(dragging) {
                column.appendChild(dragging);
            };
        });
    });
};

enableDragAndDrop();

const addTaskBtn = document.getElementById('add-task-btn');
addTaskBtn.addEventListener('click', () => {
    const taskText = document.getElementById('new-task').value;
    const selectedColumnId = document.getElementById('column-select').value;

    if(taskText.trim() === "") {
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
    saveToLocalStorage();
});

function createdCard(text, columnId) {
    const newCard = document.createElement('div');
    newCard.className = 'card';
    newCard.draggable = true;

    const cardtext = document.createElement('span');
    cardtext.textContent = text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';

    const deleteIcon = document.createElement('img');
    deleteIcon.src = 'assets/trash-solid.svg';
    deleteIcon.alt = 'Deletar';
    deleteIcon.className = 'delete-icon';

    deleteBtn.appendChild(deleteIcon);

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
            newCard.remove();
            saveToLocalStorage();
          }
        });
      };

      deleteBtn.addEventListener('touchstart', (e) => e.stopPropagation());
      deleteBtn.addEventListener('mousedown', (e) => e.stopPropagation());

    newCard.appendChild(cardtext);
    newCard.appendChild(deleteBtn);

    document.getElementById(columnId).appendChild(newCard);

    enableDragAndDrop();
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

    if(savedData) {
        Object.keys(savedData).forEach(columnId => {
            savedData[columnId].forEach(taskText => {
                createdCard(taskText, columnId)
            })
        })
    }
}

loadFromLocalStorage();
enableDragAndDrop();

const logoutBtn = document.getElementById('logout-btn');

if(logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'Deseja sair do sistema?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, sair',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33'
          }).then((result) => {
            if(result.isConfirmed) {
                localStorage.removeItem('loggedIn');
                window.location.href = 'login.html';
            }
          });  
    });
}