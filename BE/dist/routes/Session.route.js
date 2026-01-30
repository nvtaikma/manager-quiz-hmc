"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Session_controller_1 = __importDefault(require("../controllers/Session.controller"));
const asynHandler_1 = __importDefault(require("../util/asynHandler"));
const router = express_1.default.Router();
router.get("/:userId", (0, asynHandler_1.default)(Session_controller_1.default.getSessionByUserId));
exports.default = router;
