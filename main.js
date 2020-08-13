const app = require('express')();


app.get('/', (req, res) => {
    res.send('Olá!')
})

app.listen(3000, () => console.log('conectado na porta 3000'))