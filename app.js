express = require('express')
let path = require('path')
let lanes = require("./routes/lanes.js")
let admin = require("./routes/admin.js")
let Wettkampf = require('./modules/wettkampf.js')
var app = express();
let mustache = require('mustache-express')
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);
const fs = require('fs');
var port = 8080;

app.engine('html', mustache());
app.use(express.static(path.join(__dirname, 'public'), {index: 'login.html'}))
app.use(express.urlencoded({extended: true}))
app.use(express.urlencoded({extended: false}))

app.use(express.json())

app.use('/lane', lanes)
app.use('/admin', admin)

let wettkampfDaten = loadBackup()
let socketData = []

function sendNext(socket) {
    let bahn = socketData[socket.id].bahn
    let wk = socketData[socket.id].wettkampf

    let start = wettkampfDaten[wk].getCurrentStart(bahn)
    if (start !== false) {
        start = JSON.stringify(start)
        console.log('sending next: ' + start)
        socket.emit('next', start)
    }
}

function sendError(socket, error){
    console.log('sending Error: ' + error)
    socket.emit('error', error)
}

function sendStart(socket, start){
    start = JSON.stringify(start)
    console.log('sending start: ' + start)
    socket.emit('selectedStart', start)
}

function sendStructure(socket) {
    let bahn = socketData[socket.id].bahn
    let wk = socketData[socket.id].wettkampf

    let structure = wettkampfDaten[wk].getStructure(bahn)
    if (structure !== false) {
        structure = JSON.stringify(structure)
        console.log('sending structure: ' + structure)
        socket.emit('structure', structure)
    }
}

io.on('connection', (socket) => {
    log('sckt connection: ' + socket.id)
    socket.on('register', (msg) => {
        log('sckt register: ' + msg)
        try {
            let data = JSON.parse(msg)
            if (wettkampfDaten[data.wettkampf].password === data.password) {
                socketData[socket.id] = {
                    bahn: data.bahn,
                    wettkampf: data.wettkampf
                }
                sendNext(socket)
                sendStructure(socket)
                console.log('user registered')
            } else {
                console.log('Wrong Password')
            }
        } catch (e) {
            console.error('Error while registering user: ' + e)
        }
    })

    socket.on('zeit', (msg) => {
        log('Sckt Zeit: ' + msg)
        let data = JSON.parse(msg)
        if (socketData[socket.id]) {
            let result = wettkampfDaten[socketData[socket.id].wettkampf].addTime(data['data'], data['signature'])
            if(result === 1){
                sendNext(socket)
                handleData(msg, socketData[socket.id].wettkampf)
            }else{
                sendError(socket, result)
            }
        } else {
            log('Error Socket not found')
        }
    });

    socket.on('selectLauf',(msg)=>{
        log('[INFO] Got selectLauf: '+ msg)
        let data = JSON.parse(msg)
        let start = wettkampfDaten[socketData[socket.id].wettkampf].getStart(socketData[socket.id].bahn,data['wk'],data['lauf'])
        sendStart(socket, start)
    })

    socket.on('nextLauf', (msg)=>{
        sendNext(socket)
    })
});

function handleData(msg, wettkampf) {
    fs.writeFileSync(path.join(__dirname, 'Backup.json'), JSON.stringify(wettkampfDaten))
    fs.writeFileSync(path.join(__dirname, 'Zeiten') + '\\' + wettkampf + '.json', msg + "\n", {flag: 'a+'})
}

io.of("/admin").on("connection", function (socket) {
    socket.on('neuerWettkampf', (message) => {
        let data = JSON.parse(message)
        if (data['wk_name'] === undefined) {
            return false
        }
        wettkampfDaten[data['wk_name']] = new Wettkampf(data['wk_name'], data['password'], {}, {}, {})
    })

    socket.on('neuerStart', (message) => {
        let data
        try {
            data = JSON.parse(message)

            let start_data = data['start']
            console.log('[INFO] adding Start: ' + start_data)
            wettkampfDaten[data.wettkampf].addStart(start_data)
            //addStart(data.wettkampf, start_data)
        } catch (e) {
            socket.emit('error', 'error: ' + e)
            console.log('error: ' + e)
            wettkampfDaten[data.wettkampf] = []
        }
    })
    socket.on('uploaded', (message) => {
        console.log(message + ' hochgeladen')
        fs.writeFileSync(path.join(__dirname, 'Backup.json'), JSON.stringify(wettkampfDaten))
        socket.emit("success", '')
    })
});


function loadBackup() {
    backup = {}
    backup_data = JSON.parse(fs.readFileSync(path.join(__dirname, 'Backup.json'), 'utf8'))

    for (let name in backup_data) {
        data = backup_data[name]
        backup[name] = new Wettkampf(data['name'], data['password'], data['data'], data['current'], data['structure'])
    }
    return backup
}


function getRadioButton(name, value) {
    return '<input type="radio" id="' + value + '" name="' + name + '" value="' + value + '"><label for="' + value + '">' + value + '</label><br>'
}

function log(message) {
    console.log(message)
}

app.all('/', (req, res) => {
    let data = {}
    for(let wettkampf in wettkampfDaten){
        data[wettkampf] = Object.keys(wettkampfDaten[wettkampf].data)
    }
    res.render(path.join(__dirname, "./public/views/anmelde.html"), {structure:JSON.stringify(data)});

})

server.listen(port, '0.0.0.0', () => {
    console.log('listening on: ' + port);
});