const Hapi = require('hapi');
const Queue = require('bull');
const jsdiff = require('diff');
const MongoClient = require('mongodb').MongoClient;
const mongoDbUri = require('mongodb-uri');

const server = new Hapi.Server({})

server.connection({ port: 9000 })

server.start(() => console.log('Server started.'));

process.on('SIGTERM', () => server.stop({timeout: 5 * 1000}, () => process.exit(0)));

const dbOptions = {
    hosts:[{
        host: 'localhost',
        port: 27017
    }],
    database: 'redis-test'
}

MongoClient.connect(mongoDbUri.format(dbOptions), (error, db) => {
    if (error) return error;

    server.app.db = db
})

module.exports = server;

server.route({
    method: 'GET',
    path: '/start/{id}',
    handler: (req, reply) => {

    }
})

server.route({
    method: 'POST',
    path: '/end/{id}',
    handler: (req, reply) => {
        const post = Queue('postQueue', 6379, '127.0.0.1');

        const data = req.payload

        // return post.empty()

        if (req.query.status === 'new') {
            post.add(data, {removeOnComplete: false, jobId: req.params.id})
        }

        if (req.params.id === 'a' && req.query.status === 'update') {
            console.log(jsdiff.diffJson(post.getJob(req.params.id).then(x => x.data), req.payload))
        }

        server.app.db.collection('redis').insertOne(data, (error, response) => {
            if (error) return reply(error)

            return reply(response)
        });
    }
})
