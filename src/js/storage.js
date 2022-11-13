export const storage = () => {
    const saveTodoList = (data) => {
        localStorage.setItem('todoList', JSON.stringify(data));
    }

    const getTodoList = () => {
        return JSON.parse(localStorage.getItem('projects'));
    }

    return {
        saveTodoList,
        getTodoList,

    }
}