const fs = require('fs')
const path = require('path')
const { replaceBackground } = require('backrem');
const sizeOfimage = require('image-size');
const db = require('../common/Database');
const { dataFolder } = require('../config')

module.exports = async (req, res) => {
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

    const frontPath = path.resolve(dataFolder,  `${front}.jpeg`)
    const backPath = path.resolve(dataFolder, `${back}.jpeg`)

    var frontDimensions = sizeOfimage(frontPath);
    var backDimensions = sizeOfimage(backPath);

    if (frontDimensions.width !== backDimensions.width || frontDimensions.height !== backDimensions.height) {
        res.status(420).send({status: false});
        return;
    }

    const frontImage = fs.createReadStream(frontPath);
    const backImage = fs.createReadStream(backPath);

    res.setHeader('content-type', 'image/jpeg')
    res.contentType('jpg')

    replaceBackground(frontImage, backImage, color, threshold).then(
        (readableStream) => {
            readableStream.pipe(res);
        }
    );
}