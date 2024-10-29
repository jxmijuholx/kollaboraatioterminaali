import express from 'express';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { connectDB } from '../db';
import User from '../models/user';
import authRoutes from '../routes/authRoute';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('User Authentication', () => {
    beforeEach(async () => {
        await connectDB();
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should register a new user', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                username: 'testuser',
                password: 'password123'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
    });

    it('should not allow duplicate usernames', async () => {
        await request(app)
            .post('/auth/register')
            .send({
                username: 'testuser',
                password: 'password123'
            });

        const response = await request(app)
            .post('/auth/register')
            .send({
                username: 'testuser',
                password: 'password456'
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Username already exists');
    });

    it('should login with correct credentials', async () => {
        await request(app)
            .post('/auth/register')
            .send({
                username: 'testuser',
                password: 'password123'
            });

        const response = await request(app)
            .post('/auth/login')
            .send({
                username: 'testuser',
                password: 'password123'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    it('should not login with incorrect password', async () => {
        await request(app)
            .post('/auth/register')
            .send({
                username: 'testuser',
                password: 'password123'
            });

        const response = await request(app)
            .post('/auth/login')
            .send({
                username: 'testuser',
                password: 'wrongpassword'
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Invalid username or password');
    });
});
