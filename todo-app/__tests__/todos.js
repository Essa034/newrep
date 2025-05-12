const supertest = require("supertest");
const cheerio = require("cheerio");

const db = require("../models/index");
const { Todo } = require("../models");
const app = require("../app");

let _csrf, csrfCookie;

const today = () => new Date().toISOString().split("T")[0];

const randInt = (low, high) => {
  return Math.floor(Math.random() * (high - low)) + low;
};

const randomPastDate = () => {
  return new Date(new Date().setDate(new Date().getDate() - randInt(0, 200)))
    .toISOString()
    .split("T")[0];
};

const randomFutureDate = () => {
  return new Date(new Date().setDate(new Date().getDate() + randInt(1, 200)))
    .toISOString()
    .split("T")[0];
};

const makeTodo = async ({ title, dueDate = null, completed = false }) => {
  return await Todo.addTodo({
    title: title,
    dueDate: dueDate || today(),
    completed,
  });
};

const client = supertest(app);

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    const homeResp = await client.get("/");
    const homepage = cheerio.load(homeResp.text);
    csrfCookie = homeResp.headers["set-cookie"][0];
    _csrf = homepage("input[name=_csrf]").attr("value");
  });

  beforeEach(async () => {
    // delete all tables
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      await db.sequelize.close();
    } catch (error) {
      console.log(error);
    }
  });

  it("Should list overdue Todos", async () => {
    const [todo1, todo2, todo3, todo4] = await Promise.all([
      makeTodo({ title: "Buy Milk", dueDate: randomPastDate() }),
      makeTodo({ title: "Wash Clothes", dueDate: randomFutureDate() }),
      makeTodo({ title: "Pay bill" }),
      makeTodo({
        title: "Clean House",
        dueDate: randomPastDate(),
        completed: true,
      }),
    ]);
    const homepage = cheerio.load((await client.get("/")).text);
    const overdueTodosList = homepage("#overdueTodos").text();
    const overdueCount = homepage("#count-overdue").text();
    expect(overdueCount).toBe("1");
    expect(overdueTodosList).toContain(todo1.title);
    expect(overdueTodosList).not.toContain(todo2.title);
    expect(overdueTodosList).not.toContain(todo3.title);
    expect(overdueTodosList).not.toContain(todo4.title);
  });

  it("Should list Todos due today", async () => {
    const [todo1, todo2, todo3, todo4] = await Promise.all([
      makeTodo({ title: "Buy Milk" }),
      makeTodo({ title: "Buy House", dueDate: randomFutureDate() }),
      makeTodo({ title: "Wash Clothes", dueDate: randomPastDate() }),
      makeTodo({ title: "Sleep", completed: true }),
    ]);
    const homepage = cheerio.load((await client.get("/")).text);
    const dueTodayTodoList = homepage("#dueTodayTodos").text();
    const dueTodayCount = homepage("#count-due-today").text();
    expect(dueTodayCount).toBe("1");
    expect(dueTodayTodoList).toContain(todo1.title);
    expect(dueTodayTodoList).not.toContain(todo2.title);
    expect(dueTodayTodoList).not.toContain(todo3.title);
    expect(dueTodayTodoList).not.toContain(todo4.title);
  });

  it("Should list Todos due later", async () => {
    const [todo1, todo2, todo3, todo4] = await Promise.all([
      makeTodo({ title: "Wash Clothes", dueDate: randomFutureDate() }),
      makeTodo({ title: "Buy Clothes" }),
      makeTodo({ title: "Pay Bills", dueDate: randomPastDate() }),
      makeTodo({
        title: "Repair car",
        dueDate: randomFutureDate(),
        completed: true,
      }),
    ]);
    const homepage = cheerio.load((await client.get("/")).text);
    const dueLaterTodoList = homepage("#dueLaterTodos").text();
    const dueLaterCount = homepage("#count-due-later").text();
    expect(dueLaterCount).toBe("1");
    expect(dueLaterTodoList).toContain(todo1.title);
    expect(dueLaterTodoList).not.toContain(todo2.title);
    expect(dueLaterTodoList).not.toContain(todo3.title);
    expect(dueLaterTodoList).not.toContain(todo4.title);
  });

  it("Should list completed Todos", async () => {
    const [todo1, todo2, todo3, todo4] = await Promise.all([
      makeTodo({
        title: "Sleep",
        dueDate: randomFutureDate(),
        completed: true,
      }),
      makeTodo({ title: "Buy Clothes" }),
      makeTodo({ title: "Wake Up", dueDate: randomPastDate() }),
      makeTodo({ title: "Code", dueDate: randomFutureDate() }),
    ]);
    const homepage = cheerio.load((await client.get("/")).text);
    const completedTodoList = homepage("#completedTodos").text();
    const completedCount = homepage("#count-completed").text();
    expect(completedCount).toBe("1");
    expect(completedTodoList).toContain(todo1.title);
    expect(completedTodoList).not.toContain(todo2.title);
    expect(completedTodoList).not.toContain(todo3.title);
    expect(completedTodoList).not.toContain(todo4.title);
  });

  it("Should return all todos in json format", async () => {
    const todoList = await Promise.all([
      makeTodo({
        title: "Turn on the light",
        dueDate: randomFutureDate(),
        completed: true,
      }),
      makeTodo({ title: "Buy Clothes" }),
      makeTodo({ title: "Play piano", dueDate: randomPastDate() }),
      makeTodo({ title: "Goto gym", dueDate: randomFutureDate() }),
    ]);
    const response = await client.get("/todos");
    expect(response.status).toBe(200);

    expect(response.body.length).toBe(4);

    todoList.map((todoInstance) => {
      const todoObject = response.body.find(
        (item) => item.id === todoInstance.id
      );
      expect(todoInstance.title).toBe(todoObject.title);
      expect(todoInstance.dueDate).toBe(todoObject.dueDate);
      expect(todoInstance.completed).toBe(todoObject.completed);
    });
  });

  it("Should return a todo by id", async () => {
    const todoInstance = await makeTodo({ title: "Buy Clothes" });

    const response = await client.get(`/todos/${todoInstance.id}`);

    expect(response.status).toBe(200);

    expect(response.body.id).toBe(todoInstance.id);
    expect(response.body.title).toBe(todoInstance.title);
    expect(response.body.dueDate).toBe(todoInstance.dueDate);
  });

  it("Should not create a new todo using POST request without csrf token", async () => {
    const payload = {
      title: "Watch Movie",
      dueDate: randomFutureDate(),
    };
    const response = await client.post("/todos").send(payload);
    expect(response.status).toBe(500);
  });

  it("Should create a new todo using POST request", async () => {
    const payload = {
      title: "Goto Park",
      dueDate: randomPastDate(),
      _csrf,
    };
    const response = await client
      .post("/todos")
      .set("Cookie", csrfCookie)
      .send(payload);
    expect(response.status).toBe(302);
    const createdTodo = await Todo.findOne({
      order: [["id", "DESC"]],
    });
    expect(createdTodo.title).toBe(payload.title);
    expect(createdTodo.dueDate).toBe(payload.dueDate);
    expect(createdTodo.completed).toBe(false);
  });

  it("Should not a mark todo as complete without csrf token", async () => {
    const todo = await makeTodo({ title: "Buy Clothes" });
    expect(todo.completed).toBe(false);

    const response = await client
      .put(`/todos/${todo.id}`)
      .send({ completed: true });
    expect(response.status).toBe(500);
    await todo.reload();
    expect(todo.completed).toBe(false);
  });

  it("Should mark a todo as complete", async () => {
    const todo = await makeTodo({ title: "Buy Clothes" });
    expect(todo.completed).toBe(false);

    const response = await client
      .put(`/todos/${todo.id}`)
      .set("Cookie", csrfCookie)
      .send({ completed: true, _csrf });

    expect(response.status).toBe(200);
    await todo.reload();
    expect(todo.completed).toBe(true);
  });

  it("Should not delete a todo without csrf token", async () => {
    const todo = await makeTodo({ title: "Buy Clothes" });
    const response = await client.delete(`/todos/${todo.id}`).send();

    expect(response.status).toBe(500);
    await todo.reload();
    expect(todo.id).toBeDefined();
  });

  it("Should delete a todo", async () => {
    const todo = await makeTodo({ title: "Buy Clothes" });

    const response = await client
      .delete(`/todos/${todo.id}`)
      .set("Cookie", csrfCookie)
      .send({ _csrf });

    expect(response.status).toBe(200);
    expect(async () => {
      return await todo.reload();
    }).rejects.toThrow(
      "Instance could not be reloaded because it does not exist anymore (find call returned null)"
    );
  });
});

/*const request = require("supertest");
var cheerio=require("cheerio");
const db = require("../models/index");
const app = require("../app");
const { response } = require("express");

let server, agent;
  function extractCsrfToken(res){
    const $ = cheerio.load(res.text);
    return $("[name=_csrf]").val();
  }
describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const res=await agent.get("/");
    const csrfToken=extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken
    });
    expect(response.statusCode).toBe(302);
    // expect(response.header["content-type"]).toBe(
    //   "application/json; charset=utf-8"
    // );
    // const parsedResponse = JSON.parse(response.text);
    // expect(parsedResponse.id).toBeDefined();
  });

  test("Marks a todo with the given ID as complete", async () => {
    let res=await agent.get("/");
    let csrfToken=extractCsrfToken(res);
    let response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken
    });
  const gr=await agent.get("/").set("Accept","application/json");
  const parsedResponse = JSON.parse(gr.text);
  const dueTodayCount=parsedResponse.dueToday.length;
  const latestTodo=parsedResponse.dueToday[dueTodayCount-1];
  res=await agent.get("/");
  csrfToken=extractCsrfToken(res);
  const markAsCompleteResponse=await agent.put(`/todos/${latestTodo.id}/markAsCompleted`).set("Accept","application/json").send({
    _csrf:csrfToken,
  })
  const parsedUpdateResponse=JSON.parse(markAsCompleteResponse.text);
  expect(parsedUpdateResponse.completed).toBe(true);
})
  //   const todoID = parsedResponse.id;

  //   expect(parsedResponse.completed).toBe(false);

  //   const markCompleteResponse = await agent
  //     .put(`/todos/${todoID}/markASCompleted`)
  //     .send();
  //   const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
  //   expect(parsedUpdateResponse.completed).toBe(true);
  // });

  //test("Fetches all todos in the database using /todos endpoint", async () => {
  //   await agent.post("/todos").send({
  //     title: "Buy xbox",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   await agent.post("/todos").send({
  //     title: "Buy ps3",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   const response = await agent.get("/todos");
  //   const parsedResponse = JSON.parse(response.text);

  //   expect(parsedResponse.length).toBe(4);
  //   expect(parsedResponse[3]["title"]).toBe("Buy ps3");
  // });

//   test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
//     const createResponse=await agent.post("/todos").send({
//         title: "delete",
//         dueDate: new Date().toISOString(),
//         completed: false,
//       });
      
//       expect(createResponse.statusCode).toBe(200);
//       const createdTodo = JSON.parse(createResponse.text); 
//       expect(createdTodo.id).toBeDefined();
//       const deleteResponse = await agent.delete(`/todos/${createdTodo.id}`);
// expect(deleteResponse.statusCode).toBe(200);
// expect(deleteResponse.body).toBe(true);

//   });
 
    
// });
});*/