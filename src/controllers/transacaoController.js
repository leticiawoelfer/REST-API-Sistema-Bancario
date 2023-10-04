const { contas, depositos, saques, transferencias } = require('../bancodedados');
const { format } = require('date-fns');

const mascaraDataHora = "yyyy-MM-dd HH:mm:ss";

function validaInfosDeposito(numConta, valor) {
    if (!numConta || !valor || valor <= 0) {
        return { mensagem: "O número da conta e o valor são obrigatórios!" };
    }
}

function depositar(request, response) {
    const { numero_conta, valor } = request.body;
    let mensagemErro = validaInfosDeposito(numero_conta, valor)
    if (mensagemErro) {
        return response.status(400).json(mensagemErro);
    }
    let contaBancaria = contas.find((conta) => {
        return conta.numero == numero_conta
    })
    if (!contaBancaria) {
        return response.status(400).json({ mensagem: "A conta bancária informada é inexistente!" });
    }
    contaBancaria.saldo += valor;
    depositos.push({
        data: format(new Date(), mascaraDataHora),
        numero_conta,
        valor
    })
    return response.status(200).send();
}

function validaInfosSaque(numConta, valor, senha) {
    let erro = validaInfosDeposito(numConta, valor);
    if (!senha) {
        erro = true;
    }
    if (erro) {
        return { mensagem: "O número da conta, o valor e a senha são obrigatórios!" };
    }
}

function sacar(request, response) {
    const { numero_conta, valor, senha } = request.body;
    let mensagemErro = validaInfosSaque(numero_conta, valor, senha);
    if (mensagemErro) {
        return response.status(400).json(mensagemErro);
    }
    let contaBancaria = contas.find((conta) => {
        return conta.numero == numero_conta
    })
    if (!contaBancaria) {
        return response.status(400).json({ mensagem: "A conta bancária informada é inexistente!" });
    }
    if (contaBancaria.usuario.senha != senha) {
        return response.status(400).json({ mensagem: "Senha incorreta!" });
    }
    if (contaBancaria.saldo < valor) {
        return response.status(400).json({ mensagem: "Saldo insuficiente para realização de saque!" });
    }
    contaBancaria.saldo -= valor;
    saques.push({
        data: format(new Date(), mascaraDataHora),
        numero_conta,
        valor
    })
    return response.status(200).send();
}

function validaInfosTransferencia(numContaOrigem, numContaDestino, valor, senha) {
    let erro = validaInfosSaque(numContaOrigem, valor, senha);
    if (!numContaDestino) {
        erro = true;
    }
    if (erro) {
        return { mensagem: "O número da conta de origem, da conta de destino, o valor e a senha são obrigatórios!" };
    }
}

function transferir(request, response) {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = request.body;
    let mensagemErro = validaInfosTransferencia(numero_conta_origem, numero_conta_destino, valor, senha);
    if (mensagemErro) {
        return response.status(400).json(mensagemErro);
    }
    let contaBancariaOrigem = contas.find((conta) => {
        return conta.numero == numero_conta_origem
    })
    if (!contaBancariaOrigem) {
        return response.status(400).json({ mensagem: "A conta bancária de origem informada é inexistente!" });
    }
    let contaBancariaDestino = contas.find((conta) => {
        return conta.numero == numero_conta_destino
    })
    if (!contaBancariaDestino) {
        return response.status(400).json({ mensagem: "A conta bancária de destino informada é inexistente!" });
    }
    if (contaBancariaOrigem.usuario.senha != senha) {
        return response.status(400).json({ mensagem: "Senha incorreta!" });
    }
    if (contaBancariaOrigem.saldo < valor) {
        return response.status(400).json({ mensagem: "Saldo insuficiente para realização de saque!" });
    }
    contaBancariaOrigem.saldo -= valor;
    contaBancariaDestino.saldo += valor;
    transferencias.push({
        data: format(new Date(), mascaraDataHora),
        numero_conta_origem,
        numero_conta_destino,
        valor
    })
    return response.status(200).send();
}

module.exports = {
    depositar,
    sacar,
    transferir
}