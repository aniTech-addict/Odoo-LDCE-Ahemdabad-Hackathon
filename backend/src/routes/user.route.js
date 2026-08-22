import { Router } from 'express'
import protect from '#src/middlewares/auth.middleware.js'
import asyncHandler from '#src/middlewares/asyncHandler.middleware.js'
import {
    deleteUser,
    updateUser,
} from '#src/controllers/user.controller.js'

const userRouter = Router()

userRouter.use(protect)
userRouter.put('/update', asyncHandler(updateUser))
userRouter.delete('/delete', asyncHandler(deleteUser))

export default userRouter
