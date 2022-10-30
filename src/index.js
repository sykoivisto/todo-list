import { todoItem } from "./js/todo-item";
import { project } from "./js/project";
import './css/index.css';

//handles all of the CRUD for the todo list tasks and projects
const listManager = (() => {
    let projects = [];

    //********************/
    //********************/
    //MAJOR TO DO:********/
    //Check for existing projects. If projects don't exist, lets create some filler content.
    //********************/
    //********************/


    const createDefaultProject = () => {
        //lets create an example project
        let defaultProject = createProject(
            'Fun Stuff',
            'This is an example project! Feel free to delete or edit me'
        );
        //add a couple example tasks to the project
        defaultProject.addItem(
            createTodoItem(
                'Take Bobo for a walk',
                'Bobo likes long walks by the lake',
                '5:00pm',
                2
            )
        );
        defaultProject.addItem(
            createTodoItem(
                'Take Froyo for a walk',
                'Froyo loves to chase the other dogs',
                '6:00pm',
                /*********************
                **add a date stoage***
                **solution eventually*
                **********************
                *********************/
                2
            )
        );

        projects.push(defaultProject);
    };

    const createProject = (title, desc) => {
        let newProject = project();

        newProject.title = title;
        newProject.desc = desc;

        return (newProject);
    }


    //accepts all required/optional info and returns a todoItem object
    const createTodoItem = (title, desc, dueDate, priority) => {
        let newTask = todoItem();

        newTask.title = title;
        newTask.desc = desc;
        newTask.dueDate = dueDate;
        newTask.priority = priority;

        return (newTask);
    }

    return {
        createDefaultProject,
        createTodoItem,
        createProject,
        get projects () { return projects },
    }

})();

//handles all of the reading from and displaying to the DOM
const domManager = (() => {

    //accepts a project object and renders the appropriate content to the page
    const renderProject = (p) => {
        //the title of the project
        const projectName = document.getElementById('project-name');
        //the description of the project
        const projectDesc = document.getElementById('project-desc');

        //update the title and description
        projectName.innerText = p.title;
        projectDesc.innerText = p.desc;

        //our content is going to go in <main>
        const main = document.querySelector('main');

        //find our task list <div>
        const project = document.getElementById('task-list');

        //loop through our array of tasks and render each task
        p.todoItems.forEach(tdi => {
            //create a div for the task
            const task = document.createElement('div');
            task.classList.add('task');

            //add the checkbox
            const checkbox = document.createElement('div');
            checkbox.classList.add('checkbox');
            task.appendChild(checkbox);

            //add our content. title and duedate.
            const title = document.createElement('p');
            title.innerText = tdi.title;
            task.appendChild(title);

            const dueDate = document.createElement('p');
            dueDate.innerText = tdi.dueDate;
            task.appendChild(dueDate);

            //append the task to the task list
            project.appendChild(task);
        })

        //set the correct styles to the navbar.
        //reset any current active class.
        const current = document.querySelectorAll('.active');
        current.forEach(li => {
            li.classList.remove('active')
        })
        //put the active class on the current project
        const newActive = document.querySelector(`[data-title='${p.title}']`);
        newActive.classList.add('active');
    }

    //accepts an array of projects. renders the appropriate content to the dom.
    const renderProjectList = (pl) => {
        //get the ul
        const ul = document.getElementById('projects-nav');
        
        //loop thru the array and do the thing
        pl.forEach(p => {
            //make a new list item for the project
            const li = document.createElement('li');
            li.innerText = p.title;
            li.setAttribute('data-title', p.title);
            ul.appendChild(li);
        });
    }

    return {
        renderProject,
        renderProjectList,
    }
})();


//temp rendering the default project
listManager.createDefaultProject();
domManager.renderProjectList(listManager.projects);
domManager.renderProject(listManager.projects[0]);