console.log('Loading function');

var AWS = require('aws-sdk');
var parser = require('cron-parser');
var async = require('async');
var fs = require('fs');
var eventtime;


function read_crontab(callback) {
   fs.readFile('crontab.json', 'utf8', function(err,file) {
       if (err) {
          callback(err);
       }
       else {
          crontab = JSON.parse(file);
          console.log("from crontab file, crontab is ", crontab);
          callback(null,crontab);
       } 
    });
}

function execute_lambdas(crontab, callback ) {
    console.log("crontab is ",crontab);
    // Event time can be a bit before or after actual scheduled time. Round to 5 minutes
    var minutes = eventtime.getMinutes() + eventtime.getSeconds()/60;
    minutes = Math.round(minutes / 5) * 5 ;
    eventtime.setSeconds(0,0);
    eventtime.setMinutes(minutes);
    // coerce eventtime into a string with seconds
    var eventtimestring = JSON.stringify(eventtime);
    async.each(crontab['jobs'], function(job,iteratorcallback) { 
            console.log("job is",job);
            console.log("schedule is",job["schedule"]);
            var options = {currentDate: eventTime};
            var interval = parser.parseExpression(job["schedule"],options);
            var runtime = interval.next();
            // coerce runtime into a string with seconds
            runtimestring = JSON.stringify(runtime);
            console.log("eventtimestring is",eventtimestring);
            console.log("runtimestring is  ",runtimestring);
            if (eventtimestring == runtimestring) {
                console.log("Running job as scheduled");
                       var lambda = new AWS.Lambda();
                        var params = {
                                FunctionName: job["function"],
                                InvocationType: "Event",
                                Payload: JSON.stringify(job["args"])
                        };
                        lambda.invoke(params, function(err,data) {
                                 if (err) iteratorcallback(err);
                                 else iteratorcallback(null);
                        });
            }
            else {
                    console.log("Not running job as not scheduled for it");
                    iteratorcallback(null);
            }
    }, function(err) {
            if (err) callback(err);
            else callback(null);
    });
}


exports.handler = function(event, context) {
  var eventtime = new Date(event.time);
  async.waterfall([
     read_crontab,
     execute_lambdas
  ], function (err) {
           if (err) context.fail(err);
           else context.succeed(); });
};
