const app = require('./src/api/v1/app');
const { app: { port } } = require('./src/api/v1/configs/config.mongodb');
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});
const SocketService = require('./src/api/v1/services/socket.service');

global._io = io;

global._io.on('connection', SocketService.connection);

server.listen(port, () => {
    console.log(`Server is running on ${port}`)
})


