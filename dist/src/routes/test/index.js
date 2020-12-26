"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const assert_1 = __importDefault(require("assert"));
const config_1 = __importDefault(require("../../config"));
const utils_1 = require("../../utils");
const passport_1 = __importDefault(require("passport"));
const user_1 = require("../../models/user");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
router.get('/now', (req, res) => {
    const current = Date.now();
    const resData = {
        status: 'success',
        code: 200,
        current_time: current
    };
    res.json(resData);
});
router.post('/register', (req, res) => {
    assert_1.default(req.body.name);
    user_1.User.find({ name: req.body.name })
        .then((users) => {
        if (users.length > 0) {
            const resData = {
                status: 'error',
                code: 10001,
                message: 'username already exists, please use other username'
            };
            res.json(resData);
        }
        else {
            const payload = {
                name: req.body.name
            };
            jsonwebtoken_1.default.sign(payload, config_1.default.SECRET_KEY, {
                expiresIn: 31556926
            }, (err, token) => {
                const newUser = new user_1.User({
                    name: req.body.name,
                    access_token: 'Bearer ' + token
                });
                newUser.save()
                    .then(data => {
                    utils_1.setExtraPoints(req.body.name);
                    const resData = {
                        status: 'success',
                        code: 200,
                        token: 'Bearer ' + token
                    };
                    res.json(resData);
                })
                    // tslint:disable-next-line: no-shadowed-variable
                    .catch(err => {
                    console.error(err);
                    const resData = {
                        status: 'error',
                        code: 10002,
                        message: err
                    };
                });
            });
        }
    })
        .catch(err => {
        console.error(err);
        const resData = {
            status: 'error',
            code: 10002,
            message: err
        };
        res.json(resData);
    });
});
router.get('/me', passport_1.default.authenticate('jwt', { session: false }), (req, res) => {
    const token = req.headers.authorization;
    utils_1.decode_token(token, (decoded) => {
        user_1.User.findOne({ name: decoded.name })
            .then(user => {
            const resData = {
                status: 'success',
                code: 200,
                name: user.name,
                points: user.points
            };
            res.json(resData);
        })
            .catch(err => {
            console.error(err);
            const resData = {
                status: 'error',
                code: 10002,
                message: err
            };
            res.json(resData);
        });
    });
});
router.post('/game/play', passport_1.default.authenticate('jwt', { session: false }), (req, res) => {
    const token = req.headers.authorization;
    utils_1.decode_token(token, (decoded) => {
        user_1.User.findOne({ name: decoded.name })
            .then(user => {
            if (user.request_count === 0) {
                const current = new Date();
                const addedPoints = utils_1.random_points();
                user_1.User.updateOne({ name: decoded.name }, { requested_time: current, request_count: 1, points: user.points + addedPoints })
                    .then(() => {
                    const resData = {
                        status: 'success',
                        code: 200,
                        points_added: addedPoints,
                        points_total: user.points + addedPoints
                    };
                    res.json(resData);
                })
                    .catch((err) => {
                    console.error(err);
                    const resData = {
                        status: 'success',
                        code: 10002,
                        message: err
                    };
                    res.json(resData);
                });
            }
            else if (user.request_count === 5) {
                const current = new Date();
                if ((current.getTime() - user.requested_time.getTime()) <= 3600000) {
                    const resData = {
                        status: 'error',
                        code: '10001',
                        message: `Error sixth request at ${current}`
                    };
                    res.json(resData);
                }
                else {
                    const addedPoints = utils_1.random_points();
                    user_1.User.updateOne({ name: decoded.name }, { points: user.points + addedPoints, request_count: 1, requested_time: current })
                        .then((data) => {
                        const resData = {
                            status: 'success',
                            code: 200,
                            points_added: addedPoints,
                            points_total: user.points + addedPoints,
                        };
                        res.json(resData);
                    })
                        .catch((err) => {
                        console.error(err);
                        const resData = {
                            status: 'error',
                            code: 10002,
                            message: err
                        };
                        res.json(resData);
                    });
                }
            }
            else {
                const current = new Date();
                const addedPoints = utils_1.random_points();
                user_1.User.updateOne({ name: decoded.name }, { points: user.points + addedPoints, request_count: user.request_count + 1 })
                    .then((data) => {
                    const resData = {
                        status: 'success',
                        code: 200,
                        points_added: addedPoints,
                        points_total: user.points + addedPoints,
                    };
                    res.json(resData);
                })
                    .catch((err) => {
                    console.error(err);
                    const resData = {
                        status: 'error',
                        code: 10002,
                        message: err
                    };
                    res.json(resData);
                });
            }
        })
            .catch(err => {
            console.error(err);
            const resData = {
                status: 'error',
                code: 10002,
                message: err
            };
            res.json(resData);
        });
    });
});
router.get('/leaderboard', (req, res) => {
    user_1.User.find().sort({ points: -1 }).limit(10)
        .then(users => {
        const leaders = [];
        if (users.length !== 0) {
            users.forEach((usr, index) => {
                const user = {
                    name: usr.name,
                    place: index + 1,
                    points: usr.points
                };
                leaders.push(user);
            });
        }
        if (req.header('authorization')) {
            utils_1.decode_token(req.header('authorization'), (decoded) => {
                user_1.User.findOne({ name: decoded.name })
                    .then(user => {
                    if (user) {
                        user_1.User.find({ points: { $gte: user.points } }).countDocuments()
                            .then((val) => {
                            const resData = {
                                status: 'success',
                                code: 200,
                                leaders: { leaders },
                                current_user_place: val
                            };
                            res.json(resData);
                        })
                            .catch((err) => {
                            console.error(err);
                            const resData = {
                                status: 'error',
                                code: 10002,
                                message: err
                            };
                            res.json(resData);
                        });
                    }
                    else {
                        const resData = {
                            status: 'error',
                            code: 10003,
                            message: 'user not exists !'
                        };
                        res.json(resData);
                    }
                })
                    .catch(err => {
                    console.error(err);
                    const resData = {
                        status: 'error',
                        code: 10002,
                        message: err
                    };
                    res.json(resData);
                });
            });
        }
        else {
            const resData = {
                status: 'success',
                code: 200,
                leaders: { leaders }
            };
            res.json(resData);
        }
    })
        .catch(err => {
        console.error(err);
        const resData = {
            status: 'error',
            code: 10002,
            message: err
        };
        res.json(resData);
    });
});
router.post('/game/claim_bonus', passport_1.default.authenticate('jwt', { session: false }), (req, res) => {
    const addedPoints = utils_1.random_points();
    const token = req.headers.authorization;
    utils_1.decode_token(token, (decoded) => {
        user_1.User.findOne({ name: decoded.name })
            .then(user => {
            user_1.User.updateOne({ name: user.name }, { points: (user.points + addedPoints) })
                .then((data) => {
                utils_1.stopExtra(user.name);
                utils_1.setExtraPoints(user.name);
                const resData = {
                    status: 'success',
                    code: 200,
                    points_added: addedPoints,
                    points_total: user.points + addedPoints
                };
                res.json(resData);
            })
                .catch((err) => {
                console.error(err);
                const resData = {
                    status: 'error',
                    code: 10002,
                    message: err
                };
                res.json(resData);
            });
        });
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map