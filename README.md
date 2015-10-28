# lambda cron #

## Introduction ##

AWS Lambda can now be scheduled by adding a scheduled event to a Lambda function. However, AWS has limited this to a maximum of 5 scheduled event definitions per account. The 'lambda cron' project attempts deal with this limitation by allowing you to schedule an unlimited number of Lambda functions on any number of schedules as defined in a easy to edit JSON document. The crontab.json file can also define parameters to be passed to the function.

## Quick start ##

1. Edit crontab.json, specifying a schedule in crontab format, the name of the lambda function to run, and any arguments to pass this lambda function.
2. Zip up the lambdacron function and dependencies
``` zip -r lambda_cron.zip lambda_cron.js crontab.json node_modules ```
3. Upload it to an S3 bucket of your choice
3. Run up the cloudformation build:
```aws cloudformation create-stack --stack-name lambda-cron --template-body file://lambda_cron.template --parameters ParameterKey=S3Bucket,ParameterValue=mys3bucket ParameterKey=S3Object,ParameterValue=lambda_cron.zip --capabilities CAPABILITY_IAM```
4. Once complete, add a 5 minute scheduled event to the lambdacron function. 5 minutes is the minimum event interval allowed by AWS

## How it works ##

The 5 minute scheduled event triggers the lambdacron function. The function runs all jobs that are scheduled to run at the event time.

## What about the cron jobs? ##

You specify a crontab.json file which includes the schedule (in classic crontab format), the function to run, and any arguments to pass that function (in json format).
For example, this will run the 'testfunction' function every 10 minutes:

```
{
  "jobs": [ {
    "schedule": "*/10 * * * *",
    "function": "testfunction",
    "args": {
      "key1": "test1",
      "key3": "test3",
      "key2": "test2"
    }
  } ]
}
```

**Note**: Because to the 5-minute frequency limitation, the crontab string must define schedule times that are evenly divisible by 5 minutes.

## Questions, comments ##
guy.davies@sophos.com
