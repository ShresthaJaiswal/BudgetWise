import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

const sqs = new SQSClient({ region: process.env.AWS_REGION })

export const enqueueExportJob = async ({ userId, email, filters }) => {
    await sqs.send(new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MessageBody: JSON.stringify({ userId, email, filters })
    }))
}