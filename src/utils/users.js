const users = [];
const addUser = ({ id, username, room }) => {
  //Clean the Data

  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validating the data

  if (!username || !room)
    return {
      error: "username and room is required!",
    };

  const exsistingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });
  //validate Username
  if (exsistingUser) {
    return {
      error: "Username is already in use",
    };
  }

  //Store User
  const user = { id, username, room };
  users.push(user);
  return { user };
};
const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });

  if (index != -1) return users.splice(index, 1)[0]; //remove items by index number of items and getting first item
};

const getUser = (id) => {
  return users.find((user) => {
    return user.id === id;
  });
};

const getUsersInRoom = (room) => {
  return users.filter((user) => {
    return user.room === room;
  });
};

module.exports = {
  addUser,
  getUsersInRoom,
  getUser,
  removeUser,
};
