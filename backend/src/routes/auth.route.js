import express from 'express'
import {getMe, login, register} from '#src/controllers/auth.controller.js'
import protect from '#src/middlewares/auth.middleware.js'
import asyncHandler from '#src/middlewares/asyncHandler.middleware.js'
const authRouter = express.Router()

authRouter.post('/login', asyncHandler(login))
authRouter.post('/register', asyncHandler(register))
authRouter.get('/me', protect, asyncHandler(getMe))

export default authRouter