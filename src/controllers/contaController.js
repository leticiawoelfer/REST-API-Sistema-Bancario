const { contas, depositos, saques, transferencias } = require('../bancodedados');

function listarContaBancaria(request, response) {
    return response.status(200).json(contas);
}

function validaCamposVazios(request, response, next) {
    const { nome, cpf, data_nascimento, telefone, email, senha } = request.body;
    if (!nome) {
        return response.status(400).json({ mensagem: "O 'nome' não pode ser vazio" })
    }
    if (!cpf) {
        return response.status(400).json({ mensagem: "O 'cpf' não pode ser vazio" })
    }
    if (!data_nascimento) {
        return response.status(400).json({ mensagem: "A 'data de nascimento' não pode ser vazia" })
    }
    if (!telefone) {
        return response.status(400).json({ mensagem: "O 'telefone' não pode ser vazio" })
    }
    if (!email) {
        return response.status(400).json({ mensagem: "O 'e-mail' não pode ser vazio" })
    }
    if (!senha) {
        return response.status(400).json({ mensagem: "A 'senha' não pode ser vazia" })
    }
    next();
}


function validaCamposUnicos(request, response, next) {
    const { cpf, email } = request.body;
    const existeCpf = contas.find((conta) => {
        return conta.usuario.cpf == cpf;
    });
    const existeEmail = contas.find((conta) => {
        return conta.usuario.email == email;
    });
    if (request.method == 'PUT') {
        let cpfOk, emailOk = false
        if (existeCpf) {
            if (existeCpf.numero == request.params.numeroConta) {
                cpfOk = true
            }
        }
        if (existeEmail) {
            if (existeEmail.numero == request.params.numeroConta) {
                emailOk = true
            }
        }
        if ((cpfOk && emailOk) || (!existeCpf && !existeEmail) || (cpfOk && !existeEmail) || (emailOk && !existeCpf)) {
            return next();
        } else {
            return response.status(400).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" });
        }
    } else {
        if (existeCpf || existeEmail) {
            return response.status(400).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" });
        }
        return next();
    }
}

function cadastrarContaBancaria(request, response) {
    const { nome, cpf, data_nascimento, telefone, email, senha } = request.body;
    contas.push({
        "numero": gerarNumeroConta(),
        "saldo": 0,
        "usuario": {
            "nome": nome,
            "cpf": cpf,
            "data_nascimento": data_nascimento,
            "telefone": telefone,
            "email": email,
            "senha": senha
        }
    })
    return response.status(200).send();
}

function validaNumeroConta(request, response, next) {
    const { numeroConta } = request.params;
    if (!Number(numeroConta)) {
        return response.status(400).json({ mensagem: `O número da conta '${numeroConta}' não é válido.` });
    }
    next();
}

function atualizarUsuarioContaBancaria(request, response) {
    const contaAlterada = contas.find((conta) => {
        return conta.numero == request.params.numeroConta;
    })
    if (contaAlterada) {
        const { nome, cpf, data_nascimento, telefone, email, senha } = request.body;
        contaAlterada.usuario.nome = nome;
        contaAlterada.usuario.cpf = cpf;
        contaAlterada.usuario.data_nascimento = data_nascimento;
        contaAlterada.usuario.telefone = telefone
        contaAlterada.usuario.email = email
        contaAlterada.usuario.senha = senha
        return response.status(200).send();
    }
    return response.status(404).json({ mensagem: "A conta bancária informada é inexistente!" });
}

function deletarContaBancaria(request, response) {
    const contaADeletar = contas.find((conta) => {
        return conta.numero == request.params.numeroConta;
    })
    if (contaADeletar.saldo == 0) {
        contas.splice(contas.indexOf(contaADeletar), 1)
        return response.status(200).send();
    } else {
        return response.status(404).json({ mensagem: "A conta só pode ser removida se o saldo for zero!" })
    }
}

function gerarNumeroConta() {
    if (contas.length == 0) {
        return 1
    }
    return (Number(contas[contas.length - 1].numero) + 1).toString();
}

function verificaCredenciaisConsulta(numConta, senha) {
    if (!numConta || !senha) {
        return { mensagem: "O número da conta e a senha são obrigatórios!" };
    }
}

function consultarSaldo(request, response) {
    const { numero_conta, senha } = request.query;
    let mensagemErro = verificaCredenciaisConsulta(numero_conta, senha);
    if (mensagemErro) {
        return response.status(400).json(mensagemErro);
    }
    let contaBancaria = contas.find((conta) => {
        return conta.numero == numero_conta
    })
    if (!contaBancaria) {
        return response.status(400).json({ mensagem: "Conta bancária não encontada!" });
    }
    if (contaBancaria.usuario.senha != senha) {
        return response.status(400).json({ mensagem: "Senha incorreta!" });
    }
    return response.status(200).json({ saldo: contaBancaria.saldo })
}

function consultarExtrato(request, response) {
    const { numero_conta, senha } = request.query;
    let mensagemErro = verificaCredenciaisConsulta(numero_conta, senha);
    if (mensagemErro) {
        return response.status(400).json(mensagemErro);
    }
    let contaBancaria = contas.find((conta) => {
        return conta.numero == numero_conta
    })
    if (!contaBancaria) {
        return response.status(400).json({ mensagem: "Conta bancária não encontada!" });
    }
    if (contaBancaria.usuario.senha != senha) {
        return response.status(400).json({ mensagem: "Senha incorreta!" });
    }
    const extratoDepositos = depositos.filter((deposito) => { return deposito.numero_conta == numero_conta })
    const extratoSaques = saques.filter((saque) => { return saque.numero_conta == numero_conta })
    const transferenciasEnviadas = transferencias.filter((transf) => { return transf.numero_conta_origem == numero_conta })
    const transferenciasRecebidas = transferencias.filter((transf) => { return transf.numero_conta_destino == numero_conta })

    return response.status(200).json({
        "depositos": extratoDepositos,
        "saques": extratoSaques,
        transferenciasEnviadas,
        transferenciasRecebidas
    })
}

module.exports = {
    listarContaBancaria,
    cadastrarContaBancaria,
    validaCamposVazios,
    validaCamposUnicos,
    atualizarUsuarioContaBancaria,
    validaNumeroConta,
    deletarContaBancaria,
    consultarSaldo,
    consultarExtrato
}