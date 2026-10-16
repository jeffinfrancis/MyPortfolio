import { Router } from "express";
import * as ctrl from "../controllers/qualification.controller.js";

const router = Router();

router.route("/").get(ctrl.list).post(ctrl.create).delete(ctrl.removeAll);
router.route("/:id").get(ctrl.getById).put(ctrl.update).delete(ctrl.remove);

export default router;