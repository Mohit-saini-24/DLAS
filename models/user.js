const mongoose = require('mongoose')

const user_schema = new mongoose.Schema({
    name : String,
    email : String,
    password : String,
    admin : false
})

module.exports = mongoose.model('User', user_schema)