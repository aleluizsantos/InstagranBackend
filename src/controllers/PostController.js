const Post = require('../models/Posts');
const sharp = require('sharp'); 
const path = require('path'); 
const fs = require('fs'); 

//Exportar os objetos que vão ter os método 
module.exports = {

    //Listar os todos os posts em ordem decrescente
    //-------------------------------------------------
    async index(req, res){
        const posts = await Post.find().sort('-createdAt');
        return res.json(posts);
    },
    //Método para criação de novo posts, recebe os atribuitos através do req
    //-------------------------------------------------
    async store ( req, res ) {
        //console.log(req.body);

        //Capturar os dados recebidos do request
        const { author, place, description, hashtags } = req.body;
        const { filename: image } = req.file;

        //Desestruturar o arquivo separando nome da extensão
        const[name] = image.split('.');
        const fileName = `${name}.jpg`;

        //Redimencionar a imagem recebida para tamanho 500pixel, qualidade 70%
        //utilizando a biblioteca Sharp e SALVAR o arquivo na pasta RESIZED
        await sharp(req.file.path)
              .resize(500)
              .jpeg({quality: 70})
              .toFile(path.resolve(req.file.destination, 'resized', fileName))

            //Excluir a imagem orignal enviada
            fs.unlinkSync(req.file.path);

        //Criação do Post
        const post = await Post.create({
            author,
            place,
            description,
            hashtags,
            image: fileName,
        })

        //Após criação do Post emitir alerta a todos usuários 
        //via SOCKET que o post foi criado enviado o post
        req.io.emit('post', post);

        return res.json(post);
    },
    //Método para DELETAR post da aplicação
    async delete(req, res){
        //Localizar  o post a ser excluído
        const post = await Post.findById(req.params.id);

        if(post != null){
            //Exluir a imagem do repositório
            let pathImage = path.resolve(__dirname, '..', '..', 'uploads', 'resized', post.image);
                //Verificar se o arquivo existe no repositóri
                if(fs.existsSync(pathImage)){
                    fs.unlinkSync(pathImage);
                }
            //Exclui o post do banco de dados
            await post.delete();

            //Emitir um alerta via socket informado o post excluido
            req.io.emit('del', post);

            return res.json( post );
            
        } else {
            return res.json( { erro: 'Houve um erro na exclusão do arquivo' } );
        }

        
    }

};//End module exports