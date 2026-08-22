import pool from '#root/db.js'

export const deleteUser = async (req, res) => {
    const userId = req.userId
    const query = `DELETE FROM users where id=$1`

    try {
        const result = await pool.query(query, [userId])

        if (result.rowCount === 0) {
            return res.sendStructuredResponse(
                404,
                null,
                'user not found',
            )
        } else {
            return res.sendStructuredResponse(
                200,
                null,
                'user deleted successfully',
            )
        }
    } catch (error) {
        return res.sendStructuredResponse(
            500,
            null,
            'Error deleting user',
        )
    }
}

export const updateUser = async (req, res) => {
    const userId = req.userId
    const {
        name,
        email,
        password,
        city, 
        country
        
    } = req.body

    const query = `
        UPDATE users set name=COALESCE($1, name), email=COALESCE($2, email), password=COALESCE($3, password),
        currency=COALESCE($4, currency), currency_code=COALESCE($5, currency_code) where id=$6
    `
    try {
        const result = await pool.query(query, [
            name,
            email,
            password,
            currency,
            currency_code,
            userId,
        ])
        if (result.rowCount === 0) {
            return res.sendStructuredResponse(
                404,
                null,
                'user not found',
            )
        } else {
            res.sendStructuredResponse(
                200,
                null,
                'user updated successfully',
            )
        }
    } catch (error) {
        return res.sendStructuredResponse(
            500,
            null,
            'Error updating user',
        )
    }
}
