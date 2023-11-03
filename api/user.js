const router = require('express').Router()
const bcrypt = require('bcrypt')
const user = require("./../models/user")

router.post("/create-user", (req, res) => {
    let {firstname,lastname,username,password,dateOfBirth} = req.body
    firstname = firstname.trim()
    lastname = lastname.trim()
    username = username.trim()
    password = password.trim()
    dateOfBirth = dateOfBirth.trim()

    if (firstname == "" || lastname == "" || username == "" || password == "" || dateOfBirth == "") {
        res.json({
            status: "failed",
            msg: "Empty input value"
        })
    } else if (!/^[a-zA-z]*$/.test(firstname) || !/^[a-zA-z]*$/.test(lastname)) {
        res.json({
            status: "failed",
            msg: "Invalid firstname or lastname"
        })
    } else if (password.length < 8) {
        res.json({
            status: "failed",
            msg: "Password is too short. atleast 8 characters required"
        })
    } else if (!new Date(dateOfBirth).getTime()) {
        res.json({
            status: "failed",
            msg: "Invalid date of birth"
        })
    } else {
        user.find({username}).then(result => {
            if (result.length) {
                res.json({
                    status: "failed",
                    msg: "Username is already exists"
                })
            } else {
                const saltRound = 10
                bcrypt.hash(password, saltRound).then(hashed => {
                    const newUser = new user({
                        firstname,
                        lastname,
                        username,
                        password: hashed,
                        dateOfBirth: dateOfBirth,
                        createdAt: new Date()
                    })

                    newUser.save().then(result => {
                        res.json({
                            status: "success",
                            msg: "user created",
                            data: result
                        })
                    }).catch(err => {
                        res.json({
                            status: "failed",
                            msg: "Error occurred while saving user account into database"
                        })
                    })
                }).catch(err => {
                    res.json({
                        status: "failed",
                        msg: "Error occurred while hashing password"
                    })
                })
            }
        }).catch(err => {
            res.json({
                status: "failed",
                msg: "Error occurred while checking for existing user"
            })
        })
    }
})

router.post("/edit-user", async(req, res) => {
    let { id, firstname, lastname, dateOfBirth } = req.body
    firstname = firstname.trim()
    lastname = lastname.trim()
    dateOfBirth = dateOfBirth.trim()

    if (firstname == "" || lastname == "" || dateOfBirth == "") {
        res.json({
            status: "failed",
            msg: "Empty input value"
        })
    } else if (!/^[a-zA-z]*$/.test(firstname) || !/^[a-zA-z]*$/.test(lastname)) {
        res.json({
            status: "failed",
            msg: "Invalid firstname or lastname"
        })
    } else if (!new Date(dateOfBirth).getTime()) {
        res.json({
            status: "failed",
            msg: "Invalid date of birth"
        })
    } else {
        const where = {
            _id: id
        }
        const userEditedInfo = {
            firstname: firstname,
            lastname: lastname,
            dateOfBirth: dateOfBirth
        } 

        const updateResponse = await user.updateOne(where, userEditedInfo)
        if (updateResponse.matchedCount === 1 && updateResponse.modifiedCount === 1) {
            res.json({
                status: "success",
                msg: "user updated"
            })
        } else if (updateResponse.matchedCount === 0) {
            res.json({
                status: "failed",
                msg: "User info not found"
            })
        } else if (updateResponse.modifiedCount === 0) {
            res.json({
                status: "failed",
                msg: "Found user info, but nothing has changed"
            })
        }
    }
})

router.post("/login", async(req, res) => {
    const encode = req.headers.authorization.split(' ')[1]
    const authen = Buffer.from(encode, "base64").toString('ascii')
    const username = authen.split(':')[0].trim()
    const password = authen.split(':')[1].trim()
    if (username == "" || password == "") {
        res.json({
            status: "failed",
            msg: "Empty input for username or password"
        })
    } else {
        await user.find({username}).then(data => {
            if (data) {
                const hashed = data[0].password
                bcrypt.compare(password, hashed).then(result => {
                    if (result) {
                        res.json({
                            status: "success",
                            msg: "Login successfully",
                            data: data
                        })
                    } else {
                        res.json({
                            status: "failed",
                            msg: "Invalid password"
                        })
                    }
                }).catch(err => {
                    res.json({
                        status: "failed",
                        msg: "Error occurred while comparing password"
                    })
                })
            } else {
                res.json({
                    status: "failed",
                    msg: "username not found"
                })
            }
        }).catch(err => {
            res.json({
                status: "failed",
                msg: "Error occurred while checking username",
                err: err
            })
        })
    }
})

module.exports = router