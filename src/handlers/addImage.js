const db = require('../common/Database');
const FileObject = require('../common/FileObject');

module.exports = async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            let image = req.files.image;

            if (image.mimetype === 'image/jpeg') {
                let fileObject = new FileObject(image.size, image.name, req.query.id)

                image.mv('./uploads/' + fileObject.id + '.jpeg');

                db.insert(fileObject);

                res.send(fileObject);
            } else {
                res.status(400)
            }
        }
    } catch (err) {
        res.status(500).send(err);
    }
}