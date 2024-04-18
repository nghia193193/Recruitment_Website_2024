const app = require('./src/api/v1/app');
const { app: { port } } = require('./src/api/v1/configs/config.mongodb')

const server = app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})

