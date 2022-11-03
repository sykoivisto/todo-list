import { todoItem } from "./js/todo-item";
import { project } from "./js/project";
import './css/index.css';

// 
// 
// 
// To do:
// put page refreshing logic in its own function
// 
// 
// 
// 
// 
// 
// 
// 

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
    };

    const createProject = (title, desc) => {
        let newProject = project();

        newProject.title = title;
        newProject.desc = desc;

        projects.push(newProject);

        return (newProject);
    }

    const deleteProject = (index) => {
        projects.splice(index, 1);
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
        deleteProject,
        get projects () { return projects },
    }

})();

//handles all of the reading from and displaying to the DOM
const domManager = (() => {

    //accepts a project object and renders the appropriate content to the page
    const renderProject = (p) => {
        //index of the project
        const projectIndex = listManager.projects.indexOf(p);
        //the title of the project
        const projectName = document.getElementById('project-name');
        //the description of the project
        const projectDesc = document.getElementById('project-desc');

        //update the title and description
        projectName.innerText = p.title;
        projectDesc.innerText = p.desc;

        //find our task list <div>
        const project = document.getElementById('task-list');
        //clear any leftover content
        project.innerHTML = '';

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
        const newActive = document.querySelector(`[data-index='${projectIndex}']`);
        newActive.classList.add('active');

        //make our edit button work
        const editButton = document.getElementById('project-edit');
        editButton.setAttribute('data-project-index', projectIndex);
        editButton.addEventListener('click', onClickEditProject);
    }

    //accepts an array of projects. renders the appropriate content to the dom.
    const renderProjectList = (pl) => {
        //get the ul
        const ul = document.getElementById('projects-nav');
        //erase the old content
        ul.innerHTML = ('')
        
        //loop thru the array and do the thing
        pl.forEach((p, i) => {
            //make a new list item for the project
            const li = document.createElement('li');
            li.innerText = p.title;
            li.setAttribute('data-index', i);
            //add our click listener for navigation
            li.addEventListener('click', () => {
                renderProject(p);
            })
            ul.appendChild(li);
        });
    }

    //render the menu for creating a new project
    const onClickAddProject = () => {
        //create our menu
        const menu = document.createElement('div');
        menu.classList.add('popup-menu');

        //create our form
        const form = document.createElement('form');

        //add a close button
        const close = document.createElement('p');
        close.classList.add('close-popup');
        close.innerText = 'close';
        close.addEventListener('click', () => {
            document.querySelector('.popup-menu').remove();
        })
        form.appendChild(close);

        //create our inputs and labels
        //title label
        const titleLabel = document.createElement('label');
        titleLabel.htmlFor = 'pTitle';
        titleLabel.innerText = 'Title';
        form.appendChild(titleLabel);
        //title input
        const titleInput = document.createElement('input');
        titleInput.setAttribute('type', 'text');
        titleInput.setAttribute('name', 'pTitle');
        titleInput.setAttribute('id', 'pTitle');
        titleInput.required = true;
        form.appendChild(titleInput);
        //desc label
        const descLabel = document.createElement('label');
        descLabel.htmlFor = 'pDesc';
        descLabel.innerText = 'Description';
        form.appendChild(descLabel);
        //desc input
        const descInput = document.createElement('input');
        descInput.setAttribute('type', 'text');
        descInput.setAttribute('name', 'pDesc');
        descInput.setAttribute('id', 'pDesc');
        descInput.required = true;
        form.appendChild(descInput);

        //add submit button
        const submit = document.createElement('button');
        submit.setAttribute('type', 'submit');
        submit.innerText = 'Create Project';
        form.appendChild(submit);


        //do stuff to create our new project
        form.onsubmit = (e) => {
            e.preventDefault();
            //create our new project
            listManager.createProject(titleInput.value, descInput.value)
            //refresh our project list
            renderProjectList(listManager.projects);
            //navigate to our new project
            renderProject(listManager.projects[listManager.projects.length-1])
            //destory our menu
            document.querySelector('.popup-menu').remove();
        }
        
        //append our <form> to the menu <div>
        menu.appendChild(form);

        const body = document.querySelector('body');
        body.appendChild(menu);
    }

    //render the menu for editing a project
    const onClickEditProject = (e) => {
        const projectIndex = e.srcElement.dataset.projectIndex;
        const project = listManager.projects[projectIndex];

        //create our menu
        const menu = document.createElement('div');
        menu.classList.add('popup-menu');

        //create our form
        const form = document.createElement('form');

        //add a close button
        const close = document.createElement('p');
        close.classList.add('close-popup');
        close.innerText = 'close';
        close.addEventListener('click', () => {
            document.querySelector('.popup-menu').remove();
        })
        form.appendChild(close);

        //create our inputs and labels
        //title label
        const titleLabel = document.createElement('label');
        titleLabel.htmlFor = 'pTitle';
        titleLabel.innerText = 'Title';
        form.appendChild(titleLabel);
        //title input
        const titleInput = document.createElement('input');
        titleInput.setAttribute('type', 'text');
        titleInput.setAttribute('name', 'pTitle');
        titleInput.setAttribute('id', 'pTitle');
        titleInput.value = project.title;
        titleInput.required = true;
        form.appendChild(titleInput);
        //desc label
        const descLabel = document.createElement('label');
        descLabel.htmlFor = 'pDesc';
        descLabel.innerText = 'Description';
        form.appendChild(descLabel);
        //desc input
        const descInput = document.createElement('input');
        descInput.setAttribute('type', 'text');
        descInput.setAttribute('name', 'pDesc');
        descInput.setAttribute('id', 'pDesc');
        descInput.value = project.desc;
        descInput.required = true;
        form.appendChild(descInput);

        //add submit button
        const submit = document.createElement('button');
        submit.setAttribute('type', 'submit');
        submit.innerText = 'Update Project';
        form.appendChild(submit);

        //add a delete button
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete Project';
        deleteButton.setAttribute('type', 'button')
        deleteButton.setAttribute('id', 'delete-button');
        deleteButton.onclick = (e => {
            //create a confirmation menu
            const confirmation = document.createElement('div');
            confirmation.classList.add('popup-menu');

            const confirmationForm = document.createElement('form');

            const text = document.createElement('p');
            text.innerText = 'Are you sure you want to delete this?'
            confirmationForm.appendChild(text);

            //make a yes button
            const yesButton = document.createElement('button');
            yesButton.innerText = 'Delete Project';
            yesButton.setAttribute('type', 'button');
            yesButton.onclick = (e => {
                //delete the project
                listManager.deleteProject(projectIndex);
                //refresh our project list
                renderProjectList(listManager.projects);
                //navigate to a project
                //
                //
                //
                //Major to do^^^
                //
                //
                //
                //
                //
                //renderProject(listManager.projects[listManager.projects.length-1])
                //destory our menus
                document.querySelectorAll('.popup-menu').forEach(x => {
                    x.remove();
                })
            });
            confirmationForm.appendChild(yesButton);

            //make the no button
            const noButton = document.createElement('button');
            noButton.setAttribute('type', 'button');
            noButton.innerText = 'Cancel';
            //have the no button just remove the confirmation from the dom
            noButton.onclick = e => console.log(e.path[2].remove())
            confirmationForm.appendChild(noButton);

            confirmation.appendChild(confirmationForm);
            body.appendChild(confirmation);
        });
        form.appendChild(deleteButton);

        //do stuff to update the project
        form.onsubmit = (e) => {
            e.preventDefault();
            //update the project
            project.title = titleInput.value;
            project.desc = descInput.value;
            //refresh our project list
            renderProjectList(listManager.projects);
            //refresh our page
            renderProject(project);
            //destory our menu
            document.querySelector('.popup-menu').remove();
        }
        
        //append our <form> to the menu <div>
        menu.appendChild(form);

        const body = document.querySelector('body');
        body.appendChild(menu);

    }

    return {
        renderProject,
        renderProjectList,
        onClickAddProject
    }
})();

//make domManager accessible from the dom because i want to use the onclick attribute instead of event listeners for some buttons
window.domManager = domManager;

//temp rendering the default project
listManager.createDefaultProject();
domManager.renderProjectList(listManager.projects);
domManager.renderProject(listManager.projects[0]);