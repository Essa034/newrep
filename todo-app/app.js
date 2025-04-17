
const express = require('express')
const { Todo } = require('./models');
const app = express()
app.use(express.json());
app.get("/todos", (request, response) => {
    response.send("Todo list")
})
app.post("/todos", async (request, response) => {
    console.log("creating a todo", request.body)
    try {
        const todo = await Todo.addTodo({ title: request.body.title, dueDate: request.body.dueDate, completed: request.body.completed })
        response.json(todo);
    } catch (error) {
        return response.status(422).json(error);
    }

})

app.put("/todos/:id/markAsCompleted", async (request, response) => {
    console.log("we have to update a todo with ID:", request.params.id)
    const todo = await Todo.findByPk(request.params.id)
    try {
        const updatedtodo = await todo.markAsCompleted()
        return response.json(updatedtodo)
    }
    catch (error) {
        return response.status(422).json(error);

    }
})
app.delete("/todos/:id", (request, response) => {
    console.log("delete a todo by ID: ", request.params.id)
})
module.exports = app;