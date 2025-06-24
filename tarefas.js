const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const port = 3000;

const alunoPath = path.join(__dirname, 'tarefas.html');
const tarefasPath = path.join(__dirname, 'tarefas.json');

let tarefas = JSON.parse(fs.readFileSync(tarefasPath, 'utf-8'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function buscarTarefaPorNome(nome) {
    return tarefas.find(tarefa =>
        tarefa.nome && tarefa.nome.toLowerCase() === nome.toLowerCase()
    );
}

function salvarDados() {
    fs.writeFileSync(tarefasPath, JSON.stringify(tarefas, null, 2));
}

app.get('/', (req, res) => {
    res.sendFile(alunoPath);
});

app.post('/', (req, res) => {
    const novaTarefa = req.body;

    if (!novaTarefa.nome) {
        res.send('<h1>O campo nome é obrigatório.</h1>');
        return;
    }

    if (tarefas.find(tarefa => tarefa.nome && tarefa.nome.toLowerCase() === novaTarefa.nome.toLowerCase())) {
        res.send('<h1>Essa tarefa já existe.</h1>');
        return;
    }

    tarefas.push(novaTarefa);
    salvarDados();

    res.send('<h1>Tarefa adicionada com sucesso!</h1>');
});

app.get('/buscar', (req, res) => {
    res.sendFile(path.join(__dirname, 'buscar.html'));
});

app.get('/atualizar', (req, res) => {
    res.sendFile(path.join(__dirname, 'atualizar.html'));
});

app.post('/atualizar', (req, res) => {
    const { titulo, novoTitulo, novaDesc } = req.body;

    const tarefasIndex = tarefas.findIndex(tarefa => tarefa.nome && tarefa.nome.toLowerCase === nome.toLowerCase());

    if (tarefasIndex === -1) {
        res.send('<h1>Tarefa não encontrada</h1>');
        return;
    }

    tarefas[tarefasIndex].descricao = novaDescricao;
    tarefas[tarefasIndex].urlInfo = novaUrlInfo;

    salvarDados();

    res.send('<h1>Tarefa foi atualizada com sucesso!</h1>');
});

app.get('/excluir', (req, res) => {
    res.sendFile(path.join(__dirname, 'excluir.html'));
});

app.post('/excluir', (req, res) => {
    const { nome } = req.body;

    const tarefasIndex = tarefas.findIndex(tarefa => tarefa.nome && tarefa.nome.toLowerCase() === nome.toLowerCase());

    if (tarefasIndex === -1) {
        res.send('<h1>Tarefa não encontrada</h1>');
        return;
    }

    res.send(`
        <script>
        if (confirm('Tem certeza de que deseja excluir a tarefa ${nome}?')) {
            window.location.href = '/excluir-confirmado?nome=${nome}';
        } else {
            window.location.href = '/excluir';
        }
        </script>
    `);
});

app.get('/excluir-confirmado', (req, res) => {
    const nome = req.query.nome;

    const tarefasIndex = tarefas.findIndex(tarefa => tarefa.nome && tarefa.nome.toLowerCase() === nome.toLowerCase());

    if (tarefasIndex === -1) {
        res.send('<h1>Tarefa não encontrada</h1>');
        return;
    }

    tarefas.splice(tarefasIndex, 1);
    salvarDados();

    res.send(`<h1>A tarefa ${nome} foi excluída com sucesso!</h1>`);
});

app.get('/tarefas', (req, res) => {
    res.json(tarefas);
});

app.get('/buscar-tarefa/:nome', (req, res) => {
    const nomeDaTarefaBuscada = req.params.nome;
    const tarefaEncontrada = buscarTarefaPorNome(nomeDaTarefaBuscada);

    if (tarefaEncontrada) {
        const templatePath = path.join(__dirname, 'listar.html');
        const templateData = fs.readFileSync(templatePath, 'utf-8');
        const html = templateData
            .replace('{{nome}}', tarefaEncontrada.nome)
            .replace('{{desc}}', tarefaEncontrada.descricao)
            .replace('{{url_info}}', tarefaEncontrada.urlInfo);

        res.send(html);
    } else {
        res.send('<h1>Tarefa não encontrada.</h1>');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

