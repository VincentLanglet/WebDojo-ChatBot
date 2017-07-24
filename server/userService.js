var jsonDB = require('node-json-db');
var db     = new jsonDB('database', true, false);

/**
 * @param int senderId
 *
 * @returns bool
 */
function isUserKnown(senderId) {
  try {
    db.getData('/users/' + senderId);
    return true;
  } catch(error) {
    return false;
  }
}

/**
 * @param int    senderId
 * @param object userData
 */
function addUser(senderId, userData) {
  db.push('/users/' + senderId, userData)
}

/**
 * @returns object
 */
function getData() {
  return db.getData('/');
}

/**
 * @param int senderId
 *
 * @returns object
 */
function getUser(senderId) {
  return db.getData('/users/' + senderId);
}

/**
 * @param int    senderId
 * @param string status
 */
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
