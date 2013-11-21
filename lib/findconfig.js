var loggerLib = new require('./logger');
var logger = new loggerLib();
var fs = require('fs');
var path = require('path');

function findConfiguration(callback){
	var config;
	fs.exists(path.join('/etc','crossmon','config.json'),function(exists){
		if (exists){
			try{
				config = require(path.join('/etc','crossmon','config.json'));
				callback(config,path.join('/etc','crossmon','config.json'));
			}catch(e){
				logger.log('error','The configuration is invalid.  '+e.Error);
			}
		}else{
			fs.exists(path.join(__dirname,'..','config.json'),function(exists){
				if (exists){
					try{
						config = require(path.join(__dirname,'..','config.json'));
						callback(config,path.join(__dirname,'..','config.json'));
					}catch(e){
						logger.log('error','The configuration is invalid. ');
					}
				}else{
					fs.exists(path.join(__dirname,'..','config.sample.json'),function(exists){
						if (exists){
							try{
								config = require(path.join(__dirname,'..','config.sample.json'));
								logger.log('info','The sample configuration file will be loaded.');
								callback(config,path.join(__dirname,'..','config.sample.json'));
							}catch(e){
								logger.log('error','The configuration is invalid. ');
							}
						}else{
							logger.log('error','There is no configuration file. ');
							process.exit();
						}
					});
				}
			});
		}
	});
}
exports.findConfiguration = findConfiguration;