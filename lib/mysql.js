// Sample Text

var mysql = require('mysql');

var MySQL = module.exports = function (opts) {
	opts = opts || {};
	this.host = (typeof opts.host=='undefined')?'localhost':opts.host;
	this.port = (typeof opts.port=='undefined')?'3306':opts.port;
	this.database = (typeof opts.database=='undefined')?'crossmon':opts.database;
	this.username = (typeof opts.username=='undefined')?'root':opts.username;
	this.password = (typeof opts.password=='undefined')?'':opts.password;
};

MySQL.prototype.connect=function(){
	
	this.connection = mysql.createConnection({
		host: this.host,
		port: this.port,
		database: this.database,
		user: this.username,
		password: this.password
	});
	
}

MySQL.prototype.close=function(){
	this.connection.end();
}

MySQL.prototype.run=function(sql,params,callback){
	for(var i in params){
		sql=sql.replace('?','\''+params[i]+'\'');
	}
	this.connection.query( sql, function(err,res){
		 
		if (typeof callback!='undefined'){
			callback(err,res);
		}
	});
}

MySQL.prototype.all=function(sql,callback){
	 
	this.connection.query( sql, function(err,res){
		 
		if (typeof callback!='undefined'){
			callback(err,res);
		}
	});
}


MySQL.prototype.prepare = function(sql){
	//db.prepare("INSERT INTO data (server_id,program_id,tag_id,time,val)VALUES (?,?,?,?,?)");
	var me = this;
	return {
		run: function(params){
			me.run(sql,params,function(e,r){
				 
			});
		},
		finalize: function(callback){
			if (typeof callback!='undefined'){
				callback(null,[]);
			}
		}
	};
}