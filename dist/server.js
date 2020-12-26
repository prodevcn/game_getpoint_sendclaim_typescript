"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("./src/config/index"));
const passport_1 = __importDefault(require("passport"));
const routes_1 = __importDefault(require("./src/routes"));
const passport_2 = __importDefault(require("./src/config/passport"));
const app = express_1.default();
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use(passport_1.default.initialize());
passport_2.default(passport_1.default);
mongoose_1.default.connect(index_1.default.DATABASE_URL, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
    console.log('MongoDB successfully connected.');
})
    .catch(err => {
    console.error(err);
});
routes_1.default(app);
// run server
const server = http_1.default.createServer(app);
server.listen(index_1.default.PORT || 3841, () => {
    console.log(`Server up and running on port ${index_1.default.PORT} `);
});
//# sourceMappingURL=server.js.map