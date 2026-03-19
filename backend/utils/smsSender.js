import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'

const sns = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

export const sendSMS = async (phone, message) => {
  const params = {
    Message: message,
    PhoneNumber: phone // format: +91XXXXXXXXXX
  }

  await sns.send(new PublishCommand(params))
}