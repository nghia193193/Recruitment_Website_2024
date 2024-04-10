const {createClient} = require('redis');

const client =  createClient({
    url: process.env.REDIS_URI
})

client.connect(console.log('Redis connect with URI'))

client.on('error', (error) => {
    console.error(error);
})

module.exports = client;