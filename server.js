const Queue = require('bull');

const videoQueue = Queue('test', 6379, '127.0.0.1');

setInterval(() => {
    videoQueue.add({test: Date.now()});
}, 1000);
