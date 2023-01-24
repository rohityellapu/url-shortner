const express = require('express')
const app = express()
const ejsMate = require('ejs-mate')
const path = require('path');
require('dotenv').config();
const dbUrl = process.env.DB_URL;
const PORT = process.env.PORT;
const mongoose = require('mongoose');
mongoose.connect(dbUrl, () => console.log("Database Connected"))

const Url = require('./models/Url');
const ShortUniqueId = require('short-unique-id');
const URL = require("url").URL;

const stringIsAValidUrl = (s) => {
    try {
        new URL(s);
        return true;
    } catch (err) {
        return false;
    }
};


app.use(express.json());
app.use(express.urlencoded({ extended: true }))
// Set ejs engine for rendering ejs pages at client side
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');

// Set all html/ejs view files in views directory
app.set('views', path.join(__dirname, 'views'))


app.get('/', (req, res) => {
    res.render('index.ejs', { err: null, url: null })
})

app.post('/', async (req, res) => {
    const { url } = req.body;
    if (stringIsAValidUrl(url)) {

        if (!url) res.render('index.ejs', { err: "Please enter a valid url.", url: null })
        // Check if it is already there
        let oldUrl = await Url.findOne({ url: url })
        if (oldUrl) {
            res.render('index.ejs', {
                url: req.protocol + '://' + req.get('host') + req.originalUrl + oldUrl.shortId, err: null
            })
        }
        else {
            try {
                let newShortId = new ShortUniqueId({ length: 10 })()
                console.log(newShortId);
                let newUrl = new Url({
                    url: url,
                    clicks: 0,
                    shortId: newShortId
                })
                await newUrl.save()
                res.render('index.ejs', { url: req.protocol + '://' + req.get('host') + req.originalUrl + newShortId, err: null })
            }
            catch (err) {
                res.render('index.ejs', { err: err.message, url: null });
            }
        }
    }
    else {
        res.render('index.ejs', { err: "Please enter a valid url.", url: null })
    }
})

app.get('/:id', async (req, res) => {
    const { id } = req.params;
    let url = await Url.findOne({ shortId: id });
    if (url) {

        res.redirect(url.url);
    }
    else {

        res.render('index.ejs', { err: "Please enter a valid url.", url: null })
    }
})

app.get('*', (req, res) => {
    res.render('index.ejs', { err: 'Page not found.', url: null })
})

app.listen(PORT, () => console.log('Server is running on port', PORT))

