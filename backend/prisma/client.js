import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// to be imported wherever we need to talk to the DB
export default prisma