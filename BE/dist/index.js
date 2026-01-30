"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const errorhandler_1 = require("./util/errorhandler");
const routes_1 = __importDefault(require("./routes"));
const mongodb_1 = __importDefault(require("./dbs/mongodb"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const corsOptions = {
    origin: [
        "http://localhost:3000",
        "https://manager-fe.testhmc.site/",
        "http://157.10.199.146:3001",
        "https://manager-fe.testhmc.site",
        "http://localhost:3001",
    ],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)("dev"));
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.use("/api", routes_1.default);
app.use(errorhandler_1.errorMiddleware);
(0, mongodb_1.default)().then(() => {
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
});
