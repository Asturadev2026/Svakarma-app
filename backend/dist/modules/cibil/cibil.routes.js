"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cibil_controller_1 = require("./cibil.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authMiddleware, (req, res, next) => {
    cibil_controller_1.cibilController.getCibilData(req, res, next);
});
exports.default = router;
