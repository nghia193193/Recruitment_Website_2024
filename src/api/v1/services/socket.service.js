
class SocketService {
    // connection
    connection(socket) {
        console.log("Socket connect success")
        socket.on("disconnect", () => {
            console.log(`User disconnect id is: ${socket.id}`);
        })
        // event on
        socket.on("notification_admin_recruiter", notification => {
            console.log(notification);
            _io.emit("notification_admin_recruiter", notification);
        })
    }
}

module.exports = new SocketService();