import winston from 'winston'
import 'dotenv/config'
import { 
    CloudWatchLogsClient,
    PutLogEventsCommand,
    CreateLogGroupCommand,
    CreateLogStreamCommand
} from '@aws-sdk/client-cloudwatch-logs'

class CloudWatchTransport extends winston.Transport {
    constructor(opts) {
        super(opts)
        this.logGroupname = opts.logGroupname || 'BudgetWiseLogs'
        this.logStreamName = opts.logStreamName || `app-log-stream-${Date.now()}`
        this.client = new CloudWatchLogsClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        })
        this.sequenceToken = null // CloudWatch requires log events to be sent in order with a token from the previous batch. You save it after each PutLogEventsCommand and pass it in the next one. Without it you'd get InvalidSequenceTokenException on the second log onwards.
        this.init()  // create log group and stream if they don't exist
    }

    async init() {
        try {
            await this.client.send(new CreateLogGroupCommand({ logGroupName: this.logGroupname }))
        } catch (err) {
            if (err.name !== 'ResourceAlreadyExistsException') {
                console.error('Error creating log group:', err)
            }
        }

        try {
            await this.client.send(new CreateLogStreamCommand({ 
                logGroupName: this.logGroupname, 
                logStreamName: this.logStreamName 
            }))
        } catch (err) {
            if (err.name !== 'ResourceAlreadyExistsException') {
                console.error('Error creating log stream:', err)
            }
        }
    }

    async log(info, callback) {
        try {
            // PutLogEventsCommand sends it to AWS CloudWatch
            const command = new PutLogEventsCommand({
                logGroupName: this.logGroupname,
                logStreamName: this.logStreamName,
                logEvents: [
                    {
                        message: JSON.stringify(info),
                        timestamp: Date.now()
                    }
                ],
            sequenceToken: this.sequenceToken,  // CloudWatch requires this for ordering
            })
            const response = await this.client.send(command)
            this.sequenceToken = response.nextSequenceToken
        } catch (err) {
            console.error('Error sending log to CloudWatch:', err)
        }
        callback()
    }
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // always log to console
    new winston.transports.Console({ format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),

    // log to CloudWatch in Prod
    ...(process.env.NODE_ENV === 'production' ? [new CloudWatchTransport({ 
        logGroupname: 'budgetwise',
        logStreamName: 'budgetwise-backend'
     })] : [])
  ]
})

export default logger