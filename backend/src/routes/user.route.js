import { Router } from 'express'
import protect from '#src/middlewares/auth.middleware.js'
import {
    deleteUser,
    updateUser,
} from '#src/controllers/user.controller.js'

const userRouter = Router()

userRouter.use(protect)
userRouter.put('/update', updateUser)
userRouter.delete('/delete', deleteUser)

export default userRouter
