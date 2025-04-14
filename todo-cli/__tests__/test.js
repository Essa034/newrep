const todoList = require('../todo');
const {all,markAsComplete,add,overdue,dueLater,dueToday}=todoList(0);
    describe("TodoList test Suite",()=>{
        test("should add new todo", ()=>{
            expect(all.length).toBe(0);
            add({
                title: "test todo",completed: false,dueDate: new Date().toISOString().slice(0,10)
            }
        );
        expect(all.length).toBe(1);
        });
        test("should mark a todo as completed",()=>{
            expect(all[0].completed).toBe(false);
            markAsComplete(0);
            expect(all[0].completed).toBe(true);
        });
        test("checks retrieval of overdue items",()=>{
            const later=new Date();
            all.splice(0,1);
            const laterdate=new Date(later);
            laterdate.setDate(later.getDate()-1);
            const datstring=laterdate.toISOString().slice(0,10);
            add({
                title:"overduetask",completed:false,dueDate: datstring
            })
            const overdueitems=overdue();
            expect(overdueitems.length).toBe(1);
            expect(overdueitems[0].title).toBe("overduetask");
        })
        test("checks retrieval of due today items",()=>{
            all.splice(0,1);
            const later=new Date();
            
            const dat=later.toISOString().slice(0,10);
            add({
                title:"duetoday",completed:false,dueDate:dat
            })
            const duetodayitems=dueToday();
            expect(duetodayitems.length).toBe(1);
            expect(duetodayitems[0].title).toBe("duetoday");
        })
        test("checks retrieval of due later items",()=>{
            const later=new Date();
            all.splice(0,1);
            const laterdate=new Date(later);
            laterdate.setDate(later.getDate()+1);
            const dat=laterdate.toISOString().slice(0,10);
            add({
                title:"due",completed:false,dueDate:dat
            })
            const duel=dueLater();
            expect(duel.length).toBe(1);
            expect(duel[0].title).toBe("due");
        
        })
    })
