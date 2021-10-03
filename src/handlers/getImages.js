const db = require('../common/Database');

module.exports = async (req, res) => {
    try {
        return res.send(db.toList());
    } catch(e) {
        return res.send({'status': false});
    }
}