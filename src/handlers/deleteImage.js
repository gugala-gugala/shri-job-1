const db = require('../common/Database');

module.exports = async (req, res) => {
    if (db.findOne(req.params.id)) {
        db.remove(req.params.id);
        res.send({'id': req.params.id});
    } else {
        res.status(404).send('Not found');
    }
}