var fs = require('fs');
var when = require('when');
var http = require('http');
var Handlebars = require('handlebars');

//TODO: put these somewhere else
Handlebars.registerHelper("join", function( array, sep, options ) {
  return array.map(function(item) {
    return options.fn(item);
  }).join(sep);
});
Handlebars.registerHelper("sentence", function(array, options) {
  var items = array.map(function(item) {
    return options.fn(item);
  });
  if (items.length == 1) {
    return items[0];
  } else {
    var last = items.pop();
    return items.join(", ") + " and " + last;
  }
});

var fetchWorkData = function (work_id) {
  var deferred = when.defer();
   var options = {
    hostname: '127.0.0.1',
    port: '3000',
    path: '/api/v1/works/' + work_id + ".json",
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };

  var req = http.request(options, function(res) {
    var output = '';
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      output += chunk;
    });

    res.on('end', function() {
      // console.log(output);
      deferred.resolve(JSON.parse(output));
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.end();
  return deferred.promise;
}

var generateHTML = function (work) {
  var deferred = when.defer();
  fs.readFile("templates/work.hbs", 'utf8', function (err, source) {
    if (err) deferred.reject(err);
    var template = Handlebars.compile(source);
    var addr = "files/" + work.id + ".html";
    fs.writeFile(addr, template(work), function(err) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(addr);
      };
    });
  });
  return deferred.promise;
}

var generatePDF = function (work) {
  
}

var generateEpub = function (work) {
  
}

var generateMobi = function (work) {
  
}


var processWork = function (work_id) {
  var deferred = when.defer()
  when(fetchWorkData(work_id), function(work) {
    when(generateHTML(work), function(htmlFile) {
      console.log(htmlFile);
      deferred.resolve(htmlFile);
    })
  })
  return deferred.promise;
}


exports.processWork = processWork;