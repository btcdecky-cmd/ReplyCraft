import { Router, type IRouter } from "express";
import healthRouter from "./health";
import messageBuilderRouter from "./message-builder";

const router: IRouter = Router();

router.use(healthRouter);
router.use(messageBuilderRouter);

export default router;
