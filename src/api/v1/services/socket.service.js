
class SocketService {
    constructor() {
        this.userSockets = new Map();
        this.connection = this.connection.bind(this);
    }

    getUserSockets() {
        return this.userSockets;
    }

    // connection
    connection(socket) {
        const { userId } = socket.payload;
        if (userId) {
            console.log(`User ${userId} connected with socket ${socket.id}`);
            this.userSockets.set(userId, socket.id);
        }
        socket.on("disconnect", () => {
            console.log(`User disconnect id is: ${socket.id}`);
            this.userSockets.forEach((value, key) => {
                if (value === socket.id) {
                    this.userSockets.delete(key);
                    console.log(`User ${key} disconnected and removed from userSockets`);
                }
            });
        })
    }
}

module.exports = new SocketService();