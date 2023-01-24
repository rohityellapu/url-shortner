const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlSchema = new Schema({
    url: String,
    clicks: Number,
    shortId: String
});

module.exports = mongoose.model("Url", urlSchema);

