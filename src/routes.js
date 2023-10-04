const express = require('express');
const contaController = require('./controllers/contaController');
const bancoController = require('./controllers/bancoController');
const transacaoController = require('./controllers/transacaoController')

const routes = express();

routes.get('/contas', bancoController.midlewareAutenticacao, contaController.listarContaBancaria);
routes.get('/contas/saldo', contaController.consultarSaldo)
routes.get('/contas/extrato', contaController.consultarExtrato)

routes.post('/contas', contaController.validaCamposVazios, contaController.validaCamposUnicos, contaController.cadastrarContaBancaria);
routes.put('/contas/:numeroConta/usuario', contaController.validaNumeroConta, contaController.validaCamposVazios, contaController.validaCamposUnicos, contaController.atualizarUsuarioContaBancaria);
routes.delete('/contas/:numeroConta', contaController.validaNumeroConta, contaController.deletarContaBancaria);

routes.post('/transacoes/depositar', transacaoController.depositar);
routes.post('/transacoes/sacar', transacaoController.sacar);
routes.post('/transacoes/transferir', transacaoController.transferir);

module.exports = routes;