const express = require('express');
const image = require('./handlers')

const mainRouter = new express.Router();

mainRouter.get('/list', image.getImages);

mainRouter.delete('/image/:id', image.deleteImage)

mainRouter.get('/image/:id', image.getImage)

mainRouter.post('/upload', image.addImage);

mainRouter.get('/merge', image.mergeImages);

exports.mainRouter = mainRouter;
