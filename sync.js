// sync.js
const sequelize = require('./config/DBserver');


const User = require('./models/User.js');
const GroupMessages = require('./models/GroupMessages.js');
const Groups = require('./models/Groups.js');
const Messages = require('./models/Messages.js');
const UserGroups = require('./models/UserGroups.js');
const UserPrivateConversations = require('./models/UserPrivateConversations.js');
// const ChatroomModel = require('./Models/Chatroom.js'); // Adjust the path based on your project structure

// const User = UserModel(sequelize);
// const Chatroom =ChatroomModel(sequelize);

(async () => {
  try {
    // to drop and recreate uncomment the below code
    await sequelize.sync({ force: true });
    // await sequelize.sync();
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing the database:', error);
  } finally {
    process.exit();
  }
})();
