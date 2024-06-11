import express, { json } from 'express'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import User from './Schema/User.js';
import connectDB from './config/db.js';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken'
import cors from 'cors'
import multer from 'multer'

const app = express()

dotenv.config();
connectDB();

app.use(json())
app.use(cors())

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

const generateUsername = async(email) => {
    const username = email.split('@')[0];

    const checkUser = await User.findOne({ "personal_info.username": username });

    if (checkUser) {
        return `${username}${nanoid(5)}`
    }    else {
        return username;
    }
}

const formatDataToSend = (user) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return {
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
        access_token: token
    }
}

app.post('/signup', upload.none(), async(req, res) => {
    try {
        const { fullname, email, password } = req.body;

        console.log(req.body)

        if (!fullname || !email || !password) {
            return res.status(400).json({message: "All fields are required"})
        }

        if(fullname.length < 3) {
            return res.status(403).json({message: "Fullname must be at least 3 characters"})
        }

        if (!emailRegex.test(email)) {
            return res.status(403).json({message: "Invalid email"})
        }

        if (!passwordRegex.test(password)) {
            return res.status(403).json({message: "Password must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters"})
        }

        const checkUser = await User.findOne({ "personal_info.email": email });

        if (checkUser) {
            return res.status(403).json({message: "User already exists"})
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let username = await generateUsername(email);

        const user = new User({
            personal_info: {
                fullname,
                email,
                password: hashedPassword,
                username
            }
        })

        await user.save();

        res.status(200).json({
            message: "User created successfully",
            user: formatDataToSend(user)
        })

    } catch (error) {
        res.status(500).json({
            message: "Error creating user",
            error: error.message
        })
    }
})

app.post('/login', upload.none(), async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({message: "All fields are required"})
        }

        const user = await User.findOne({ "personal_info.email": email });

        if (!user) {
            return res.status(403).json({message: "User not found"})
        }

        const isPasswordValid = bcrypt.compare(password, user.personal_info.password);

        if (!isPasswordValid) {
            return res.status(403).json({message: "Invalid password"})
        }

        res.status(200).json({
            message: "User logged in successfully",
            user: formatDataToSend(user)
        })

    } catch (error) {
        res.status(500).json({
            message: "Error logging in",
            error: error.message
        })
    }
})

const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})