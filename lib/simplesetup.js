var Chained =  require('./chained');
var readline = require('readline');
var fs = require('fs');




var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// default modules
var modules = [
	"crossmon-collect", 
	"crossmon-cpu",
	//"crossmon-disk"
];

function getSetupDirectory(_callback){
	console.log("");
	console.log("Where should the configuration file be placed?");
	console.log("\te: for /etc/crossmon");
	console.log("\tm: for the modules directory");
	console.log("\ta: abort the setup");
	rl.question("your choice [e,m,a]: ", function(answer) {
		switch (answer){
			case 'a':
				_callback({
					error: 'Setup cancled'
				},null);
				break;
				break;
			case 'e':
				_callback(null,'/etc/crossmon');
				break;
			case 'm':
				_callback(null,'../config.json');
				break;
			default:
				_callback({
					error: 'Invalid input'
				},null);
				break;
		}
	});
}

function switchDatabase(_callback){
	console.log("");
	console.log("Witch database should be used?");
	console.log("\tm: for mysql");
	console.log("\ts: for sqlite");
	console.log("\ta: abort the setup");
	rl.question("your choice [m,s,a]: ", function(answer) {
		switch (answer){
			case 'a':
				_callback({
					error: 'Setup cancled'
				},null);
				break;
				break;
			case 'm':
				modules.push('mysql');
				_callback(null,'mysql');
				break;
			case 's':
				modules.push('sqlite3');
				_callback(null,'sqlite3');
				break;
			default:
				_callback({
					error: 'Invalid input'
				},null);
				break;
		}
	});
}

function switchSQLiteFile(_callback,res){
	if (res.databasetype==='sqlite3'){
		console.log("");
		console.log("Where should database file be placed? ");
		console.log("\tleave it empty for ~/crossmon.db");
		console.log("\tenter a valid filename (the file must not exists)");
		console.log("\ta: abort the setup");
		rl.question("your choice: ", function(answer) {
			switch (answer){
				case 'a':
					_callback({
						error: 'Setup cancled'
					},null);
					break;
					break;
				case '':
					_callback(null,'~/crossmon.db');
					break;
				default:
					_callback(null,answer);
					break;
			}
		});
	}else{
		_callback(null,null);
	}
}

function switchMySQLHost(_callback,res){
	if (res.databasetype==='mysql'){
		console.log("");
		console.log("What is the MySQL host name? ");
		console.log("\tleave it empty for localhost");
		console.log("\tenter a valid hostname or ip-address");
		console.log("\ta: abort the setup");
		rl.question("your choice: ", function(answer) {
			switch (answer){
				case 'a':
					_callback({
						error: 'Setup cancled'
					},null);
					break;
					break;
				case '':
					_callback(null,'localhost');
					break;
				default:
					_callback(null,answer);
					break;
			}
		});
	}else{
		_callback(null,null);
	}
}

function switchMySQLDatabaseName(_callback,res){
	if (res.databasetype==='mysql'){
		console.log("");
		console.log("What is the MySQL database name? ");
		console.log("\tNote: The database must exists for runnung the service, you can create them after that setup.");
		console.log("\tleave it empty for crossmon");
		console.log("\tenter a valid database name");
		console.log("\ta: abort the setup");
		rl.question("your choice: ", function(answer) {
			switch (answer){
				case 'a':
					_callback({
						error: 'Setup cancled'
					},null);
					break;
					break;
				case '':
					_callback(null,'crossmon');
					break;
				default:
					_callback(null,answer);
					break;
			}
		});
	}else{
		_callback(null,null);
	}
}

function switchMySQLUsername(_callback,res){
	if (res.databasetype==='mysql'){
		console.log("");
		console.log("What is the MySQL username, that can access "+res.mysql_dbname+"? ");
		console.log("\tleave it empty for root");
		console.log("\tenter a valid username");
		console.log("\ta: abort the setup");
		rl.question("your choice: ", function(answer) {
			switch (answer){
				case 'a':
					_callback({
						error: 'Setup cancled'
					},null);
					break;
					break;
				case '':
					_callback(null,'root');
					break;
				default:
					_callback(null,answer);
					break;
			}
		});
	}else{
		_callback(null,null);
	}
}


function switchMySQLPassword(_callback,res){
	if (res.databasetype==='mysql'){
		console.log("");
		console.log("What is the MySQL password, for "+res.mysql_username+"? ");
		console.log("\tleave it empty if no password is used");
		console.log("\tenter a the valid password");
		console.log("\ta: abort the setup");
		rl.question("your choice: ", function(answer) {
			switch (answer){
				case 'a':
					_callback({
						error: 'Setup cancled'
					},null);
					break;
					break;
				default:
					_callback(null,answer);
					break;
			}
		});
	}else{
		_callback(null,null);
	}
}


function getInstallModules(_callback){
	console.log("");
	console.log("The following node modules will be installed by the setup globaly:");
	for(var i in modules){
		console.log("\t"+modules[i]);
	}
	rl.question("Do you want to proceed (yes,y,no,n)? ", function(answer) {
		switch (answer){
			case 'n':
			case 'no':
				_callback({
					error: 'Setup cancled'
				},null);
				break;
			case 'y':
			case 'yes':
				_callback(null,'y');
				break;
			default:
				_callback({
					error: 'Invalid input'
				},null);
				break;
		}
	})
}

function endSetup(err,res){
	rl.close();
	//console.log('END');
	
}

function installModules(_callback,res){
	if ( (res.install==='y') ){
		console.log("");
		console.log("Installing needed modules: ");
		_installModuleLoop(modules.length-1,function(){
			_callback(null,null);
		})
	}else{
		// installation is not confirmed
		_callback(null,null);
	}
}

function saveConfig(_callback,res){
	if ( (res.directory==='/etc/crossmon') ){
		fs.exists('/etc/crossmon', function (exists) {
			if (exists){
				console.log('/etc/crossmon already exists ...')
				fs.exists('/etc/crossmon/config.json', function (exists) {
					if (exists){
						console.log('/etc/crossmon/config.json already exists ...');
						//_callback(null,null);
						_saveConfig('/etc/crossmon/config.json',_callback,res);
					}else{
						_saveConfig('/etc/crossmon/config.json',_callback,res);
					}
				});
			}else{
				// maybe the mode is wrong!!!
				fs.mkdir('/etc/crossmon', '0755', function (err) {
					if (err){
						_callback(err,null);
					}else{
						_saveConfig('/etc/crossmon/config.json',_callback,res);
					}
				});
				
			}
		});
	}else{
		_saveConfig(path.join(__dirname,'..','config.json'),_callback,res);
	}
}


function saveCollectConfig(_callback,res){
	if ( (res.directory==='/etc/crossmon') ){
		_saveCollectConfig('/etc/crossmon/collect_config.json',_callback,res);
	}else{
		_saveCollectConfig(path.join(__dirname,'..','collect_config.json'),_callback,res);
	}
}


function errorSetup(err,res){
	if (err){
		if (err.error){
			if (err.error==='Setup cancled'){
				console.log('Setup cancled by the user');
			}
			if (err.error==='Invalid input'){
				console.log('Setup cancled by the user (Invalid input)');
			}
		}else{
			console.log(err);
		}
	}
}

function doSetup(){
	(new Chained())
	.error(errorSetup)
	.finally(endSetup)
	.add('directory',getSetupDirectory)
	.add('databasetype',switchDatabase)
	
	.add('sqlitefile',switchSQLiteFile)
	
	.add('mysql_host',switchMySQLHost)
	.add('mysql_dbname',switchMySQLDatabaseName)
	.add('mysql_username',switchMySQLUsername)
	.add('mysql_password',switchMySQLPassword)
	
	.add('install',getInstallModules)
	.add('install_modules',installModules)
	.add('save',saveConfig)
	.add('save-collect',saveCollectConfig)
	
	.run(function(err,res){
		console.log("");
		console.log("Configuration is done. Now you should be able to" );
		console.log("" );
		console.log("\t-start the display and storage service by: crossmon-server start" );
		console.log("\t-start the collecting service by: crossmon-collect start" );
		console.log("" );
		console.log("Bye, bye." );
	});
}
exports.doSetup = doSetup;



// private

function _saveCollectConfig(filename,_callback,res){
	var item = {
		"collectServer": "127.0.0.1",
		"collectPort": "7654",
		"collect": [
			{
				"module": "crossmon-cpu",
				"interval": "1000",
				"options": {
					"scale": 1,
					"cpu-all": true,
					"programs": [
						{
							"tag": "mysqlserver",
							"contains": "mysqld"
						},
						{
							"tag": "apacheserver",
							"contains": "httpd"
						}
					]
				}
			}
		]
	};
	fs.writeFile(filename, JSON.stringify(item,null,4), function (err) {
		if (err){
			_callback(err,null);
		}else{
			console.log('collector configuration:');
			console.log(JSON.stringify(item,null,4));
			console.log('configuration written to '+filename);
			_callback(null,null);
		}
	});
}

function _saveConfig(filename,_callback,res){
	var item = {
		"displayPort": 8070,
		"collectPort": 7654,
		"loglevel": 2,
		"public": "./public",
		"views": "./views",
		"session_secret": _generateRandomString(10),
		"clients": [
			{
				"name": "Server 1",
				"ip": "127.0.0.1"
			}
		],
		"db": {}
	};
	if (res.databasetype==='mysql'){
		item.db = {
			"type": 'mysql',
			"host": res.mysql_host,
			"database": res.mysql_dbname,
			"username": res.mysql_username,
			"password": res.mysql_password
		}
	}
	if (res.databasetype==='sqlite3'){
		item.db.type = 'sqlite3';
		item.db.file = res.sqlitefile;
	}
	fs.writeFile(filename, JSON.stringify(item,null,4), function (err) {
		if (err){
			_callback(err,null);
		}else{
			console.log('configuration:');
			console.log(JSON.stringify(item,null,4));
			console.log('configuration written to '+filename);
			_callback(null,null);
		}
	});
};

function _generateRandomString(length) {
	length = length ? length : 5;
	var chars = 'abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXTZ1234567890';
	var string = '';
	for (var i = 0; i < length; i++) {
		var randomNumber = Math.floor(Math.random() * chars.length);
		string += chars.substring(randomNumber, randomNumber + 1);
	}
	return string;
}

function _installModuleLoop(index,_callback){
	if (index>-1){
		_installModule(modules[index],function(){
			index--;
			_installModuleLoop(index,_callback);
		});
	}else{
		_callback();
	}
}

function _installModule(moduleName,_callback){
	var process = require('child_process');
	var params = ['install',moduleName,'-g'];
	console.log("Installing "+moduleName+"... ");
	var running_process = process.spawn( 'npm', params);
	running_process.stdout.on('data',function(data){
		 
	});
	
	running_process.stderr.on('data',function(data){
		 
	});
	running_process.on('message',function(data){
		
	});
	
	running_process.on('close',function(code, signal){
		
	});
	
	running_process.on('exit',function (code, signal){
		switch (code){
			case 3:
				console.log(""+moduleName+" not installed missing rights ");
				break;
			case 1:
				console.log(""+moduleName+" not installed module not found ");
				break;
			default:
				console.log(""+moduleName+" installed (code: "+code+") ");
				break;
		}
		_callback();
	});
}
