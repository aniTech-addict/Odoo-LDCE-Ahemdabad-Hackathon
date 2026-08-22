import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '#root/db.js'
import defaultCategories from '#src/utils/deafultCategories.js'
import hashPassword from '#src/utils/hashPassword.js'

/**
 * @description Sign a JWT token for a user, expires in 7 days
 * @param {string} userId - The user ID
 * @returns {string} - The signed JWT token
 */
const signToken = userId =>
    jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })

export const register = async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        password,
        city,
        country,
        additionalInfo,
    } = req.body

    const hasAllRequiredFields =
        email && password && firstName && lastName && city && country

    const hasStrongEnoughPassword = password.length >= 8

    if (!hasAllRequiredFields) {
        return res
            .status(400)
            .json({ message: 'Please provide all the fields' })
    }

    if (!hasStrongEnoughPassword)
        return res
            .status(400)
            .json({ message: 'Please set a stronger password' })

    const hashedPassword = await hashPassword(password)

    const client = await pool.connect()
    try {
        const existingUser = await client.query(
            'SELECT id from users where email = $1',
            [email],
        )
        const userAlreadyExists = existingUser.rowCount > 0

        if (userAlreadyExists) {
            return res
                .status(400)
                .json({ message: 'Email already in use, Login instead' })
        }

        await client.query('BEGIN')

        const userResult = await client.query(
            'INSERT INTO users (first_name, last_name, email, phone, city, country, additional_info, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, first_name, last_name, email, phone, city, country, additional_info',
            [
                firstName,
                lastName,
                email,
                phone,
                city,
                country,
                additionalInfo,
                hashedPassword,
            ],
        )

        const user = userResult.rows[0]

        await client.query('COMMIT')
        const token = signToken(user.id)
        return res.sendStructuredResponse(
            201,
            {
                user,
                token,
            },
            'User registered successfully',
        )
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Error registering user:', error)
        return res.sendStructuredResponse(
            500,
            null,
            `Something went wrong on server`,
        )
    } finally {
        client.release()
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body

    const hasAllRequiredFields = email && password
    if (!hasAllRequiredFields) {
        return res
            .status(400)
            .json({ message: 'Please provide all the fields' })
    }

    const client = await pool.connect()
    try {
        const existingUser = await client.query(
            `SELECT id, first_name, last_name, email, phone, city, country, additional_info, password FROM users WHERE email=$1`,
            [email],
        )
        const user = existingUser.rows[0]
        if (!user) {
            return res
                .status(400)
                .json({ message: 'No such user found, please register first' })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res
                .status(400)
                .json({ message: 'Email or Password is incorrect' })
        }

        const token = signToken(user.id)
        return res.sendStructuredResponse(
            200,
            {
                user: {
                    id: user.id,
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    phone: user.phone,
                    city: user.city,
                    country: user.country,
                    additionalInfo: user.additional_info,
                },
                token,
            },
            'User logged in successfully',
        )
    } catch (error) {
        console.error('Error logging in user:', error)
        return res.sendStructuredResponse(
            500,
            null,
            `Something went wrong on server`,
        )
    } finally {
        client.release()
    }
}

export const getMe = async (req, res) => {
    const client = await pool.connect()
    try {
        const id = req.userId
        if (!id)
            return res
                .status(400)
                .json({ message: 'No such user found, please register first' })

        const result = await client.query(
            `SELECT id, first_name, last_name, email, currency FROM users where id=$1`,
            [id],
        )
        if (result.rows.length === 0) {
            return res
                .status(400)
                .json({ message: 'No such user found, please register first' })
        }
        const user = result.rows[0]
        return res.sendStructuredResponse(
            200,
            {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                currency: user.currency,
            },
            'User retrieved successfully',
        )
    } catch (error) {
        console.error('Error getting user:', error)
        return res.sendStructuredResponse(
            500,
            null,
            'Something went wrong on server',
        )
    } finally {
        client.release()
    }
}
