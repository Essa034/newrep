
const express = require('express')
const { Todo } = require('./models');
const { sequelize } = require('./models');

const { format, isBefore, isToday } = require("date-fns"); // <-- Add isToday here

const path = require("path")
const app = express()
app.use(express.json());
app.set("view engine","ejs");
app.get("/",async (request,response)=>{
    const allTodos = await Todo.findAll();
    const currentDate=new Date();
    const overdue = allTodos.filter(todo => isBefore(new Date(todo.dueDate), currentDate));
    const dueToday = allTodos.filter(todo => isToday(new Date(todo.dueDate)));
    const dueLater = allTodos.filter(todo => !isBefore(new Date(todo.dueDate), currentDate) && !isToday(new Date(todo.dueDate)));
    const overdueCount = overdue.length;
    const dueTodayCount = dueToday.length;
    const dueLaterCount = dueLater.length;
    
    
    if(request.accepts('html')){
        response.render('index',{
            overdue: overdue,
            overdueCount: overdueCount,
            dueToday: dueToday,
            dueTodayCount: dueTodayCount,
            dueLater: dueLater,
            dueLaterCount: dueLaterCount,    
        allTodos
    });}
    else{
        response.json({
            overdue: overdue,
            overdueCount: overdueCount,
            dueToday: dueToday,
            dueTodayCount: dueTodayCount,
            dueLater: dueLater,
            dueLaterCount: dueLaterCount,
            allTodos
        })
    }
});
app.use(express.static(path.join(__dirname,'public')));
app.get("/todos", async (request, response) => {
   
    try{
        const tod=await Todo.findAll();
        return response.json(tod);
    }catch(error){
        return response.json(error);
    }
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