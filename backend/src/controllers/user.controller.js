import pool from '#root/db.js'

export const deleteUser = async (req, res) => {
    const userId = req.userId
    const query = `DELETE FROM users where id=$1`

    try {
        const result = await pool.query(query, [userId])

        if (result.rowCount === 0) {
            return res.sendStructuredResponse(404, null, 'user not found')
        } else {
            return res.sendStructuredResponse(
                200,
                null,
                'user deleted successfully',
            )
        }
    } catch (error) {
        return res.sendStructuredResponse(500, null, 'Error deleting user')
    }
}

export const updateUser = async (req, res) => {
    const userId = req.userId
    const { name, email, city, country, additionalInfo } = req.body

    const [firstName, ...lastNameParts] = (name || '').trim().split(/\s+/)
    const lastName = lastNameParts.join(' ')

    const query = `
        UPDATE users
        SET first_name = COALESCE(NULLIF($1, ''), first_name),
            last_name = COALESCE(NULLIF($2, ''), last_name),
            email = COALESCE($3, email),
            city = COALESCE($4, city),
            country = COALESCE($5, country),
            additional_info = COALESCE($6, additional_info)
        WHERE id = $7
    `
    try {
        const result = await pool.query(query, [
            firstName,
            lastName,
            email,
            city,
            country,
            additionalInfo,
            userId,
        ])
        if (result.rowCount === 0) {
            return res.sendStructuredResponse(404, null, 'user not found')
        } else {
            res.sendStructuredResponse(200, null, 'user updated successfully')
        }
    } catch (error) {
        return res.sendStructuredResponse(500, null, 'Error updating user')
    }
}
