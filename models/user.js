const mongoose = require('mongoose')

const user_schema = new mongoose.Schema({
    name : String,
    email : String,
    password : String,
    admin : false,
    playMoney : Number
})

module.exports = mongoose.model('User', user_schema)