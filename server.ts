import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import conf from './src/config/index';
import passport from 'passport';
import routes from './src/routes';
import passportJWT from './src/config/passport';
const app = express();
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(passport.initialize());
passportJWT(passport);
mongoose.connect(conf.DATABASE_URL, {useUnifiedTopology: true, useNewUrlParser: true})
    .then(()=> {
        console.log('MongoDB successfully connected.');
    })
    .catch(err => {
        console.error(err);
    });

    routes(app);

 // run server
const server = http.createServer(app);
server.listen(conf.PORT||3841, () => {
    console.log(`Server up and running on port ${conf.PORT} `);
});
