const express = require('express');
const mongosse = require('mongoose');
const path = require('path');
const cors = require('cors');

require('dotenv').config();

const app = express();

//Fazer com que a aplicação ousa tanto o protocolo http quanto socket
const server = require('http').Server(app);
const io = require('socket.io')(server);

//Conexão com o banco de dados
mongosse.connect(
    process.env.MONGO_URL,
    {
    useNewUrlParser: true,
}) 

//Criar um middleware para interceptar as requisições e transmitir 
//ao protocolo socket.io
app.use((req, res, next) => {
    req.io = io;
    next();
})

app.use(cors());
app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads', 'resized')))
app.use(require('./routes'))

server.listen(process.env.PORT || 4000, function() {
    console.log('..::Servidor online::..')
});