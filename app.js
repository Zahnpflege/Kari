express = require('express')
let path = require('path')
let lanes = require("./routes/lanes.js")
let admin = require("./routes/admin.js")
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
    let bahn = 'bahn'+socketData[socket.id].bahn
    let wk = socketData[socket.id].wettkampf
    if(wettkampfDaten[wk] && wettkampfDaten[wk][bahn] && wettkampfDaten[wk][bahn].length !== 0) {
        let data = wettkampfDaten[wk][bahn][0]
        socket.emit('next', data)
    }
}

io.on('connection', (socket) => {
    socket.on('register', (msg) => {
        try {
            let data = JSON.parse(msg)

            if (wettkampfDaten[data.wettkampf]['password'] === data.password) {
                socketData[socket.id] = {
                    bahn: data.bahn,
                    wettkampf: data.wettkampf
                }
                sendNext(socket)
                console.log('user registered')
            }else{
                console.log('Wrong Password')
            }
        }catch (e){
            console.error('Error while registering user')
        }
    })

    socket.on('zeit', (msg) => {
        wettkampfDaten[socketData[socket.id].wettkampf]['bahn'+socketData[socket.id].bahn].shift()
        sendNext(socket)
        handleData(msg, socketData[socket.id].wettkampf)
    });
});

function handleData(msg, wettkampf){
    fs.writeFileSync( path.join(__dirname, 'Backup.json'), JSON.stringify(wettkampfDaten))
    fs.writeFileSync( path.join(__dirname, 'Zeiten')+'\\' + wettkampf + '.json', msg + "\n", {flag: 'a+'})
}

io.of("/admin").on("connection", function (socket) {
    socket.on('neuerWettkampf', (message)=>{
        let data = JSON.parse(message)
        wettkampfDaten[data['wk_name']]= {}
        wettkampfDaten[data['wk_name']]['password'] = data['password']
    })

    socket.on('neuerStart', (message) => {
        let data
        try {
            data = JSON.parse(message)

            let start_data = data['start']
            addStart(data.wettkampf, start_data)
        }catch(e){
            socket.emit('error', 'error: '+ e)
            console.log('error: '+e)
            wettkampfDaten[data.wettkampf]= []
        }
    })
    socket.on('uploaded', (message) =>{
        console.log(message + ' hochgeladen')
        socket.emit("success", '')
    })
});

function addStart(wettkampf, start_data) {

    let bahn = 'bahn' + JSON.parse(start_data)['Bahn']
    if (wettkampfDaten[wettkampf] === undefined) {
        wettkampfDaten[wettkampf] = {}
    }
    if (wettkampfDaten[wettkampf][bahn] === undefined) {
        wettkampfDaten[wettkampf][bahn] = []
    }
    wettkampfDaten[wettkampf][bahn].push(start_data)
}

function loadBackup(){
    return JSON.parse(fs.readFileSync( path.join(__dirname, 'Backup.json'),'utf8'))
}

function getRadioButton(name, value){
    return '<input type="radio" id="' +value+ '" name="'+name+'" value="'+value+'"><label for="'+value+'">'+value+'</label><br>'
}

app.all('/', (req, res) => {
    let radio = ''
    Object.keys(wettkampfDaten).forEach(wk => {radio += getRadioButton('wettkampf', wk)})

    res.render(path.join(__dirname, "./public/views/anmelde.html"), {'wettkampfRadio':radio});

})

server.listen(port, '0.0.0.0', () => {
    console.log('listening on: ' + port);
});