const { app } = require('@azure/functions');

app.setup({
    enableHttpStream: true,
});

require('./functions/notifications.js');
require('./functions/room-data.js');
require('./functions/room-sensor-data.js');
require('./functions/sensor-data.js');
require('./functions/settings.js');
require('./functions/test.js');


module.exports = app;
