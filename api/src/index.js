const { app } = require('@azure/functions');

app.setup({
    enableHttpStream: true,
});

require('./functions/notifications');
require('./functions/rooms');
require('./functions/room-sensor-data');
require('./functions/sensor-data.js');
require('./functions/settings.js');


module.exports = app;
