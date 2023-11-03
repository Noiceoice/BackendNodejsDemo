const mongoose = require('mongoose')
const schema = mongoose.Schema

const userSchema = new schema({
    firstname: String,
    lastname: String,
    username: String,
    password: String,
    dateOfBirth: Date,
    createdAt: Date
})

const user = mongoose.model('users', userSchema)

module.exports = user