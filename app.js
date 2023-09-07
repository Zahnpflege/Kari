express = require('express')
let path = require('path')
let lanes = require("./routes/lanes.js")
let admin = require("./routes/admin.js")
let Wettkampf = require('./modules/wettkampf.js')
let htmlCreator = require('./modules/createHTML.js')
var app = express();
let mustache = require('mustache-express')
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const io = new Server(server);
const fs = require('fs');
var port = 80;
const session = require('express-session');

app.engine('html', mustache());
app.use(express.static(path.join(__dirname, 'public'), {index: 'login.html'}))
app.use(express.urlencoded({extended: true}))
app.use(express.urlencoded({extended: false}))

app.use(express.json())

app.use('/admin', admin)

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

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

function returnNextHeat(session) {
    let bahn = session.bahn
    let wk = session.wettkampf

    let start = wettkampfDaten[wk].getCurrentStart(bahn)
    if (start !== false) {
        return start
    }
}

function sendError(socket, error) {
    console.log('sending Error: ' + error)
    socket.emit('error', error)
}

function sendStart(socket, start) {
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

    socket.on('selectLauf', (msg) => {
        log('[INFO] Got selectLauf: ' + msg)
        let data = JSON.parse(msg)
        let start = wettkampfDaten[socketData[socket.id].wettkampf].getStart(socketData[socket.id].bahn, data['wk'], data['lauf'])
        sendStart(socket, start)
    })

    socket.on('nextLauf', (msg) => {
        sendNext(socket)
    })
});

function handleData(msg, wettkampf) {
    fs.writeFileSync(path.join(__dirname, 'Backup.json'), JSON.stringify(wettkampfDaten))
    let msg_data = msg['data']
    if ('WK_Nr' in msg_data) {
        log('added Message to Times: ' + msg)
        fs.writeFileSync(path.join(__dirname, 'Zeiten') + '/' + wettkampf + '/' + msg_data['WK_Nr'] + '.json', JSON.stringify(msg_data) + "\n", {flag: 'a+'})
        console.log(path.join(__dirname, 'Zeiten') + '/' + wettkampf + '/' + msg_data['WK_Nr'] + '.json')
    }
}

io.of("/admin").on("connection", function (socket) {
    socket.on('neuerWettkampf', (message) => {
        let data = JSON.parse(message)
        if (data['wk_name'] === undefined) {
            return false
        }
        wettkampfDaten[data['wk_name']] = new Wettkampf(data['wk_name'], data['password'], data['visitorPassword'], {}, {}, {}, {})
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
        if (!fs.existsSync(path.join(__dirname, 'Zeiten') + '/' + message)) {
            fs.mkdirSync(path.join(__dirname, 'Zeiten') + '/' + message);
        }
        fs.writeFileSync(path.join(__dirname, 'Backup.json'), JSON.stringify(wettkampfDaten))
        socket.emit("success", '')
    })
});


function loadBackup() {
    backup = {}
    backup_data = JSON.parse(fs.readFileSync(path.join(__dirname, 'Backup.json'), 'utf8'))

    for (let name in backup_data) {
        data = backup_data[name]
        backup[name] = new Wettkampf(data['name'], data['password'], data['visitorPassword'], data['data'], data['current'], data['structure'], data['wkStats'])
    }
    return backup
}

function log(message) {
    console.log(message)
}

app.all('/', (req, res) => {
    let data = {}
    for (let wettkampf in wettkampfDaten) {
        console.log(wettkampfDaten[wettkampf])
        data[wettkampf] = Object.keys(wettkampfDaten[wettkampf].data)
    }
    res.render(path.join(__dirname, "./public/views/anmelde.html"), {structure: JSON.stringify(data)});

})

// path for wk overview to return results. If wettkampf and wk are set, results are displayed
app.all('/out', function (req, res) {
    let params = req.query
    if (!req.session.logged_in) {
        res.send('Please Log In!')
        return
    }
    if (!params.wettkampf) {
        let wettkampfe = Object.keys(wettkampfDaten)
        res.render(path.join(__dirname, "./public/views/admin_output.html"), {
            appcontent: htmlCreator.createWettkampfSelectButtons(wettkampfe),
            'headbar': 'Wettkampf Auswahl'
        });
    }
    if (params.wettkampf in wettkampfDaten) {
        if (params.wettkampf && !params.wk) {
            let wkStats = wettkampfDaten[params.wettkampf].wkStats
            console.log(wkStats)
            res.render(path.join(__dirname, "./public/views/admin_output.html"), {
                appcontent: htmlCreator.createWkSelectButtons(params.wettkampf, wkStats),
                'headbar': params.wettkampf
            });
        }
        if (params.wettkampf && params.wk) {
            let wkData = wettkampfDaten[params.wettkampf].getWkNachLauf(params.wk)
            res.render(path.join(__dirname, "./public/views/admin_output.html"), {
                appcontent: htmlCreator.createWkZeiten(wkData,params.wettkampf, params.wk),
                'headbar': params.wettkampf + ' Wk:' + params.wk
            });
        }
    }
});

app.get('/download', function (req, res) {
    fs.writeFile('./Temp/' + req.query.wettkampf + '.json', wettkampfDaten[req.query.wettkampf].createFileContent(req.query.wk), (err) => {
    }, () => {
        res.download('./Temp/' + req.query.wettkampf + '.json', () => {
            fs.unlink('./Temp/' + req.query.wettkampf + '.json', () => {
            })
        })

    })

})

app.get('/wettkampf/:wettkampf/:wk_nr', function (req, res) {
    var wettkampf = req.params['wettkampf']
    var wk_nr = req.params['wk_nr']
    if (wettkampf in wettkampfDaten) {
        fs.readFile(path.join(__dirname, '/Zeiten/' + wettkampf + '/' + wk_nr + '.json'), (err, data) => {
            if (!err && data) {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.write(data)
                res.end()
            } else {
                res.send('Wettkampfnummer "' + wk_nr + '" ungültig.  ' + err)
            }
        });
    } else {
        res.send('Wettkampf "' + wettkampf + '" existiert nicht')
    }
})

app.get('/wettkampfDownload/:wettkampf/:wk_nr', function (req, res) {
    var wettkampf = req.params['wettkampf']
    var wk_nr = req.params['wk_nr']
    if (wettkampf in wettkampfDaten) {
        fs.readFile(path.join(__dirname, '/Zeiten/' + wettkampf + '/' + wk_nr + '.json'), (err, data) => {
            if (!err && data) {
                res.download(path.join(__dirname, '/Zeiten/' + wettkampf + '/' + wk_nr + '.json'))
            } else {
                res.send('Wettkampfnummer "' + wk_nr + '" ungültig')
            }
        });
    } else {
        res.send('Wettkampf "' + wettkampf + '" existiert nicht')
    }
})

app.get('/disqualify', function (req, res) {
    res.render(path.join(__dirname, "./public/views/disqualy.html"), {});
})
app.get('/zoe', function (req, res) {
    res.send('Zoe raucht')
})

app.post('/auth', function (request, response) {
    // Capture the input fields
    let wettkampf = request.body.wettkampf;
    let password = request.body.password;
    let rolle = request.body.rolle;

    // Ensure the input fields exists and are not empty
    if (wettkampf && password && rolle) {

        if (wettkampf in wettkampfDaten) {
            // If the account exists
            if (rolle === 'kari') {
                if (wettkampfDaten[wettkampf].password === password) {
                    let bahn = request.body.bahn
                    if (!bahn) {
                        res.send('Bitte Bahn angeben')
                        return
                    }
                    // Authenticate the user
                    request.session.logged_in = true;
                    request.session.wettkampf = wettkampf;
                    request.session.rolle = rolle
                    request.session.bahn = bahn
                    // Redirect to home page
                    response.redirect('/lane?wettkampf=' + wettkampf + "&bahn=" + bahn);
                } else {
                    response.send('Incorrect Password!');
                }
            }

            if (rolle === 'visitor') {

                if (wettkampfDaten[wettkampf].visitorPassword === password) {
                    // Authenticate the user
                    request.session.logged_in = true;
                    request.session.wettkampf = wettkampf;
                    request.session.rolle = rolle
                    // Redirect to home page
                    response.redirect('/out?wettkampf=' + wettkampf);
                } else {
                    response.send('Incorrect Password!');
                }
            }
            response.end();
        } else {
            response.send('Wettkampf nicht vorhanden');
            response.end();
        }
    }
});

app.all('/lane/', function (req, res) {
    console.log('[INFO] get /lane data: ' + req.query)
    if (!req.session.logged_in || req.session.rolle !== 'kari') {
        res.send('Please Log In!')
        return
    }
    if (req.query.wettkampf) {
        let start = returnNextHeat(req.session)['data']
        res.render(path.join(__dirname, "./public/views/zeitNehmer.html"),{})//'currentData':start,'Wk-Nr':start['WK_Nr'], 'Wk-Name': start['WK_Titel'], 'Lauf': start['Lauf'], 'Schwimmer': start['Aktiver']});
    } else {
        res.send('Wettkampf nicht angegeben')
    }
});

app.post('/postTime',(req,res)=>{
    if(!req.session.logged_in){
        res.send('please log in')
    }
    let data = req.body
    log('Sckt Zeit: ' + JSON.stringify(data))

    if (req.session.wettkampf && req.session.bahn) {
        if(data['data']){
            log('Got Time-Data '+ data['data'])
            let result = wettkampfDaten[req.session.wettkampf].addTime(data['data'], data['signature'])
            if (result === 1) {
                let response = JSON.stringify(returnNextHeat(req.session))
                handleData(data, req.session.wettkampf)
                res.send(response)
            } else {
                res.send( result)
            }
        }else{
            if(data['heat'] === 'next'){
                let response = JSON.stringify(returnNextHeat(req.session))
                log('Sending '+ response)
                res.send(response)
            }
        }

    } else {
        log('Error Socket not found')
    }
})

server.listen(port, '0.0.0.0', () => {
    console.log('listening on: ' + port);
});