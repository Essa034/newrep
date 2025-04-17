const request=require("supertest")
const db=require("../models/index")
const app=require("../app");
let server,agent;
describe("Todo test suite",()=>{
    beforeAll(async () =>{
        await db.sequelize.sync({
            force:true});
            server=app.listen(3000,()=>{});
            agent=request.agent(server);
        });
    afterAll(async () => {
        await db.sequelize.close();
        if(server){
        server.close();
        }
});
test("responds with json at /todos",async()=>{
    const response=await agent.post('/todos').send({
        'title':'Buy milk',
        dueDate: new Date().toISOString(),
        completed:false
    });
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe(
        "application/json; charset=utf-8"
    );
    const parsedResponse=JSON.parse(response.text);
    expect(parsedResponse.id).toBeDefined();
});
test("mark as completed",async () =>{
    const response = await agent.post('/todos').send({
        'title':'Buy milk',
        dueDate: new Date().toISOString(0),
        completed: false
    });
    const parsedResponse=JSON.parse(response.text);
    const todoID=parsedResponse.id;
    expect(parsedResponse.completed).toBe(false);
    const markCompleteResponse=await agent.put(`/todos/${todoID}/markAsCompleted`).send();
    const parsedUpdateResponnse=JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponnse.completed).toBe(true);
});
})
        

