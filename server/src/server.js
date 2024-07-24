import express, { json } from 'express'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import User from '../Schema/User.js'
import connectDB from '../config/db.js'
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken'
import cors from 'cors'
import multer from 'multer'
import admin from 'firebase-admin'
import { Client } from '@notionhq/client';
import { getAuth } from 'firebase-admin/auth'
import serviceAccountKey from '../blog-app-9ffa1-firebase-adminsdk-9vre4-4132d58f69.json' assert { type: "json" };
import Blog from '../Schema/Blog.js';
import axios from 'axios';

const app = express()

dotenv.config();
connectDB();

app.use(json())
app.use(cors())

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const generateUploadURL = async (file) => {
    const bucket = admin.storage().bucket();
    const blob = bucket.file(file.originalname);
    const token = nanoid(124);

    const metadata = {
        metadata: {
            firebaseStorageDownloadTokens: token,
        },
        contentType: file.mimetype,
        cacheControl: 'public, max-age=31536000',
    };

    return new Promise((resolve, reject) => {
        const blobStream = blob.createWriteStream({ metadata });

        blobStream.on('error', (error) => {
            reject(error);
        });

        blobStream.on('finish', () => {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media&token=${token}`;
            resolve(imageUrl);
        });

        blobStream.end(file.buffer);
    });
};

app.post('/get-upload-url', upload.single('file'), async (req, res) => {
    try {
        console.log('Received request:', req.body);
        console.log('Received file:', req.file);

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const url = await generateUploadURL(req.file);

        if (!url) {
            return res.status(500).json({ message: 'Failed to generate upload URL' });
        }

        res.status(200).json({ uploadURL: url });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Failed to upload image', error: error.message });
    }
});

const generateUsername = async (email) => {
    const username = email.split('@')[0];

    const checkUser = await User.findOne({ "personal_info.username": username });

    if (checkUser) {
        return `${username}${nanoid(5)}`
    } else {
        return username;
    }
}

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        return res.status(401).json({ error: "Now access token!" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Access token is invalid!" })
        }

        req.user = user.id
        next()
    })
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

app.post('/signup', upload.none(), async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        console.log(req.body)

        if (!fullname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (fullname.length < 3) {
            return res.status(403).json({ message: "Fullname must be at least 3 characters" })
        }

        if (!emailRegex.test(email)) {
            return res.status(403).json({ message: "Invalid email" })
        }

        if (!passwordRegex.test(password)) {
            return res.status(403).json({ message: "Password must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters" })
        }

        const checkUser = await User.findOne({ "personal_info.email": email });

        if (checkUser) {
            return res.status(403).json({ message: "User already exists" })
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

app.post('/login', upload.none(), async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const user = await User.findOne({ "personal_info.email": email });

        if (!user) {
            return res.status(403).json({ message: "User not found" })
        }

        if (user.google_auth) {
            return res.status(403).json({ message: "This email was signed up with google. Please log in with google" })
        }

        const isPasswordValid = bcrypt.compare(password, user.personal_info.password);

        if (!isPasswordValid) {
            return res.status(403).json({ message: "Invalid password" })
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

app.post("/google-auth", upload.none(), async (req, res) => {
    let { access_token } = req.body;

    getAuth()
        .verifyIdToken(access_token)
        .then(async (decodedUser) => {
            let { email, name, picture } = decodedUser;

            picture = picture.replace('s96-c', 's384-c');

            let user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.profile_img personal_info.username google_auth").then((user) => {
                return user || null;
            })
                .catch((error) => {
                    return res.status(500).json({ message: "Error logging in", error: error.message })
                })

            if (user) {
                if (!user.google_auth) {
                    return res.status(403).json({ message: "This email was signed up without google. Please log in using email and password" })
                }

                return res.status(200).json({
                    message: "User logged in successfully",
                    user: formatDataToSend(user)
                })
            } else {
                let username = await generateUsername(email);

                user = new User({
                    personal_info: {
                        fullname: name,
                        email,
                        profile_img: picture,
                        username
                    },
                    google_auth: true
                })

                await user.save().then((u) => {
                    user = u;
                })
                    .catch((error) => {
                        return res.status(500).json({ message: "Error logging in", error: error.message })
                    })
            }

            return res.status(200).json(formatDataToSend(user))
        })
        .catch((error) => {
            return res.status(500).json({ message: "Failed to authenticate with google, try with another account!", error: error.message })
        })
})

app.post('/latest-blogs', (req, res) => {

    let { page } = req.body;

    let maxLimit = 5;

    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({
                blogs
            })
        })
        .catch(error => {
            return res.status(500).json({
                message: error.message
            })
        })
})

app.post('/all-latest-blogs-count', (req, res) => {
    Blog.countDocuments({ draft: false })
    .then(count => {
        return res.status(200).json({ totalDocs: count });
    })
    .catch(error => {
        console.log(error.message);
        return res.status(500).json({ error: error.message })
    })
})

app.get('/trending-blogs', (req, res) => {
    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "activity.total_reads": -1, "activity.total_likes": -1, "publishedAt": -1 })
        .select("blog_id title publishedAt -_id")
        .limit(5)
        .then(blogs => {
            return res.status(200).json({
                blogs
            })
        })
        .catch(error => {
            return res.status(500).json({ error: error.message })
        })
})

app.post('/search-blogs', (req, res) => {
    let { tag, page, query } = req.body;

    let findQuery;

    if(tag){
        findQuery = { tags: tag, draft: false }
    } else {
        findQuery = { draft: false, title: new RegExp(query, 'i')}
    }

    let maxLimit = 5;

    Blog.find(findQuery)
        .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title des banner activity tags publishedAt -_id")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({
                blogs
            })
        })
        .catch(error => {
            return res.status(500).json({
                message: error.message
            })
        })
})

app.post('/search-blogs-count', (req, res) => {
    let { tag, query } = req.body;

    let findQuery;

    if(tag){
        findQuery = { tags: tag, draft: false }
    } else {
        findQuery = { draft: false, title: new RegExp(query, 'i')}
    }
    
    Blog.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({ totalDocs: count })
    })
    .catch(error => {
        console.log(error.message);
        return res.status(500).json({ error: error.message })
    })
})

app.post("/search-users", (req, res) => {
    let { query } = req.body;

    User.find({ "personal_info.username": new RegExp(query, 'i') })
    .limit(20)
    .select("personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .then(users => {
        return res.status(200).json({ users })
    })
    .catch(error => {
        return res.status(500).json({ error: error.message })
    }) 
})

app.post('/create-blog', verifyJWT, (req, res) => {
    let authorId = req.user;

    let { title, des, banner, tags, content, draft } = req.body;

    if (!title.length) {
        return res.status(403).json({ error: "You must provide a title." })
    }

    if (!draft) {
        if (!des.length || des.length > 200) {
            return res.status(403).json({ error: "You must provide blog description under 200 characters." })
        }

        if (!banner.length) {
            return res.status(403).json({ error: "You must provide blog banner to publish it." })
        }

        if (!content.blocks.length) {
            return res.status(403).json({ error: "Write some content in the blog to publish it." })
        }

        if (!tags.length || tags.length > 10) {
            return res.status(403).json({ error: "Provide a maximum of 10 tags to publish the blog." })
        }
    }

    tags = tags.map(tag => tag.toLowerCase());

    let blog_id = title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    let blog = new Blog({
        title,
        des,
        banner,
        content,
        tags,
        author: authorId,
        blog_id,
        draft: Boolean(draft)
    })

    blog.save().then(blog => {
        let incrementVal = draft ? 0 : 1;

        User.findOneAndUpdate({ _id: authorId }, { $inc: { "account_info.total_posts": incrementVal }, $push: { "blogs": blog._id } })
            .then(user => {
                return res.status(200).json({ id: blog.blog_id })
            })
            .catch(err => {
                return res.status(500).json({ error: "Failed to update total posts number." })
            })
    })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})

const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
