const http = require('http')
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, "data")

function apiGet(req, res) {
    fs.readdir(DATA_DIR, (err, files) => {
        if(err) throw err

        const filesNoExt = files.map(f => f.replace('.json', ""))

        res.write(JSON.stringify(filesNoExt))
        res.end()
    })
}

function apiIdGet(req, res) {
    const fileName = req.url.split('/')[2]
    const file = path.join(DATA_DIR, fileName) + '.json'

    fs.readFile(file, (err, json) => {
        if (err) throw err
        else if(json) res.write(json.toString())
        res.end()
    })
    
}

function apiIdPost(req, res) {
    const fileName = req.url.split('?name=')[1]
    const file = path.join(DATA_DIR, fileName) + '.json'

    let data = []

    req.on("data", chunk => data.push(chunk))
    req.on("end", () => {
        const body = Buffer.concat(data).toString()
        fs.writeFile(file, body, err => {
            if (err) throw err
            res.write(body)
            res.end()
        })
    })
}

function handleServer(req, res) {

    res.writeHeader(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    })

    if(req.url === '/api'){
        apiGet(req, res)
    }else if(req.url.indexOf('/api') > -1 && req.method === 'GET'){
        apiIdGet(req, res)
    }else if(req.url.indexOf('/api') > -1 && req.method === 'POST'){
        apiIdPost(req, res)
    }else{
        res.end(`No route ${req.url} found`)
    }
}

http.createServer(handleServer).listen(3001)