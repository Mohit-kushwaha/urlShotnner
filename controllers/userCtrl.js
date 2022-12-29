import Users from '../models/UserModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import googleAuth from '../middleware/googleAuth.js'

const userCtrl = {
    //register the user
    register: async (req, res) =>
    {
        try
        {
            const { name, email, password } = req.body;
            const user = await Users.findOne({ email })
            if (user) return res.status(400).json({ msg: "The email already exists." })

            if (password.length < 6)
                return res.status(400).json({ msg: "Password is at least 6 characters long." })

            // Password Encryption
            const passwordHash = await bcrypt.hash(password, 10)
            const newUser = new Users({
                name, email, password: passwordHash
            })

            // Save mongodb
            await newUser.save()

            // Then create jsonwebtoken to authentication
            const accesstoken = createAccessToken({ id: newUser._id })
            const refreshtoken = createRefreshToken({ id: newUser._id })

            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
            })
            res.json({ accesstoken })

        } catch (err)
        {
            return res.status(500).json({ msg: err.message })
        }
    },
    //login the user
    login: async (req, res) =>
    {
        try
        {
            const { email, password } = req.body;

            const user = await Users.findOne({ email })
            if (!user) return res.status(400).json({ msg: "User does not exist." })

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return res.status(400).json({ msg: "Incorrect password." })

            // If login success , create access token and refresh token
            const accesstoken = createAccessToken({ id: user._id })
            const refreshtoken = createRefreshToken({ id: user._id })

            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
            })

            res.json({ accesstoken })

        } catch (err)
        {
            return res.status(500).json({ msg: err.message })
        }
    },
    //logoute the user
    logout: async (req, res) =>
    {
        try
        {
            res.clearCookie('refreshtoken', { path: '/user/refresh_token' })
            return res.json({ msg: "Logged out" })
        } catch (err)
        {
            return res.status(500).json({ msg: err.message })
        }
    },
    //google login logic
    googleLogin: async (req, res) =>
    {
        try
        {
            const code = req.body.code;
            const profile = await googleAuth.getProfileInfo(code);
            const user = await Users.findOne({ email: profile.email })
            const password = profile.email + process.env.GOOGLE_SECRET
            const passwordHash = await bcrypt.hash(password, 12)
            if (user)
            {
                const isMatch = await bcrypt.compare(password, user.password)
                if (!isMatch) return res.status(400).json({ msg: "Password is incorrect." })

                const refresh_token = createRefreshToken({ id: user._id })
                res.cookie('refreshtoken', refresh_token, {
                    httpOnly: true,
                    path: '/user/refresh_token',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                })

                res.json({ msg: "Login success!" })
            } else
            {
                const newUser = new Users({
                    name: profile.name, password: passwordHash, email: profile.email
                })

                await newUser.save()

                const refresh_token = createRefreshToken({ id: newUser._id })
                res.cookie('refreshtoken', refresh_token, {
                    httpOnly: true,
                    path: '/user/refresh_token',
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
                })

                res.json({ msg: "Login success!" })
            }
        } catch (err)
        {
            return res.status(500).json({ msg: err.message })
        }
    },
}

//helper functions
const createAccessToken = (user) =>
{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
}
const createRefreshToken = (user) =>
{
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

export default userCtrl