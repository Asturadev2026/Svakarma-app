"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_1 = require("./user.service");
class UserController {
    async getProfile(req, res, next) {
        try {
            const userId = req.userId;
            const profile = await user_service_1.userService.getProfile(userId);
            return res.json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfile(req, res, next) {
        try {
            const userId = req.userId;
            const { personalDetails, businessDetails } = req.body;
            const updatedProfile = await user_service_1.userService.updateProfile(userId, personalDetails, businessDetails);
            return res.json({
                success: true,
                message: 'Profile updated successfully!',
                data: updatedProfile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async checkOnboarding(req, res, next) {
        try {
            const userId = req.userId;
            const { prisma } = await Promise.resolve().then(() => __importStar(require('../../shared/prisma')));
            const profile = await prisma.businessProfile.findUnique({
                where: { userId },
            });
            return res.json({
                success: true,
                onboardingComplete: !!profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
