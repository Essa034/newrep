
const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const tinycsrf = require("tiny-csrf");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser("C$JxqKA!DexWci^%RVno$Kx*J@9MYpi9"));

app.use(
  tinycsrf("oiwdcdvjvoirejfryoeoreureoiitsfr", ["POST", "PUT", "DELETE"])
);

app.get("/", async (request, response) => {
  if (request.accepts("html")) {
    const [dueLater, dueToday, overdue, completed] = await Promise.all([
      Todo.dueLater(),
      Todo.dueToday(),
      Todo.overdue(),
      Todo.completed(),
    ]);
    response.render("index", {
      dueLater,
      dueToday,
      overdue,
      completed,
      csrfToken: request.csrfToken(),
    });
  } else {
    const todos = await Todo.getTodos();
    response.json(todos);
  }
});

app.get("/todos", async function (_, response) {
  const todos = await Todo.findAll();
  response.send(todos);
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (todo) {
      return response.json(todo);
    }
    return response.status(404).send();
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  try {
    await Todo.addTodo(request.body);
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).send();
  }
});

app.put("/todos/:id/", async function (request, response) {
  try {
    const affectedCount = await Todo.setCompletionStatus(
      request.params.id,
      request.body.completed
    );
    return response.json(affectedCount === 1);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  const deletedResultsCount = await Todo.destroy({
    where: { id: request.params.id },
  });
  response.send(deletedResultsCount === 1);
});

module.exports = app;/*const express = require('express')
const { Todo } = require('./models');

const { sequelize } = require('./models');
var csrf=require("tiny-csrf");
var cookieParser=require("cookie-parser");
const { format, isBefore, isToday } = require("date-fns"); // <-- Add isToday here

const path = require("path")
const app = express()
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser("shh some secret thing"));
app.use(csrf("this_should_be_32_characters_lon",["POST","PUT","DELETE"]));
app.set("view engine","ejs");
function isSameDate(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }
app.get("/",async (request,response)=>{
    const allTodos = await Todo.findAll();
    const currentDate=new Date();
    const overdue = allTodos.filter(todo => {
        const dueDate = new Date(todo.dueDate);
        return isBefore(dueDate, currentDate) && !isSameDate(dueDate, currentDate);
      });
          const dueToday = allTodos.filter(todo => 
        isSameDate(new Date(todo.dueDate), new Date())
      );    const dueLater = allTodos.filter(todo => !isBefore(new Date(todo.dueDate), currentDate) && !isToday(new Date(todo.dueDate)));
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
        allTodos,
        csrfToken: request.csrfToken(),
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
        response.redirect("/");
    } catch (error) {
        return response.status(422).json(error);
    }

})

app.put('/todos/:id/setCompletionStatus', async (req, res) => {
    const csrfToken = req.get('CSRF-Token');
    
    // Validate CSRF token
    if (csrfToken !== req.csrfToken()) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }
  
    try {
      const todo = await Todo.findByPk(req.params.id);
      if (!todo) {
        return res.status(404).json({ message: 'Todo not found' });
      }
  
      // Assuming 'completed' is the field you want to update
      todo.completed = req.body.completed;
      await todo.save();
  
      return res.json(todo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to update todo' });
    }
  });
  
app.delete("/todos/:id", async (request, response) => {
    console.log("delete a todo by ID: ", request.params.id)
    try{
        await Todo.remove(request.params.id);
        return response.json({success: true});

    }catch(error){
        return response.status(422).json(error);
    }
})

    


module.exports = app;*/