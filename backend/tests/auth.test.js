import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import authRoutes from '../routes/auth.js'
import prisma from '../prisma/client.js'

// minimal express app for testing
const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)

// cleanup test users after all tests run
afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { endsWith: '@test-budgetwise.com' } }
  })
  await prisma.$disconnect()
})

describe('POST /api/auth/register', () => {

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'register@test-budgetwise.com',
                password: 'password123'
            })
        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('user')
        expect(res.body.user).toHaveProperty('id')
    })

    it('should not register with existing email', async () => {
        const email = 'duplicate@test-budgetwise.com'
        // First, register the user
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email,
                password: 'password123'
            })
        // Then, try to register again with the same email
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Another User',
                email,
                password: 'password456'
            })
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('User already exists')
    })

    it('should return 400 if name is too short', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'a',                                    // ← short name
        email: 'shortname@test-budgetwise.com',       // unique email
        password: 'password123' })

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Name must be at least 2 characters')
    })

    it('should return 400 if email is invalid', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Test User', email: 'notanemail', password: 'password123' })

        expect(res.status).toBe(400)
        expect(res.body.message).toContain('Invalid email')
    })

    it('should return 400 if password is too short', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Test User', email: 'shortpass@test-budgetwise.com', password: '123' })

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Password must be at least 6 characters')
    })
})

describe('POST /api/auth/login', () => {

    beforeAll(async () => {
        // register a user to test login
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Login User',
                email: 'login@test-budgetwise.com',
                password: 'password123'
            })
    })

    it('should login a user with valid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'login@test-budgetwise.com',
                password: 'password123'
            })
        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('accessToken')  // not 'token'
    })

    it('should return 400 if email is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'password123' })

        expect(res.status).toBe(400)
        expect(res.body.message).toContain('Invalid email')
    })

    it('should return 400 if password is missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'login@test-budgetwise.com', password: '' })

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Password is required')
    })

    it('should return 400 for invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'login@test-budgetwise.com',
                password: 'wrongpassword'
            })
        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Invalid credentials')
    })
})