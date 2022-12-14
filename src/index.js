import { todoItem } from "./js/todo-item";
import { project } from "./js/project";
import './css/index.css';
import { format, formatDistanceToNow, isPast, parseJSON } from 'date-fns';
import { formatDTString } from "./js/toISOString";

//handles all of the CRUD for the todo list tasks and projects
const listManager = (() => {

    let projects = [];

    const getProjects = () => {

        let savedProjects = JSON.parse(localStorage.getItem('projects')).map((p) => {
            let projObj = Object.assign(new project(), p);

            projObj.todoItems = projObj.todoItems.map((tdi) => {
                let tdiObj = Object.assign(new todoItem(), tdi);
                tdiObj.dueDate = parseJSON(tdi.dueDate);
                return tdiObj;
            })

            return projObj;
        });

        return savedProjects;
    }

    const saveProjects = () => {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    const createDefaultProject = () => {
        //lets create an example project
        let defaultProject = createProject(
            'Fun Stuff',
            'This is an example project! Feel free to delete or edit me'
        );
        //add a couple example tasks to the project
        let today = new Date();
        today.setHours(today.getHours() + 1);
        defaultProject.addItem(
            createTodoItem(
                'Take Bobo for a walk',
                'Bobo likes long walks by the lake',
                new Date('2022-03-25'),
                2,
                true
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
        saveProjects();
        return defaultProject;
    };

    const createProject = (title, desc) => {

        let newProject = project();

        newProject.title = title;
        newProject.desc = desc;

        projects.push(newProject);

        saveProjects();

        return (newProject);
    }

    //accepts the index of a project and removes it from the array
    const deleteProject = (index) => {
        projects.splice(index, 1);
        saveProjects();
    }

    const editProject = (project, title, desc) => {
        project.title = title;
        project.desc = desc;
        saveProjects();

    }

    const addItem = (project, title, desc, duedate, priority) => {
        project.addItem(listManager.createTodoItem(title, desc, duedate, priority));
        saveProjects();
    }

    //accepts the index of an item and a project and removes the item from the array
    const deleteItem = (projectIndex, itemIndex) => {
        projects[projectIndex].todoItems.splice(itemIndex, 1);
        saveProjects();

    }

    const editItem = (tdi, title, desc, dueDate, priority) => {
        tdi.title = title;
        tdi.desc = desc;
        tdi.dueDate = dueDate;
        tdi.priority = priority;
        saveProjects();

    }

    const toggleCompleted = (tdi) => {
        tdi.completed = !tdi.completed;
        saveProjects();

    }

    //accepts all required/optional info and returns a todoItem object
    const createTodoItem = (title, desc, dueDate, priority, completed) => {
        let newTask = todoItem();

        newTask.title = title;
        newTask.desc = desc;
        newTask.dueDate = dueDate;
        newTask.priority = priority;
        newTask.completed = completed;

        return (newTask);
    }

    const priorityToString = (p) => {
        p = Number(p);
        switch (p) {
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

    if (!localStorage.getItem('projects')) {
        createDefaultProject();
    } else {
        projects = getProjects();
    }

    return {
        createDefaultProject,
        createTodoItem,
        createProject,
        deleteProject,
        priorityToString,
        deleteItem,
        toggleCompleted,
        editProject,
        addItem,
        editItem,
        get projects() { return projects },
    }

})();

//handles all of the reading from and displaying to the DOM
const domManager = (() => {

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
        p.todoItems.forEach((tdi, i) => {
            //create a div for the task
            const task = document.createElement('div');
            task.classList.add('task');
            task.addEventListener('click', e => {
                onClickExpandTask(e, tdi);
            })

            const checkbox = document.createElement('input');
            checkbox.setAttribute('type', 'checkbox');
            tdi.completed ? checkbox.checked = true : checkbox.checked = false;
            checkbox.onclick = (e => {
                e.stopPropagation();
                listManager.toggleCompleted(tdi);
                onClickCheckItem(tdi, task);
            })
            task.appendChild(checkbox);

            //add our content. title and duedate.
            const title = document.createElement('p');
            title.innerText = tdi.title;
            task.appendChild(title);

            const dueDate = document.createElement('p');
            dueDate.innerText = `${isPast(tdi.dueDate) ? formatDistanceToNow(tdi.dueDate) + ' ago' : 'in ' + formatDistanceToNow(tdi.dueDate)}`;
            task.appendChild(dueDate);

            //render appropriate checked styles
            onClickCheckItem(tdi, task);

            //append the task to the task list
            task.setAttribute('data-project-index', projectIndex);
            task.setAttribute('data-item-index', i);
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

    //renders a simple view of all tasks
    const onClickRenderAllTasks = () => {
        const main = document.querySelector('main');
        //clear any leftover content
        main.innerHTML = '';

        //set the correct styles to the navbar.
        //reset any current active class.
        const current = document.querySelectorAll('.active');
        current.forEach(li => {
            li.classList.remove('active')
        })
        //put the active class on the current project
        const newActive = document.getElementById('all-tasks');
        newActive.classList.add('active');

        //header
        const header = document.createElement('div');
        header.setAttribute('id', 'page-header');

        const headerTitle = document.createElement('h1');
        headerTitle.innerText = 'All Tasks'
        header.appendChild(headerTitle);

        main.appendChild(header);

        //create our task list <div>
        const project = document.createElement('div');
        project.setAttribute('id', 'task-list');

        //get all projects and put all the items in one array
        const allTasks = [];
        listManager.projects.forEach((project) => {
            project.todoItems.forEach((task) => {
                allTasks.push(task);
            });
        });

        allTasks.forEach((tdi, i) => {
            //create a div for the task
            const task = document.createElement('div');
            task.classList.add('task');

            const checkbox = document.createElement('input');
            checkbox.setAttribute('type', 'checkbox');
            tdi.completed ? checkbox.checked = true : checkbox.checked = false;
            checkbox.onclick = (e => {
                e.stopPropagation();
                tdi.completed = !tdi.completed;
                onClickCheckItem(tdi, task);
            })
            task.appendChild(checkbox);

            //add our content. title and duedate.
            const title = document.createElement('p');
            title.innerText = tdi.title;
            task.appendChild(title);

            const dueDate = document.createElement('p');
            dueDate.innerText = `${isPast(tdi.dueDate) ? formatDistanceToNow(tdi.dueDate) + ' ago' : 'in ' + formatDistanceToNow(tdi.dueDate)}`;
            task.appendChild(dueDate);

            //render appropriate checked styles
            onClickCheckItem(tdi, task);

            //append the task to the task list
            // task.setAttribute('data-project-index', projectIndex);
            task.setAttribute('data-item-index', i);
            project.appendChild(task);
        });

        main.appendChild(project);
    }

    //accepts the event and a to do item object. renders the appropriate content for the xpanded view
    const onClickExpandTask = (e, tdi) => { //holy $#!* it took forever to get this guy to work properly f*** html input elements
        //check if item is expanded.
        //if expanded, collapse, if not, expand.
        const target = e.currentTarget;

        if (target.getAttribute('expanded')) {
            const expandedContent = target.querySelector('.expanded');
            if (expandedContent) { expandedContent.remove() } //fixes an issue that should never happen
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
            const priorityNum = Number(tdi.priority);
            switch (priorityNum) {
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
            edit.onclick = (e => onClickEditItem(e, tdi));
            //add a delete button
            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Delete';
            deleteButton.onclick = (e => onClickDeleteItem(e));
            editButtonContainer.appendChild(deleteButton);

            container.appendChild(editButtonContainer);

            target.appendChild(container);
        }
    }

    //accepts the tdi. renders the appropriate styles for a tdi depedning on whether its checked off
    const onClickCheckItem = (tdi, task) => {
        tdi.completed ? task.classList.add('completed') : task.classList.remove('completed');
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
            noButton.onclick = e => (e.path[2].remove())
            confirmationForm.appendChild(noButton);

            confirmation.appendChild(confirmationForm);
            body.appendChild(confirmation);
        });
        form.appendChild(deleteButton);

        //do stuff to update the project
        form.onsubmit = (e) => {
            e.preventDefault();
            //update the project
            listManager.editProject(project, titleInput.value, descInput.value);
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
            listManager.addItem(project, titleInput.value, descInput.value, dueDateInput.value, priorityInput.value);
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

    //render the menu for editing a to do item
    const onClickEditItem = (e, tdi) => {
        //find our projects index
        const projectIndex = e.target.parentElement.parentElement.parentElement.dataset.projectIndex;

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
        titleInput.value = tdi.title;
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
        descInput.value = tdi.desc;
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
        dueDateInput.value = formatDTString(tdi.dueDate);

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
        priorityInput.appendChild(priorityRegular);
        const priorityHigh = document.createElement('option');
        priorityHigh.setAttribute('value', '3');
        priorityHigh.innerText = 'High';
        priorityInput.appendChild(priorityHigh);


        switch (Number(tdi.priority)) {
            case 1:
                priorityLow.setAttribute('selected', 'selected');
                break;
            case 2:
                priorityRegular.setAttribute('selected', 'selected');
                break;
            case 3:
                priorityHigh.setAttribute('selected', 'selected');
                break;
            default:
                priorityRegular.setAttribute('selected', 'selected');
                break;

        }

        form.appendChild(priorityInput);
        //add submit button
        const submit = document.createElement('button');
        submit.setAttribute('type', 'submit');
        submit.innerText = 'Save Changes';
        form.appendChild(submit);

        //do stuff to update our values
        form.onsubmit = (e) => {
            e.preventDefault();
            //save our changes.
            listManager.editItem(tdi, titleInput.value, descInput.value, dueDateInput.value, priorityInput.value);
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

    //delete an item
    const onClickDeleteItem = (e) => {
        //find our project and item index
        const projectIndex = e.target.parentElement.parentElement.parentElement.dataset.projectIndex;
        const itemIndex = e.target.parentElement.parentElement.parentElement.dataset.itemIndex;
        //delete our item
        listManager.deleteItem(projectIndex, itemIndex);
        //render our project again
        renderProject(listManager.projects[projectIndex]);
    }

    return {
        renderProject,
        renderProjectList,
        onClickAddProject,
        onClickAddItem,
        onClickRenderAllTasks
    }
})();

//make domManager accessible from the dom because i want to use the onclick attribute instead of event listeners for some buttons
window.domManager = domManager;

//temp rendering the default project
domManager.renderProjectList(listManager.projects);
domManager.renderProject(listManager.projects[0]);