const { EventEmitter } = require('events');
const { existsSync } = require('fs');
const { dbDumpFile } = require('../config');
const FileObject = require('./FileObject.js');
const { writeFile, removeFile, exists } = require('./fs')


class Database extends EventEmitter {
    constructor() {
        super();
        this.idToJpeg = {};
    }

    async initFromDump() {
        if (existsSync(dbDumpFile) === false) {
            return;
        }

        const dump = require(dbDumpFile);

        if (typeof dump.idToJpeg === 'object') {
            this.idToJpeg = {};

            for (let id in dump.idToJpeg) {
                const data = dump.idToJpeg[id];

                this.idToJpeg[id] = new FileObject(data.size, data.originalName, data.id, data.uploadedAt);
            }
        }
    }

    async insert(data) {
        this.idToJpeg[data.id] = data;

        this.emit('changed');
    }

    async remove(dataId) {
        console.log(dataId)

        const obj = this.idToJpeg[dataId];

        if (exists(obj.originalFilename)) {
            removeFile(obj.originalFilename)
        }

        delete this.idToJpeg[dataId];

        this.emit('changed');

        return dataId;
    }

    findOne(dataId) {
        const dataRaw = this.idToJpeg[dataId];

        if (!dataRaw) {
            return null;
        }

        return dataRaw;
    }

    toJSON() {
        return {
            idToJpeg: this.idToJpeg,
        };
    }

    toList() {
        return Object.values(this.idToJpeg);
    }
}

const db = new Database();

db.initFromDump();

db.on('changed', () => {
    writeFile(dbDumpFile, JSON.stringify(db.toJSON(), null, '\t'));
});

module.exports = db;
