const fs = require('fs')
const path = require('path');
const { replaceBackground } = require('backrem');
const express = require('express');
const fileUpload = require('express-fileupload');
const sizeOfimage = require('image-size');
const { PORT } = require('./config')
const db = require('./common/Database');
const FileObject = require('./common/FileObject');

const app = express();

app.use(express.static('uploads'));

// enable files upload
app.use(fileUpload({
    createParentPath: true,
}));

// app.use((req, res, next) => {
//     console.log(`${new Date()} ${req.method} ${req.url}`);
//     next();
// })

app.get('/list', (req, res) => {
    try {
        return res.send(db.toList());
    } catch(e) {
        return res.send({'status': false});
    }
});

app.delete('/image/:id', async (req, res) => {
    db.remove(req.params.id);
    res.send({'id': req.params.id});
})

app.get('/image/:id', async (req, res) => {
    const image = fs.createReadStream(
        path.resolve(__dirname, `../uploads/${req.params.id}.jpeg`)
    );
    res.type('image/jpeg');
    res.setHeader('content-type', 'image/jpeg')

    image.pipe(res);
})

app.post('/upload', async (req, res) => {
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
});

app.get('/merge', async (req, res) => {
    const errors = { status: true, msg: '' };
    let front, back, color, threshold;

    if (!req.query.front) {
        errors.status = false;
        errors.msg += 'Parameter front is required\n';
    }
    front = req.query.front;

    if (!db.findOne(front)) {
        errors.status = false;
        errors.msg += 'Parameter front is not contains\n';
    }

    if (!req.query.back) {
        errors.status = false;
        errors.msg += 'Parameter back is required\n';
    }
    back = req.query.back;

    if (!db.findOne(back)) {
        errors.status = false;
        errors.msg += 'Parameter back is not contains\n';
    }

    if (req.query.color) {
        try {
            color = [];
            let rgb = req.query.color.split(',');
            if (rgb.length === 3) {
                for (let rawColorComponent of rgb) {
                    colorComponent = parseInt(rawColorComponent)
                    if (isNaN(colorComponent)) {
                        throw new Error(`Color component ${rawColorComponent} is not number`);
                    }
                    color.push(colorComponent);
                }
            } else {
                throw new Error('No RGB');
            } 
        } catch(e) {
            console.log(e)
            errors.status = false;
            errors.msg += 'Parameter color in invalid format'
        }
    }

    if (req.query.threshold) {
        threshold = parseInt(req.query.threshold)
        if (isNaN(threshold)) {
            errors.status = false;
            errors.msg += `Parameter threshold=${req.query.threshold} must be integer`
        }
    }

    if (!errors.status) {
        return res.status(400).send(errors)
    }

    const frontPath = path.resolve(__dirname, `../uploads/${front}.jpeg`)
    const backPath = path.resolve(__dirname, `../uploads/${back}.jpeg`)

    var frontDimensions = sizeOfimage(frontPath);
    var backDimensions = sizeOfimage(backPath);

    if (frontDimensions.width !== backDimensions.width || frontDimensions.height !== backDimensions.height) {
        res.status(400).send({status: false});
        return;
    }

    const frontImage = fs.createReadStream(frontPath);
    const backImage = fs.createReadStream(backPath);

    res.type('image/jpeg');
    res.setHeader('content-type', 'image/jpeg')

    replaceBackground(frontImage, backImage, color, threshold).then(
        (readableStream) => {
            readableStream.pipe(res);
        }
    );
});

var server = app.listen(PORT, function() {
    console.log('Listening on port %d', server.address().port);
});
