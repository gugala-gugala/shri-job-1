const db = require('../common/Database');
const fs = require('fs')
const path = require('path')
const { dataFolder } = require('../config')

module.exports = async (req, res) => {
    if (db.findOne(req.params.id)) {
        const image = fs.createReadStream(
            path.resolve(dataFolder, `${req.params.id}.jpeg`)
        );
        res.contentType('jpg')

        image.pipe(res);
    } else {
        res.status(404).send('Not found')
    }
}