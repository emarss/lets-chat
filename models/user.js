const fs = require('fs');

const file = fs.readFileSync("./database/users.data", 'UTF-8');

User = JSON.parse(file);

module.exports = User;