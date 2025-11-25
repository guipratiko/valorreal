const express = require('express');
const router = express.Router();
const placasController = require('../controllers/placasController');

/**
 * @route   GET /api/placas/:placa
 * @desc    Consulta informações de um veículo pela placa
 * @access  Public
 */
router.get('/:placa', placasController.consultarPlaca.bind(placasController));

/**
 * @route   GET /api/placas/precos/buscar
 * @desc    Busca preços médios de um veículo no OLX e Webmotors
 * @access  Public
 * @query   marca, modelo, ano
 */
router.get('/precos/buscar', placasController.buscarPrecos.bind(placasController));

/**
 * @route   GET /api/placas/saldo/consultar
 * @desc    Consulta o saldo disponível de consultas
 * @access  Public
 */
router.get('/saldo/consultar', placasController.consultarSaldo.bind(placasController));

module.exports = router;

