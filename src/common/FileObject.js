const path = require('path');

const { dataFolder } = require('../config');
const { generateId } = require('./generateId');


module.exports = class FileObject {
    constructor(size, originalName, id, uploadedAt) {
        this.size = size;
        this.originalName = originalName;
        this.id = id || generateId();
        this.uploadedAt = uploadedAt || Date.now();
        //body: Buffer
        this.mimeType = 'image/jpeg'
        this.originalFilename = path.resolve(dataFolder, `${this.id}.jpeg`);
    }

    toJSON() {
        return {
            id: this.id,
            uploadedAt: this.uploadedAt,
            size: this.size,
            mimeType: this.mimeType,
            originalName: this.originalName,
        };
    }
};