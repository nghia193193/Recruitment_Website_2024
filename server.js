const jwt = require('jsonwebtoken');
const app = require('./src/api/v1/app');
const config = require('./src/api/v1/configs/config.mongodb');
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});
const SocketService = require('./src/api/v1/services/socket.service');
const SchedulerService = require('./src/api/v1/services/scheduler.service');

global._io = io;

global._io.use((socket, next) => {
    const { auth } = socket.handshake.headers;
    if (!auth) {
        return next(new Error("Vui lòng đăng nhập!"));
    }
    const token = auth.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
        if (err) {
            // invalid error,...
            if (err.name === 'JsonWebTokenError') {
                return next(new Error("Vui lòng đăng nhập"));
            }
            // token expired error
            return next(new Error("Vui lòng đăng nhập lại"));
        }
        socket.payload = payload;
        next();
    })
})

global._io.on('connection', SocketService.connection);

server.listen(config.app.port, () => {
    console.log(`Server is running on ${config.app.port}`);
    SchedulerService.schedulePostCountReset();
})


