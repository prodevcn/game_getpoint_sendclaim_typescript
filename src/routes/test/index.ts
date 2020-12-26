import express, {Request, Response} from 'express';
import assert from 'assert';
import conf from '../../config';
import {random_points, decode_token, setExtraPoints, stopExtra} from '../../utils';
import passport from 'passport';
import {User} from '../../models/user';
import jwt from 'jsonwebtoken';
const router = express.Router();

router.get('/now', (req: Request, res: Response) => {
    const current = Date.now();
    const resData = {
        status: 'success',
        code: 200,
        current_time: current
    };
    res.json(resData);
});

router.post('/register', (req, res) => {
    assert(req.body.name);
    User.find({name: req.body.name})
        .then((users) => {
            if(users.length > 0) {
                const resData = {
                    status: 'error',
                    code: 10001,
                    message: 'username already exists, please use other username'
                };
                res.json(resData);
            } else {
                const payload = {
                    name: req.body.name
                };
                jwt.sign(
                    payload,
                    conf.SECRET_KEY,
                    {
                        expiresIn: 31556926
                    },
                    (err, token) => {
                        const newUser = new User({
                            name: req.body.name,
                            access_token: 'Bearer ' + token
                        });
                        newUser.save()
                            .then(data => {
                                setExtraPoints(req.body.name);
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
                                }
                            })
                    }
                );
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
        })
});

router.get('/me', passport.authenticate('jwt', {session: false}), (req: Request, res: Response) => {
    const token = req.headers.authorization;
    decode_token(token, (decoded: any) => {
        User.findOne({name: decoded.name})
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
    })
});

router.post('/game/play', passport.authenticate('jwt', {session: false}), (req, res) => {
    const token = req.headers.authorization;
    decode_token(token, (decoded: any) => {
        User.findOne({name: decoded.name})
            .then(user => {
                if(user.request_count === 0) {
                    const current = new Date();
                    const addedPoints = random_points();
                    User.updateOne({name: decoded.name}, {requested_time: current, request_count: 1, points: user.points + addedPoints})
                        .then(() => {
                            const resData = {
                                status: 'success',
                                code: 200,
                                points_added: addedPoints,
                                points_total: user.points + addedPoints
                            };
                            res.json(resData);
                        })
                        .catch((err: any) => {
                            console.error(err);
                            const resData = {
                                status: 'success',
                                code: 10002,
                                message: err
                            };
                            res.json(resData);
                        });
                } else if (user.request_count === 5) {
                    const current = new Date();
                    if((current.getTime() - user.requested_time.getTime()) <= 3600000) {
                        const resData = {
                            status: 'error',
                            code: '10001',
                            message: `Error sixth request at ${current}`
                        };
                        res.json(resData);
                    } else {
                        const addedPoints = random_points();
                        User.updateOne({name: decoded.name}, {points: user.points + addedPoints, request_count: 1, requested_time: current})
                            .then((data: any) => {
                                const resData = {
                                    status: 'success',
                                    code: 200,
                                    points_added: addedPoints,
                                    points_total: user.points + addedPoints,
                                };
                                res.json(resData);
                            })
                            .catch((err: any) => {
                                console.error(err);
                                const resData = {
                                    status: 'error',
                                    code: 10002,
                                    message: err
                                };
                                res.json(resData);
                                });
                    }
                } else {
                    const current = new Date();
                    const addedPoints = random_points();
                    User.updateOne({name: decoded.name}, {points: user.points + addedPoints, request_count: user.request_count + 1})
                        .then((data: any) => {
                            const resData = {
                                status: 'success',
                                code: 200,
                                points_added: addedPoints,
                                points_total: user.points + addedPoints,
                            };
                            res.json(resData);
                        })
                        .catch((err: any) => {
                            console.error(err);
                            const resData = {
                                status: 'error',
                                code: 10002,
                                message: err
                            };
                            res.json(resData);
                        })
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
    User.find().sort({points: -1}).limit(10)
        .then(users => {
            const leaders: any[] = [];
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
                decode_token(req.header('authorization'), (decoded: any) => {
                    User.findOne({name: decoded.name})
                        .then(user => {
                            if(user) {
                                User.find({points: {$gte: user.points}}).countDocuments()
                                    .then((val: number) => {
                                        const resData = {
                                            status: 'success',
                                            code: 200,
                                            leaders: {leaders},
                                            current_user_place: val
                                        };
                                        res.json(resData);
                                    })
                                    .catch((err: any) => {
                                        console.error(err);
                                        const resData = {
                                            status: 'error',
                                            code: 10002,
                                            message: err
                                        };
                                        res.json(resData);
                                    });
                            } else {
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
            } else {
                const resData = {
                    status: 'success',
                    code: 200,
                    leaders: {leaders}
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

router.post('/game/claim_bonus', passport.authenticate('jwt', {session: false}), (req, res) => {
    const addedPoints = random_points();
    const token = req.headers.authorization;
    decode_token(token, (decoded: any) => {
        User.findOne({name: decoded.name})
            .then(user => {
                User.updateOne({name: user.name}, {points: (user.points + addedPoints)})
                    .then((data: any) => {
                        stopExtra(user.name);
                        setExtraPoints(user.name);
                        const resData = {
                            status: 'success',
                            code: 200,
                            points_added: addedPoints,
                            points_total: user.points + addedPoints
                        };
                        res.json(resData);
                    })
                    .catch((err: any) => {
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


export default router;


