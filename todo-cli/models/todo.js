// models/todo.js
'use strict';
let c=0;
const { Model,Op } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    static async addTask(params) {
      return await Todo.create(params);
    }
    static async showList() {
      
      
      console.log('My Todo list \n');
      console.log('Overdue');
      const overdueItems = await Todo.overdue();
      overdueItems.forEach((item) => console.log(item.displayableString()));
      console.log('\n');

      console.log('Due Today');
      const dueTodayItems = await Todo.dueToday();
      dueTodayItems.forEach((item) => console.log(item.displayableString()));
      console.log("\n");

      console.log('Due Later');
     const dueLaterItems = await Todo.dueLater();
      dueLaterItems.forEach((item) => console.log(item.displayableString()));
    }

    static async overdue() {
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date().toISOString().slice(0, 10),
          },
        },
        order: [['id', 'ASC']],
      });    }

    static async dueToday() {
      c=1;
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date().toISOString().slice(0, 10),
          },
        },
        order: [['id', 'ASC']],
      });    }

    static async dueLater() {
      c=0;
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date().toISOString().slice(0, 10),
          },
        },
        order: [['id', 'ASC']],
      });    }

    static async markAsComplete(id) {
      const todo = await Todo.findByPk(id);
      if (todo) {
        todo.completed = true;
        await todo.save();
        console.log(`Todo with ID ${id} marked as complete.`);
      } else {
        console.log(`Todo with ID ${id} not found.`);
      }
    }

    displayableString() {
      let checkbox = this.completed ? '[x]' : '[ ]';
      if(c===0){
      return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
    }
    else{
      return `${this.id}. ${checkbox} ${this.title}`;

    }
  }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Todo',
    },
  );
  return Todo;
};