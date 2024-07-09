module.exports = {
    apps: [{
        name: "app2",
        script: "src/api/v1/server.js",
        env: {
            " MONGODB_URI": "mongodb + srv://nghia193:Aa123456@cluster0.nizvwnm.mongodb.net/Recruiment_Website?retryWrites=true&w=majority",
            "PORT": "8080",
            "UV_THREADPOOL_SIZE": "6"
        }
    }]
}