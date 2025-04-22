const app = require("./app"); 
const { sequelize } = require('./models'); 


sequelize.sync({ alter: true }).then(() => {
  console.log("✅ Database synced!");

  app.listen(3000, () => {
    console.log("🚀 Server started at port 3000");
  });
}).catch((err) => {
  console.error("❌ Failed to sync DB:", err);
});
