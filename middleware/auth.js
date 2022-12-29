import jwt from 'jsonwebtoken'

const auth = (req, res, next) =>
{
    try
    {
        //getting toklen from header
        const token = req.header("Authorization")
        if (!token) return res.status(400).json({ msg: "Invalid Authentication" })
        //verifying with token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) =>
        {
            if (err) return res.status(400).json({ msg: "Invalid Authentication" })

            req.user = user
            next()
        })
    } catch (err)
    {
        return res.status(500).json({ msg: err.message })
    }
}

export default auth