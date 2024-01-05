const express = require('express'); // Node.js için web uygulaması oluşturmaya yarayanmodül.
const bodyParser = require('body-parser'); // Gelen istekleri ayrıştıran modül.
const fs = require('fs'); // Dosya yollarını bulmaya yarayan, okumaya ve yazmaya yarayan modül.
const cors = require('cors'); // Diğer kaynaklar arasında paylaşım yapmaya yarayan modül.

const app = express()
app.use(cors()) // Express frameworkünü kullanarak farklı kaynaktan gelen istekleri onaylar


app.use(bodyParser.json({ extended: true })) // HTTP isteklerinden gelen bu veriyi JSON olarak dönüştürmek için kullanılır.
app.use(bodyParser.urlencoded({ extended: true })) // URL şifreli verileri işlemek için kullanılır.

app.get('/types', (req, res) => {
    let data = fs.readFileSync('./type.json', { encoding: 'utf-8' })
    res.status(200).send(JSON.parse(data))
})

app.post('/types', (req, res) => {
    fs.writeFileSync('./type.json', JSON.stringify(req.body, null, 2), 'utf-8');
    res.status(200).send('ok');
});

app.listen(3000, () => 
console.log('listening 3000!'))