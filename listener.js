var amqp = require('amqp');
var when = require('when');
var exporter = require('./exporter');

var connection = amqp.createConnection({host: 'localhost'});

connection.on('ready', function(){
  connection.queue('task_queue', {autoDelete: false, durable: true}, function(queue){
    console.log(' [*] Waiting for messages. To exit press CTRL+C');

    queue.subscribe({ack: true, prefetchCount: 1}, function(msg){
      var work_id = msg.data.toString('utf-8');
      console.log(" [x] Received %s", work_id);
      when(exporter.processWork(work_id), function(){
        console.log(" [x] Done");
        queue.shift(); // basic_ack equivalent        
      }, function(err) {
        console.log(err);
      })
    });
  });
});
