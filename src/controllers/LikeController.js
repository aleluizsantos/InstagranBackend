const Post = require('../models/Posts');

module.exports = {
    //Método para acrescetar like no post
    //------------------------------------------------
    async store (req, res ) {
        //Receber como parametro o ID e buscar o like 
        const post = await Post.findById(req.params.id);
        //Acrescentar mais um like no post
        post.likes += 1;
        //salvar o like
        await post.save();
        //Emitir um aviso via socket para os usuários 
        req.io.emit('like', post);
        //Retornar o post
        return res.json( post );
    }

}//END module exports