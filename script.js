console.log("Olá, mundo! Seu script está funcionando.");
// A lógica da To-Do List virá aqui

const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');

addTaskButton.addEventListener('click', () => {
    const taskText = taskInput.value.trim(); // .trim() remove espaços em branco extras
    if (taskText !== '') { // Verifica se o input não está vazio
        const listItem = document.createElement('li');
        listItem.textContent = taskText;
        taskList.appendChild(listItem);
        taskInput.value = ''; // Limpa o input após adicionar
    }
});