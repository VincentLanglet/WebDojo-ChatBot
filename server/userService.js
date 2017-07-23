const jsonDB = require('node-json-db');
const db     = new jsonDB('database', true, false);

function isUserKnown(senderId) {
  try {
    db.getData('/users/' + senderId);
    return true;
  } catch(error) {
    return false;
  }
}

function addUser(senderId, userData) {
  db.push('/users/' + senderId, userData)
}

function getData() {
  return db.getData('/');
}

function getUser(senderId) {
  return db.getData('/users/' + senderId);
}

function changeUserStatus(senderId, status) {
  db.push('/users/' + senderId + '/status', status);
}

module.exports = {
  addUser: addUser,
  changeUserStatus: changeUserStatus,
  getData: getData,
  getUser: getUser,
  isUserKnown: isUserKnown
};
