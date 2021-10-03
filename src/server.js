const express = require('express');
const fileUpload = require('express-fileupload');
const { PORT } = require('./config')
const { mainRouter } = require('./routers');

const app = express();

// enable files upload
app.use(express.static('uploads'));
app.use(fileUpload({
    createParentPath: true,
}));

// logging middleware
app.use((req, res, next) => {
    console.log(`${new Date()} ${req.method} ${req.url}`);
    next();
})

// main routes
app.use('/', mainRouter);

var server = app.listen(PORT, function() {
    console.log('Listening on port %d', server.address().port);
});
