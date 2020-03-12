const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')

const port = 8080
const app = express()
const secretKey = 'thisisverysecretkey'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.listen(port, () => {
    console.log('tersambung di ' + port)
})

const koneksi = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'lat-ukl-mrz'
})

koneksi.connect((err) => {
    if (err) throw err
    console.log('database tersambung...')
})

//authorization
const isAuthorized = (req, res, next) => {
    if (typeof (req.headers['x-api-key']) == 'undefined') {
        return res.status(403).json({
            success: false,
            message: 'Unauthorized, Token not provided'
        })
    }

    let token = req.headers['x-api-key']

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized, Token Invalid'
            })
        }
    })

    next()
}

app.get('/yoi', isAuthorized, (req, res) => {
    res.end('yoi')
})

app.post('/login', (req, res) => {
    let data = req.body

    if (data.username == 'admin' && data.password == 'admin') {
        let token = jwt.sign(data.username + '|' + data.password, secretKey)
        res.json({
            success: true,
            message: 'Selamat Datang Admin BUAHHH',
            token: token
        })
    }
})

//CRUD Tabel Buah - Admin Penjual
app.get('/buah', isAuthorized, (req, res) => {
    let sql = `select * from buah`
    koneksi.query(sql, (err, result) => {
        if (err) throw err
        res.json({
            success: true,
            message: 'Menampilkan Buah',
            data: result
        })
    })
})

app.post('/buah', isAuthorized, (req, res) => {
    let data = req.body
    let sql = `
        insert into buah (nama_buah, harga, stok)
        values('`+ data.nama_buah + `','` + data.harga + `','` + data.stok + `')
        `
    koneksi.query(sql, (err, result) => {
        if (err) throw err
        res.json({
            success: true,
            message: 'Penambahan berhasil!'
        })
    })
})

app.put('/buah/:id', isAuthorized, (req, res) => {
    let data = req.body

    let sql = `
        update buah
        set nama_buah = '`+ data.nama_buah + `', harga = '` + data.harga + `', stok = '` + data.stok + `'
        where id = `+ request.params.id + `
    `

    koneksi.query(sql, (err, result) => {
        if (err) throw err
    })

    res.json({
        success: true,
        message: 'Buah Updated'
    })

})

app.delete('/buah/:id', isAuthorized, (req, res) => {
    let sql = `
        delete from buah where id = `+ request.params.id + `
    `

    koneksi.query(sql, (err, res) => {
        if (err) throw err
    })

    res.json({
        success: true,
        message: 'Buah Deleted'
    })
})
