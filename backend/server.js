import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { applyResponsePrototype } from './src/helpers/responsePrototype.js'
import errorMiddleware from '#src/middlewares/error.middleware.js'

import authRouter from '#src/routes/auth.route.js'
import userRouter from '#src/routes/user.route.js'
import travelRouter from '#src/routes/travel.route.js'

const app = express()
const port = process.env.PORT || 8080

// Apply to app.response before routes handle any requests
applyResponsePrototype(app)

app.use(cors({ origin: '*' }))
app.use(express.json())

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/travel', travelRouter)

app.get('/', (req, res) => {
    res.sendStructuredResponse(200, null, 'SERVER IS RUNNING')
})

app.use(errorMiddleware)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
