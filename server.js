/**
* Module dependencies.
*/

var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var socketio = require('socket.io');


//var sass = require('node-sass');


var config;
var DynamicTable = require('./lib/dynamicTable').DynamicTable;
var loggerLib = new require('./lib/logger');
var find_config = require('./lib/findconfig');

var logger = new loggerLib();
var display_routes = ['cms','collect'];
var displayApp = express();
var count = 0;
var db;
var displayIO;
var displaySocket;
var serversTable;
var programsTable;
var tagsTable;

var insertStack = [];
var stackTimer;
var insertStack_locked=false;


function refreshIndexTables(){
	db.run('insert into server_programs (server_id,program_id) select server_id,program_id from data group by server_id,program_id on duplicate key update program_id=values(program_id)',[ ],function(){
		db.run('insert into server_programs_tags (server_id,program_id,tag_id) select server_id,program_id,tag_id from data group by server_id,program_id,tag_id on duplicate key update program_id=values(program_id)',[ ],function(){
			setTimeout(refreshIndexTables,60000);
		});
	});
}

function writeStack(){
	if (insertStack.length>0){
		insertStack_locked=true;
		logger.log('debug',"write to db "+insertStack.length+" entries");
		var stmt = db.prepare("INSERT INTO data (server_id,program_id,tag_id,time,val)VALUES (?,?,?,?,?) on duplicate key update val=values(val) ");
		for (var i = 0; i < insertStack.length; i++) {
			stmt.run(insertStack[i]);
		}
		stmt.finalize();
		logger.log('debug',insertStack.length+" entries written");
		insertStack=[];
		insertStack_locked=false;
	}
}

function createTable(callback) {
	fs.readFile(path.join(__dirname,'ddl.sql'), function (err, data) {
		if (err) throw err;
		var commands = data.toString().split(';');
		executeCommandList(commands,0,callback)
	});
}

function executeCommandList(commands,index,callback){
	if (index<commands.length){
		db.run(commands[index],[ ],function(){
			index++;
			executeCommandList(commands,index,callback);
		});
	}else{
		callback();
	}
}

function getClient(socket) {
	var endpoint = socket.manager.handshaken[socket.id].address;
	for(var i in config.clients){
		if (endpoint.address == config.clients[i].ip){
			return config.clients[i];
		}
	}
	return null;
}

function inCommingConnection(socket){
	var endpoint = socket.manager.handshaken[socket.id].address;
	//console.log(endpoint.address);
	var testClient = getClient(socket);
	if (typeof testClient=='undefined'){
		socket.disconnect();
	}
	socket.on('put', function (data) {
		var endpoint = socket.manager.handshaken[socket.id].address;
		var client = getClient(socket);
		var values = [
			serversTable.set(client.name),
			programsTable.set(data.program),
			tagsTable.set(data.tag),
			data.time,
			data.value
		];
		if (typeof displayIO!='undefined'){
			//displayIO.sockets.emit(values[0]+'/'+values[1]+'/'+values[2],{ time: data.time, value: data.value });
			displayIO.sockets.emit(values[0]+'/'+values[1],{tag: values[2], time: data.time, value: data.value });
			
		}
		logger.log('debug',JSON.stringify(data));
		if (!insertStack_locked){
			insertStack.push(values);
		}
	});
}

function initDisplayServer(){
	// display server
	displayApp.configure(function(){
		var publicDir = './public';
		if (typeof config.public!='undefined'){
			publicDir = config.public.replace(/^\.\//,__dirname+'/');
		}
		var viewsDir = './views';
		if (typeof config.views!='undefined'){
			viewsDir = config.views.replace(/^\.\//,__dirname+'/');
		}
		
		displayApp.set('port', config.displayPort);
		displayApp.set('views', viewsDir);
		displayApp.set('view engine', 'jade');
		displayApp.use(express.json());
		displayApp.use(express.urlencoded());
		displayApp.use(express.cookieParser());
		displayApp.use(express.session({ secret: config.session_secret}));
		displayApp.use(function (req, res, next) {
			res.locals.meta = [];
			res.locals.notice = [];
			res.locals.remoteip = req.header('x-forwarded-for') || req.connection.remoteAddress;
			res.locals.breadcrumb = [];
			res.locals.breadcrumb.push({
				path: '/',
				title: 'Startseite'
			});
			res.locals.mainnavigation = [];
			
			next();
		});
		displayApp.use(express.static(publicDir));
	});
	displayApp.configure('development', function(){displayApp.use(express.errorHandler());});
	for(var i in display_routes){
		var route = require('./routes/'+display_routes[i]);
		route.initRoute(displayApp,{
			db: db,
			serversTable: serversTable,
			programsTable: programsTable,
			tagsTable: tagsTable,
			logger: logger
		});
	}
	var displayServer = http.createServer(displayApp);
	displayServer.listen(displayApp.get('port'), function(){logger.log('info',"display server listening on port " + displayApp.get('port'));});
	displayIO = require('socket.io').listen(displayServer);
	displayIO.set('log level', 0);
	// hier muss noch gerüft werden, ob nur zugelassene clients
	// diese daten abrufen
	displayIO.sockets.on('connection', function (socket) {});
}

var initAfterTableCreation = function(){
	serversTable = new DynamicTable(db,'servers',logger);
	programsTable = new DynamicTable(db,'programs',logger);
	tagsTable = new DynamicTable(db,'tags',logger);
	if (typeof config.collectPort){
		
		
		setInterval(writeStack,10000);
		setTimeout(refreshIndexTables,60000);
		logger.log('info','collector listening on port: '+config.collectPort);
		var io = socketio.listen(config.collectPort);
		io.set('log level', 0);
		io.sockets.on('connection', inCommingConnection);
		
	}
	
	if (typeof config.displayPort){
		initDisplayServer();
	} // if (typeof config.displayPort)
}

function initDB(_cnf){
	config = _cnf;
	if (typeof config=='undefined'){
		logger.log('error','The configuration is invalid.');
		process.exit();
	}
	if (typeof config.db=='undefined'){
		logger.log('error','No Database type is specified.');
		process.exit();
	}
	if (typeof config.loglevel!=='undefined'){
		logger.level = config.loglevel;
	}
	switch(config.db.type){
		case 'mysql': 
			var mysql;
			try{
				mysql = require('./lib/mysql');
			}catch(e){
				logger.log('error','You must install node module for mysql. (npm install mysql)');
				process.exit();
			}
			db = new mysql();
			
			// only for older configs 
			if (typeof config.db.options!='undefined'){
				for(var i in config.db.options){
					config.db[i] = config.db.options[i];
				}
			}
			
			var opt = config.db;
			delete opt.type;
			db.connect(opt);
			createTable(initAfterTableCreation);
			break;
		case 'sqlite':
		case 'sqlite3':
			
			if (typeof config.db.file=='undefined'){
				logger.log('error','No Database file is specified.');
				process.exit();
			}
			var sqlite3;
			try{
				sqlite3 = require('sqlite3').verbose();
			}catch(e){
				logger.log('error','You must install sqlite3. (npm install sqlite3)');
				process.exit();
			}
			config.db.file = config.db.file.replace(/^\.\//,__dirname+'/');
			logger.log('debug',config.db.file);
			db = new sqlite3.Database(config.db.file, function(){
				createTable(initAfterTableCreation);
			}) // sqlite Database
			break;
		default:
			logger.log('error','your selected database is not supported.');
			process.exit();
			break;
	}
}


find_config.findConfiguration(initDB);