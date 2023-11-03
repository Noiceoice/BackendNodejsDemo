require("./config/db")
require("dotenv").config()
const express = require("express")
const port = process.env.APP_PORT
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/user', require('./api/user'))

app.get('/', (req, res) => {
    res.send({ message: 'working'})
})

app.listen(port, () => {
    console.log(`Start server at port ${port}`)
})