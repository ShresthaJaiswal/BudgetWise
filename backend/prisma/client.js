// import { PrismaClient } from '../generated/prisma/client'
// import pkg from '@prisma/client'
import { PrismaPg} from "@prisma/adapter-pg"
import { PrismaClient } from ".\generated\prisma";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({connectionString});


const prisma = new PrismaClient({adapter})

// to be imported wherever we need to talk to the DB
export default prisma