"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cibilController = exports.CibilController = void 0;
const cibil_service_1 = require("./cibil.service");
class CibilController {
    async getCibilData(req, res, next) {
        try {
            const userId = req.userId;
            const generate = req.query.generate === 'true';
            const data = await cibil_service_1.cibilService.getCibilData(userId, generate);
            return res.json({
                success: true,
                data,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CibilController = CibilController;
exports.cibilController = new CibilController();
