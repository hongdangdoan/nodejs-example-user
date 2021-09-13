module.exports = function(app) {

    app.get('/users/:id', (req, res) => {
        // #swagger.tags = ['User']
        // #swagger.description = 'Endpoint para obter um usuário.'
        // #swagger.parameters['id'] = { description: 'ID do usuário.' }

        /* #swagger.parameters['filtro'] = {
               description: 'Um filtro qualquer.',
               type: 'string'
        } */
        const filtro = req.query.filtro

        if (false)
            return res.status(404).send(false)

        /* #swagger.responses[200] = { 
               schema: { $ref: "#/definitions/User" },
               description: 'Usuário encontrado.' 
        } */
        return res.status(200).send(data)

    })

    app.post('/users', (req, res) => {
        /* #swagger.tags = ['User']
           #swagger.description = 'Endpoint para adicionar um usuário.' */

        /* #swagger.parameters['newUser'] = {
               in: 'body',
               description: 'Informações do usuário.',
               required: true,
               type: 'object',
               schema: { $ref: "#/definitions/AddUser" }
        } */

        const newUser = req.body

        if (true) {
            // #swagger.responses[201] = { description: 'Usuário registrado com sucesso!' }
            return res.status(201).send(data)
        }
        return res.status(500) // #swagger.responses[500]
    })

}