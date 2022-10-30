import { todoItem } from "./js/todo-item";
import { project } from "./js/project";
import './css/index.css';

let projects = [];

//check for existing projects? if none, create default?
//temp- manually create default project
const createDefaultProject = () => {
    let defaultProject = project();
    defaultProject.title = 'Default Project';
    defaultProject.desc = 'This is the default project';

    defaultProject.addItem(
        createTodoItem(
            'First To-Do Item!',
            'This is the description',
            'no due date',
            'low priority'
        )
    );

    projects.push(defaultProject);
};

const createTodoItem = (title, desc, dueDate, priority) => { //returns a todoItem object
    let newTask = todoItem();

    newTask.title = title;
    newTask.desc = desc;
    newTask.dueDate = dueDate;
    newTask.priority = priority;

    return (newTask);
}

const renderProject = (p) => { //accepts a project object. returns a <div> containing the projects info.
    let project = document.createElement('div');
    
    let title = document.createElement('p');
    let desc = document.createElement('p');
 
    title.innerText = p.title;
    desc.innerText = p.desc;

    project.appendChild(title);
    project.appendChild(desc);

    p.todoItems.forEach(tdi => {
        project.appendChild(renderTodoItem(tdi));
    })
    
    return (project);
}

const renderTodoItem = (tdi) => { //accepts a todoItem object. returns a <div> contianing the items info.
    let todoItem = document.createElement('div');

    let title = document.createElement('p');
    let desc = document.createElement('p');
    let dueDate = document.createElement('p');
    let priority = document.createElement('p');
    let completed = document.createElement('p');
    
    title.innerText = tdi.title;
    desc.innerText = tdi.desc;
    dueDate.innerText = tdi.dueDate;
    priority.innerText = tdi.priority;
    completed.innerText = tdi.completed;
    
    todoItem.appendChild(title);
    todoItem.appendChild(desc);
    todoItem.appendChild(dueDate);
    todoItem.appendChild(priority);
    todoItem.appendChild(completed);
    
    return (todoItem);
}

//temp rendering the default project
createDefaultProject();
const domProjects = document.querySelector('.projects');
domProjects.appendChild(renderProject(projects[0]));

const createItem = () => { //gets info from the create item form in the dom. returns a todoItem
    const title = document.getElementById('title').value;
    const desc = document.getElementById('desc').value;
    const dueDate = document.getElementById('dueDate').value;
    const priority = document.getElementById('priority').value;

    return (
        createTodoItem(title, desc, dueDate, priority)
    );
}






let newTaskButton = document.getElementById('newTask');
newTaskButton.onclick = () => {
    // open form
}