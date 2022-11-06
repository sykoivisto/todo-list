import { todoItem } from "./js/todo-item";
import { project } from "./js/project";
import './css/index.css';
import { format, formatDistanceToNow, parseISO, isPast, parse } from 'date-fns';

//handles all of the CRUD for the todo list tasks and projects
const listManager = (() => {
    let projects = [];

    //********************/
    //********************/
    //MAJOR TO DO:
    //
    //Check for existing projects. If projects don't exist, lets create some filler content.
    //
    //Make items interactive.
    //  Click on an item's title to cross it off
    //  Make the edit button work
    //
    //Make All tasks page
    //
    //Add persistence with localstorage
    //  should be simple enough- each time an item in listManager.projects[] is updated, update the local copy? Check for copy on load.
    //********************/
    //********************/


    const createDefaultProject = () => {
        //lets create an example project
        let defaultProject = createProject(
            'Fun Stuff',
            'This is an example project! Feel free to delete or edit me'
        );
        //add a couple example tasks to the project
        let today = new Date();
        today.setHours(today.getHours()+1);
        defaultProject.addItem(
            createTodoItem(
                'Take Bobo for a walk',
                'Bobo likes long walks by the lake',
                new Date('2022-03-25'),
                2
            )
        );
        defaultProject.addItem(
            createTodoItem(
                'Take Froyo for a walk',
                'Froyo loves to chase the other dogs',
                today,
                2
            )
        );
        return defaultProject;
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
        newTask.dueDate = formatDate(dueDate);
        newTask.priority = priority;

        return (newTask);
    }

    const priorityToString = (p) => {
        p = Number (p);
        switch(p) {
            case 1:
                return 'Low';
            case 2:
                return 'Regular';
            case 3:
                return 'High';
            default:
                return regular;
        }
    }

    const formatDate = (date) => {
        if (date instanceof Date) {
            return date;
        } else {
            return parseISO(date);
        }
    }

    return {
        createDefaultProject,
        createTodoItem,
        createProject,
        deleteProject,
        priorityToString,
        formatDate,
        get projects() { return projects },
    }

})();

//handles all of the reading from and displaying to the DOM
const domManager = (() => {

    //accepts a project object and renders the appropriate content to the page
    const renderProject = (p) => {
        //index of the project
        const projectIndex = listManager.projects.indexOf(p);

        const main = document.querySelector('main');
        //clear any leftover content
        main.innerHTML = '';

        //header
        const header = document.createElement('div');
        header.setAttribute('id', 'page-header');

        const headerContainer = document.createElement('div');

        const headerTitle = document.createElement('h1');
        headerTitle.innerText = p.title;
        headerContainer.appendChild(headerTitle);

        const projectDesc = document.createElement('h3');
        projectDesc.innerText = p.desc;
        headerContainer.appendChild(projectDesc);

        header.appendChild(headerContainer);

        //edit button
        const editButton = document.createElement('p');
        editButton.setAttribute('id', 'project-edit');
        editButton.innerText = 'Edit';
        header.appendChild(editButton);

        main.appendChild(header);

        //create our task list <div>
        const project = document.createElement('div');
        project.setAttribute('id', 'task-list');

        //loop through our array of tasks and render each task
        p.todoItems.forEach(tdi => {
            //create a div for the task
            const task = document.createElement('div');
            task.classList.add('task');
            task.addEventListener('click', e => {
                onClickExpandTask(e, tdi);
            })

            //add our content. title and duedate.
            const title = document.createElement('p');
            title.innerText = tdi.title;
            task.appendChild(title);

            const dueDate = document.createElement('p');
            dueDate.innerText = `${isPast(tdi.dueDate) ? formatDistanceToNow(tdi.dueDate) + ' ago': 'in ' + formatDistanceToNow(tdi.dueDate)}`;
            task.appendChild(dueDate);

            //append the task to the task list
            project.appendChild(task);
        })

        //append project to the dom
        main.appendChild(project);

        //add item button
        const addItem = document.createElement('button');
        addItem.setAttribute('id', 'add-task');
        addItem.innerText = '+ Add Item';
        addItem.setAttribute('data-project-index', projectIndex);
        addItem.onclick = e => { onClickAddItem(e) };
        main.appendChild(addItem);

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
        editButton.setAttribute('data-project-index', projectIndex);
        editButton.addEventListener('click', onClickEditProject);
    }

    //accepts the event and a to do item object. renders the appropriate content for the xpanded view
    const onClickExpandTask = (e, tdi) => { //holy $#!* it took forever to get this guy to work properly f*** html input elements
        //check if item is expanded.
        //if expanded, collapse, if not, expand.
        const target = e.currentTarget;

        if (target.getAttribute('expanded')) {
            const expandedContent = target.querySelector('.expanded');
            if (expandedContent) {expandedContent.remove()} //fixes an issue that should never happen
            //remove the expanded attribute.
            target.removeAttribute('expanded');
        } else {
            //give our target the expanded attribute so if it's clicked again we can see it is, in fact, expanded.
            target.setAttribute('expanded', 'expanded');
            //keep the original content, but add a new div below
            const container = document.createElement('div');
            container.classList.add('expanded');
            
            //container for the content - keeping the edit button separate
            const contentContainer = document.createElement('div');
            contentContainer.classList.add('expanded-content');
            //render the description
            const desc = document.createElement('p');
            desc.innerText = tdi.desc;
            contentContainer.appendChild(desc);
            //render the full date
            const fullDate = document.createElement('p');
            fullDate.innerText = format(tdi.dueDate, 'PPP, p');
            //color red if overdue
            isPast(tdi.dueDate) ? fullDate.classList.add('red') : null;
            contentContainer.appendChild(fullDate);
            //render the priority
            const priority = document.createElement('span');
            priority.innerText = listManager.priorityToString(tdi.priority);
            //color code the priority
            switch (tdi.priority) {
                case 1:
                    priority.classList.add('blue');
                    break;
                case 2:
                    priority.classList.add('green');
                    break;
                case 3:
                    priority.classList.add('red');
                    break;
                default:
                    priority.classList.add('green');
                    break;
            }
    
            const priorityText = document.createElement('p');
            priorityText.innerText = 'Priority: ';
            priorityText.appendChild(priority);
    
            contentContainer.appendChild(priorityText);
    
            container.appendChild(contentContainer);
    
            //render an edit button
            const editButtonContainer = document.createElement('div');
            editButtonContainer.classList.add('expanded-edit-button-container');

            const edit = document.createElement('button');
            edit.innerText = 'Edit';
            editButtonContainer.appendChild(edit);

            container.appendChild(editButtonContainer);
    
            target.appendChild(container);
        }
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
            renderProject(listManager.projects[listManager.projects.length - 1])
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
        const projectIndex = e.target.dataset.projectIndex;
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

                //this checks if we have a project and navigates to the first project.
                //if there is no project it makes one.
                //this whole thing can basically be removed if this is changed to navigate to the all projects page instead,
                //but as of writing this, that page doesn't exist. probably will do that when we get there.
                if (listManager.projects[0]) {
                    //refresh our project list
                    renderProjectList(listManager.projects);
                    //navigate to the first project in the list.
                    //maybe later change this to the all projects page?
                    renderProject(listManager.projects[0]);
                } else {
                    listManager.createDefaultProject();
                    renderProjectList
                    renderProject(listManager.projects[0]);
                }

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

    //render the menu for adding a project
    const onClickAddItem = (e) => {
        //find our project and its index
        const projectIndex = e.target.dataset.projectIndex;
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
        titleLabel.htmlFor = 'iTitle';
        titleLabel.innerText = 'Title';
        form.appendChild(titleLabel);
        //title input
        const titleInput = document.createElement('input');
        titleInput.setAttribute('type', 'text');
        titleInput.setAttribute('name', 'iTitle');
        titleInput.setAttribute('id', 'iTitle');
        titleInput.required = true;
        form.appendChild(titleInput);
        //desc label
        const descLabel = document.createElement('label');
        descLabel.htmlFor = 'iDesc';
        descLabel.innerText = 'Description';
        form.appendChild(descLabel);
        //desc input
        const descInput = document.createElement('input');
        descInput.setAttribute('type', 'text');
        descInput.setAttribute('name', 'iDesc');
        descInput.setAttribute('id', 'iDesc');
        descInput.required = true;
        form.appendChild(descInput);
        //duedate label
        const dueDateLabel = document.createElement('label');
        dueDateLabel.htmlFor = 'dueDate';
        dueDateLabel.innerText = 'Due Date';
        form.appendChild(dueDateLabel);
        //duedate input
        const dueDateInput = document.createElement('input');
        dueDateInput.setAttribute('type', 'datetime-local');
        dueDateInput.setAttribute('name', 'dueDate');
        dueDateInput.setAttribute('id', 'dueDate');
        dueDateInput.required = true;
        form.appendChild(dueDateInput);
        //priority label
        const priorityLabel = document.createElement('label');
        priorityLabel.htmlFor = 'priority';
        priorityLabel.innerText = 'Priority';
        form.appendChild(priorityLabel);
        //priority input
        const priorityInput = document.createElement('select');
        priorityInput.setAttribute('name', 'priority');
        priorityInput.setAttribute('id', 'priority');
        priorityInput.required = true;
        //select options
        const priorityLow = document.createElement('option');
        priorityLow.setAttribute('value', '1');
        priorityLow.innerText = 'Low';
        priorityInput.appendChild(priorityLow);
        const priorityRegular = document.createElement('option');
        priorityRegular.setAttribute('value', '2');
        priorityRegular.innerText = 'Regular';
        priorityRegular.setAttribute('selected', 'selected');
        priorityInput.appendChild(priorityRegular);
        const priorityHigh = document.createElement('option');
        priorityHigh.setAttribute('value', '3');
        priorityHigh.innerText = 'High';
        priorityInput.appendChild(priorityHigh);
        form.appendChild(priorityInput);
        //add submit button
        const submit = document.createElement('button');
        submit.setAttribute('type', 'submit');
        submit.innerText = 'Create Task';
        form.appendChild(submit);


        //do stuff to create our new project
        form.onsubmit = (e) => {
            e.preventDefault();
            //create our new task and add it to the project
            project.addItem(listManager.createTodoItem(titleInput.value, descInput.value, dueDateInput.value, priorityInput.value));
            //render our project again
            renderProject(listManager.projects[projectIndex]);
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
        onClickAddProject,
        onClickAddItem
    }
})();

//make domManager accessible from the dom because i want to use the onclick attribute instead of event listeners for some buttons
window.domManager = domManager;

//temp rendering the default project
listManager.createDefaultProject();
domManager.renderProjectList(listManager.projects);
domManager.renderProject(listManager.projects[0]);