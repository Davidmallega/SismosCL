import { Router } from 'express';
import { resumen, ultimo, porAnio, porMagnitud, top } from '../controllers/sismosController.js';

const router = Router();

router.get('/resumen', resumen);
router.get('/ultimo', ultimo);
router.get('/por-anio', porAnio);
router.get('/por-magnitud', porMagnitud);
router.get('/top', top);

export default router;
