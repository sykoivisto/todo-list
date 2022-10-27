const todoItem = () => {
    let title = ''; //string - title of item
    let desc= ''; //string - description of item
    let dueDate = ''; //time? - items due date
    let priority = 2; //number 1-3 low regular high
    let notes = ''; //string - notes about item
    let completed = false; //true or false is item complete?

    return {
        get title () { return title },
        set title ( s ) { title = s }, //add char limit

        get desc () { return desc },
        set desc ( s ) { desc = s }, //add char limit

        get dueDate () { return dueDate },
        set dueDate ( date ) { dueDate = date }, //check for format

        get priority () { return priority },
        set priority ( num ) { priority = num }, //check for num 1-3

        get notes () { return notes},
        set notes ( s ) { notes = s }, //add char limit

        get completed () { return completed },
        set completed ( b ) { completed = b } //check for bool
    }
}

export {
    todoItem
}