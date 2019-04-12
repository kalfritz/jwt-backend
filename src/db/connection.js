const monk = require(`monk`);

const db = monk(process.env.MONGO_CONNECTION);

module.exports = db;
