function downloadFile(wettkampf) {
    let fileContent = ''
    var socket = io();
    socket.on('line', (message) => {
        fileContent += message + "\n"
    })

}