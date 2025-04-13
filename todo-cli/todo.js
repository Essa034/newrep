const todoList = () => {
    all = []
    const add = (todoItem) => {
      all.push(todoItem)
    }
    const markAsComplete = (index) => {
      all[index].completed = true
    }
  
    const overdue = () => {
        let k=0,temp=[];
        for(let i=0;i<5;i++){
            if(all[i].dueDate==new Date(new Date().setDate(dateToday.getDate() - 1)).toISOString().split("T")[0]){
                temp[k]=all[i];
                k++;
            }
        }
        return temp;
    }
  
    const dueToday = () => {
        let k=0,temp=[];
        for(let i=0;i<5;i++){
        if(all[i].dueDate==new Date().toISOString().split("T")[0]){
            
            all[i].dueDate='';
            temp[k]=all[i];
            k++;
        }
    }
    return temp;
    }
  
    const dueLater = () => {
        let k=0,temp=[];
        for(let i=0;i<5;i++){
            if(all[i].dueDate==new Date(new Date().setDate(dateToday.getDate() + 1)).toISOString().split("T")[0]){
                temp[k]=all[i];
                k++;
            }
        }
        return temp;
    }
  
    const toDisplayableList = (list) => {
     for(let i=0;i<list.length;i++){
        if(list[i].completed==true){
            console.log('[x] '+list[i].title+' '+list[i].dueDate);
        }
        else{
            console.log('[ ] '+list[i].title+' '+list[i].dueDate);
        }
        }
     }
    
  
    return {
      all,
      add,
      markAsComplete,
      overdue,
      dueToday,
      dueLater,
      toDisplayableList
    };
  };
  
  // ####################################### #
  // DO NOT CHANGE ANYTHING BELOW THIS LINE. #
  // ####################################### #
  
  const todos = todoList();
  
  const formattedDate = d => {
    return d.toISOString().split("T")[0]
  }
  
  var dateToday = new Date()
  const today = formattedDate(dateToday)
  const yesterday = formattedDate(
    new Date(new Date().setDate(dateToday.getDate() - 1))
  )
  const tomorrow = formattedDate(
    new Date(new Date().setDate(dateToday.getDate() + 1))
  )
  
  todos.add({ title: 'Submit assignment', dueDate: yesterday, completed: false })
  todos.add({ title: 'Pay rent', dueDate: today, completed: true })
  todos.add({ title: 'Service Vehicle', dueDate: today, completed: false })
  todos.add({ title: 'File taxes', dueDate: tomorrow, completed: false })
  todos.add({ title: 'Pay electric bill', dueDate: tomorrow, completed: false })
  
  console.log("My Todo-list\n")
  
  console.log("Overdue")
  var overdues = todos.overdue()
  var formattedOverdues = todos.toDisplayableList(overdues)
  console.log(formattedOverdues)
  console.log("\n")
  
  console.log("Due Today")
  let itemsDueToday = todos.dueToday()
  let formattedItemsDueToday = todos.toDisplayableList(itemsDueToday)
  console.log(formattedItemsDueToday)
  console.log("\n")
  
  console.log("Due Later")
  let itemsDueLater = todos.dueLater()
  let formattedItemsDueLater = todos.toDisplayableList(itemsDueLater)
  console.log(formattedItemsDueLater)
  console.log("\n\n")