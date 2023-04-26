// Importar las dependencias
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
//PRUEBA
const mysql=require('mysql');
app.set('view engine', 'ejs');

var conexion =mysql.createConnection({
    host:'localhost',
    database:'web_lab05',
    user:'root',
    password:'root',
});

conexion.connect(function(error){
    if (error){
        throw error;
    }else{
        console.log('CONEXION EXITOSA');
    }
});

// Ruta para el archivo HTML
app.get('/', function(req, res){

    conexion.query('SELECT * FROM usuario', function(error, results, field){
        var nombre_usuario1='';
        var imagen_usuario1='';
        var nombre_usuario2='';
        var imagen_usuario2='';
        if (error)
        throw error;

        nombre_usuario1=results.find( idusuario => idusuario = 1).usuarionombre;
        imagen_usuario1=results.find( idusuario => idusuario = 1).usuarioimagen;
        nombre_usuario2=results.filter( item => item.idusuario === 2)[0].usuarionombre;
        imagen_usuario2=results.filter( item => item.idusuario === 2)[0].usuarioimagen;

        //renderizamos los datos del perfil de ambos usuarios
        res.render('index.ejs', {
            nombre_usuario1: nombre_usuario1,
            imagen_usuario1: imagen_usuario1,
            nombre_usuario2: nombre_usuario2,
            imagen_usuario2: imagen_usuario2,
        });
    });
    // Escuchar la conexión de Socket.IO
    io.on('connection', function(socket){
        console.log('Usuario conectado');
        
        //actualizamos el perfil de ambos usuarios
        socket.on('actualizar1', function(nombre, imagen){
            conexion.query('UPDATE usuario SET usuarionombre = "'+nombre+'" WHERE idusuario = 1;', function(error, results, field){
                if (error)
                throw error;
            });
            conexion.query('UPDATE usuario SET usuarioimagen = "'+imagen+'" WHERE idusuario = 1;', function(error, results, field){
                if (error)
                throw error;
            });
        });

        socket.on('actualizar2', function(nombre, imagen){
            conexion.query('UPDATE usuario SET usuarionombre = "'+nombre+'" WHERE idusuario = 2;', function(error, results, field){
                if (error)
                throw error;
            });
            conexion.query('UPDATE usuario SET usuarioimagen = "'+imagen+'" WHERE idusuario = 2;', function(error, results, field){
                if (error)
                throw error;
            });
        });

        //
        // Escuchar el evento 'chat message 1' para el chat 1
        socket.on('chat message 1', function(msg){
            var today = new Date();
            var now = today.toLocaleTimeString('en-US');
            console.log('Mensaje del chat 1: ' + msg + ' '+now);
            conexion.query('INSERT INTO mensajes_usuario1 (mensajes_usuario1) VALUES ("' + msg +'");', function(error, results, field){
                if (error)
                throw error;
            });
            io.emit('chat message 1', msg);
        });

        // Escuchar el evento 'chat message 2' para el chat 2
        socket.on('chat message 2', function(msg){
            var today = new Date();
            var now = today.toLocaleTimeString('en-US');
            console.log('Mensaje del chat 2: ' + msg + ' '+now);
            conexion.query('INSERT INTO mensajes_usuario2 (mensajes_usuario2) VALUES ("' + msg +'");', function(error, results, field){
                if (error)
                throw error;
            });
            io.emit('chat message 2', msg);
        });

        // Escuchar la desconexión del usuario
        socket.on('disconnect', function(){
            console.log('Usuario desconectado');
        });
    });
});



// Iniciar el servidor HTTP en el puerto 3000
http.listen(3000, function(){
    console.log('Servidor escuchando en http://localhost:3000');
});

//conexion.end();