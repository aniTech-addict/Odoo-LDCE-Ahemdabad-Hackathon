import express from 'express'
import {getMe, login, register} from '#src/controllers/auth.controller.js'
import protect from '#src/middlewares/auth.middleware.js'
const authRouter = express.Router()

authRouter.post('/login', login)
authRouter.post('/register', register)
authRouter.get('/me', protect, getMe)

export default authRouter