const { banco } = require('../bancodedados')

function midlewareAutenticacao(request, response, next) {
    if (request.query.senha_banco !== banco.senha) {
        return response.status(400).json({ "mensagem": "A senha do banco informada é inválida!" });
    }
    next();
}

module.exports = {
    midlewareAutenticacao
}