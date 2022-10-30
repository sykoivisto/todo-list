const project = () => {
    let title = ''; //string - title of project
    let desc= ''; //string - description of project
    let todoItems = []; //array of todoItems

    //accepts a todoItem
    const addItem = (todoItem) => {
        todoItems.push(todoItem);
    };

    //accepts the index of a todoItem in todoItems[].
    const removeItem = (index) => {
        todoItems.splice(index, 1);
    };

    return {
        addItem,
        removeItem,

        get title () { return title },
        set title ( s ) { title = s }, //add char limit

        get desc () { return desc },
        set desc ( s ) { desc = s }, //add char limit

        get todoItems () { return todoItems },
    }
}
export {
    project
}