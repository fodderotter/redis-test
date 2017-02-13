const Queue = require('bull');

const videoQueue = Queue('test', 6379, '127.0.0.1');

videoQueue.process((job, done) => {
   console.log(job.data);

   done();
});
