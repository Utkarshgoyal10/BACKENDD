const router = require("express").Router();
const jwt = require('jsonwebtoken');
const message = require('../Helpers/messaging').message;
const User = require('../Database/Models/model.js').user;
const Otp = require('../Database/Models/model.js').otp;
const helpers = require('../Helpers/helpers.js');
const middleware = require('../Helpers/auth-middleware').session;
const upload = require('./multer')
const cloudinary = require('./cloudinary')
const fs = require('fs')
// TO SIGNUP USER
router.post('/signup', upload.any('image'), async (request, response) => {
    console.log(request.body)
    const uploader = async (path) => await cloudinary.uploads(path, 'ProfileImage');
    const urls = []
    const files = request.files;
    console.log('file ', files)
    for (const file of files) {
        const { path } = file;
        const newPath = await uploader(path)
        urls.push(newPath)
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.unlinkSync(path)
    }

    if (!helpers.emailValidate(request.body.email)) {
        response.status(200).json({
            err: 'There was error validating your email id',
            validEmail: false
        });
    } 
    else {
                    const profile = new User({
                        NAME: request.body.name,
                        EMAIL: request.body.email,
                        PASSWORD: helpers.hashAndReturn(request.body.password),
                        PROFESSION: request.body.profession,
                        CITY: request.body.city,
                        STATE: request.body.state,
                        PROFILE_PIC: urls[0].url,
                        PROFILE_PIC_ID: urls[0].id,
                        PHONE_NUMBER: request.body.phoneNumber
                    });
                    profile.save((err) => {
                        if (err) {
                            if (err.code === 11000) {
                                response.status(200).json({
                                    err: 'The given email id is already registered with us',
                                    alreadyRegistered: true
                                });
                            } else {
                                response.status(500).json({
                                    err: 'There was some error signing you up',
                                });
                            }
                        } else {
                            message(request.body.phoneNumber, `Welcome to women, ${request.body.name}, Thank you for joining us in this initiative.`)
                                .then(res => {
                                    response.status(200).json({
                                        message: 'You were successfully signed up',
                                        msgSent : true
                                    });
                                })
                                .catch(err => {
                                    response.status(200).json({
                                        message: 'You were successfully signed up',
                                        msgSent : false
                                    });
                                })
                        }
                    });
    }
})

// TO LOGIN USER
router.post('/login', (request, response) => {
    User.findOne({
        EMAIL: request.body.email,
    }, (err, data) => {
        if (err) {
            response.status(500).json({
                err: 'There was error fetching the details',
            });
        } else if (data == null) {
            response.status(200).json({
                err: 'No such user exist try signing up first',
                noSuchUser: true,
            });
        } else {
            if ((helpers.passwordAuth(data.PASSWORD, request.body.password))) {
                const payload = {
                    email: request.body.email,
                    name: data.NAME,
                    profile_pic: data.PROFILE_PIC,
                    city: data.CITY,
                    state: data.STATE,
                    phoneNumber: data.PHONE_NUMBER,
                    profession: data.PROFESSION
                };
                const token = jwt.sign(payload, process.env.PW_SECRET);
                response.status(200).json({
                    token,
                    message: 'Success, the password matched successfully',
                });
                return true;
            } else {
                response.status(200).json({
                    err: 'The password entered by the user was wrong',
                    wrongPassword: true
                });
            }
        }
    });
});

// TO DELETE ACCOUNT
router.delete('/deleteaccount',middleware, (request, response) => {
    User.findOneAndRemove({EMAIL: request.decode.email})
        // product and services 
        .then(res => {
            response.status(200).json({
                message: 'Your profile was successfully deleted'
            })
        })
        .catch(err => {
            response.status(200).json({
                err: 'There was some error while deleting your profile'
            })
        })
})

router.get('/contact',middleware, async (request, response) => {
    response.json(request.User);
  });

// FORGOT PASSWORD
router.post('/forgotpw', (request, response) => {
    const password = helpers.createPassword(8);
    User.findOne({
        EMAIL: request.body.email,
    }, (err, data) => {
        if (err) {
            response.status(500).json({
                err: 'There was error fetching the details',
            });
        } else if (data == null) {
            response.status(200).json({
                noSuchUser: true,
                err: 'No such user exist try signing up first',
            });
        } else {
                    User.findOneAndUpdate({
                        EMAIL: request.body.email,
                    }, {
                        PASSWORD: helpers.hashAndReturn(password),
                    }, (err, data) => {
                        if (err) {
                            response.status(500).json({
                                err: 'There was error fetching the details',
                            });
                        } else if (data == null) {
                            response.status(200).json({
                                err: 'No such user exist try signing up first',
                                noSuchUser: true
                            });
                        } else {
                            response.status(200).json({
                                message: 'Password reset successful',
                                msgSent : true
                            });
                        }
                    });
        }
    })
})

// TO CHECK THE TOKEN, IF THE USER LOGGEDIN OR NOT
router.get('/isloggedin', middleware, (request, response) => {
    response.status(200).json({
        isloggedin: true,
        profile_pic: request.decode.profile_pic,
        name: request.decode.name,
        email: request.decode.email,
        message: 'The user is logged in'
    })
})


module.exports = router;
