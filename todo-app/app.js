
const express = require('express')
const { Todo } = require('./models');
const { sequelize } = require('./models');


const path = require("path")
const app = express()
app.use(express.json());
app.set("view engine","ejs");
app.get("/",async (request,response)=>{
    const allTodos= await Todo.gettodos();
    if(request.accepts('html')){
        response.render('index',{
        allTodos
    });}
    else{
        response.json({
            allTodos
        })
    }
});
app.use(express.static(path.join(__dirname,'public')));
app.get("/todoss", async (request, response) => {
    console.log("todo list",request.body);
    /*try{
        const tod=await Todo.findAll();
        return response.json(tod);
    }catch(error){
        return response.json(error);
    }*/
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
app.delete("/todos/:id", async (request, response) => {
    console.log("delete a todo by ID: ", request.params.id)
    try{
        const tod=await Todo.destroy({
            where:{
                id:request.params.id,
            }
        });
        if(tod ===1){
        return response.json(true);}
        else{
            return response.json(false);
        }
    }catch(error){
        response.json(error)
    }
})
module.exports = app;