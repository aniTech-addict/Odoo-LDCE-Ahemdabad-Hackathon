import jwt, { decode } from 'jsonwebtoken'

const protect = async (req ,res, next) => {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Not Authorized, no token' })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.userId
        next()
    
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token, please login again' })
    }

}

export default protect