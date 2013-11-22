function setup(config,callback){
	var readline = require('readline');
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	if (typeof config.db!='undefined'){
		if (typeof config.db.options!='undefined'){
			for(var i in config.db.options){
				config.db[i] = config.db.options[i];
			}
			delete config.db.options;
		}
	}
	_setup(config,rl,{
		cmd: 'help'
	},callback);
}

function _text(str,length,fill){
	if (!fill) fill = ' ';
	while(str.length<length){
		str+=fill;
	}
	return str;
}

function _setup(config,rl,opt,callback){
	var help = [
		'',
		'Here you can setup the crossmon-server.',
		'Following commands are allowed: ',
		
		"\thelp\tprint this help",
		
		"\tlist\tshow the current configuration",
		
		"\tset\tset/add an entry",
		"\tremove\tremove an entry",
		
		"\tsave\tsave the current settings and exit",
		"\texit\texit without saving"
		
	];
	var lines = [];
	switch (opt.cmd){
		case 'help':
			lines = help;
			break;
		case 'list':
			lines.push(' '+_text('',78,'-')+' ');
			lines.push('|'+_text(' Entry',25)+'|'+_text(' Value',52)+'|');
			lines.push(' '+_text('',78,'-')+' ');
			for(var i in config){
				lines.push('|'+_text(' '+i,25)+'|'+_text(' '+(typeof config[i]!='object')?(config[i]+''):'object',52)+'|');
			}
			lines.push(' '+_text('',78,'-')+' ');
			break;
	}
	console.log(lines.join("\n"));
	rl.question('> ',function(answer) {
		var parts = answer.replace(/\s\s/g,' ').split(' ');
		
			if (parts.length==1){
			switch(answer){
				case 'exit':
					rl.close();
					callback({code:0},config);
					break;
				case 'save':
					rl.close();
					callback(null,config);
					break;
				case 'list':
					_setup(config,rl,{cmd:'list'},callback);
					break;
				case 'remove':
					rl.question('item to remove> ',function(answer) {
						if (config[answer]){
							delete config[answer];
						}
						_setup(config,rl,{cmd:'list'},callback);
					});
					break;
				case 'set':
				case 'add':
					rl.question('item to set> ',function(itm) {
						if (itm=='clients'){
							_setup_clients(config,rl,{
								cmd: 'help',
							},function(err,config2){
								if (err){
									_setup(config,rl,{cmd:'list'},callback);
								}else{
									_setup(config2,rl,{cmd:'list'},callback);
								}
							});
						}else if (itm=='db'){
							_setup_db(config,rl,{
								cmd: 'help',
							},function(err,config2){
								if (err){
									_setup(config,rl,{cmd:'list'},callback);
								}else{
									_setup(config2,rl,{cmd:'list'},callback);
								}
							});
						}else{
							rl.question('value for the item> ',function(v) {
								config[itm]=v;
								_setup(config,rl,{cmd:'list'},callback);
							});
						}
					});
					break;
				default:
					_setup(config,rl,{cmd:''},callback);
					break;
			}
		}else{
			// shorthand commands
			if (parts[0]=='remove'){
				if ((typeof config[parts[1]]!='undefined') && (parts[1]!='db') && (parts[1]!='clients') ){
					delete config[parts[1]];
				}
				_setup(config,rl,{cmd:'list'},callback);
			}else if ((parts[0]=='set')||(parts[0]=='add')){
				
				if ( (parts[1]!='db') && (parts[1]!='clients') ){
					if (parts.length==3){
						config[parts[1]]=parts[2];
						_setup(config,rl,{cmd:'list'},callback);
					}else{
						_setup(config,rl,{cmd:''},callback);
					}
				}else{
					if (parts[1]=='db'){
						_setup_db(config,rl,{cmd:'help'},function(err,config2){
							if (err){
								_setup(config,rl,{cmd:'list'},callback);
							}else{
								_setup(config2,rl,{cmd:'list'},callback);
							}
						});
					}else if (parts[1]=='clients'){
						_setup_clients(config,rl,{cmd:'help'},function(err,config2){
							if (err){
								_setup(config,rl,{cmd:'list'},callback);
							}else{
								_setup(config2,rl,{cmd:'list'},callback);
							}
						});
					}else{
						_setup(config,rl,{cmd:''},callback);
					}
				}
				
			}else{
				_setup(config,rl,{cmd:''},callback);
			}
		}
	});
}

function _setup_clients(config,rl,opt,callback){
	var help = [
		'',
		'Here you can setup the allowed crossmon-collect clients for crossmon-server.',
		'Following commands are allowed: ',
		
		"\thelp\tprint this help",
		
		"\tlist\tshow the current clients",
		
		"\tadd\tadd a client",
		"\tremove\tremove a client",
		
		"\tup\tgoing one level up",
		
	];
	
	var lines = [];
	switch (opt.cmd){
		case 'help':
			lines = help;
			break;
		case 'list':
			lines.push(' '+_text('',78,'-')+' ');
			lines.push('|'+_text(' Name',25)+'|'+_text(' IP-Address',52)+'|');
			lines.push(' '+_text('',78,'-')+' ');
			for(var i in config.clients){
				lines.push('|'+_text(' '+config.clients[i].name,25)+'|'+_text(' '+config.clients[i].ip,52)+'|');
			}
			lines.push(' '+_text('',78,'-')+' ');
			break;
	}
	console.log(lines.join("\n"));
	rl.question('clients setup> ',function(answer) {
		var parts = answer.replace(/\s\s/g,' ').split(' ');
		
		if (parts.length==1){
			switch(answer){
				case 'up':
					callback(null,config);
					break;
				case 'list':
					_setup_clients(config,rl,{cmd:'list'},callback);
					break;
				case 'remove':
					rl.question('name to remove> ',function(answer) {
						var new_list = [];
						for(var i in config.clients){
							if (config.clients[i].name!=answer){
								new_list.push(config.clients[i]);
							}
						}
						config.clients = new_list;
						_setup_clients(config,rl,{cmd:'list'},callback);
					});
					break;
				case 'add':
					rl.question('name to add> ',function(itm) {
						rl.question('ip-address of the client> ',function(v) {
							
							var item_index = -1;
							for(var i in config.clients){
								if (config.clients[i].name==itm){
									item_index=i;
								}
							}
							if (item_index!=-1){
								config.clients[item_index]={
									name: itm,
									ip: v
								};
							}else{
								config.clients.push({
									name: itm,
									ip: v
								});
							}
							
							_setup_clients(config,rl,{cmd:'list'},callback);
						});
					});
					break;
				default:
					_setup_clients(config,rl,{cmd:''},callback);
					break;
			}
		}else{
			// short hand commands
			if (parts[0]=='remove'){
				var new_list = [];
				for(var i in config.clients){
					if (config.clients[i].name!=parts[1]){
						new_list.push(config.clients[i]);
					}
				}
				config.clients = new_list;
				_setup_clients(config,rl,{cmd:'list'},callback);
			}else if (parts[0]=='add'){
				if (parts.length==3){
					var itm = parts[1];
					var v = parts[2];
					var item_index = -1;
					for(var i in config.clients){
						if (config.clients[i].name==itm){
							item_index=i;
						}
					}
					if (item_index!=-1){
						config.clients[item_index]={
							name: itm,
							ip: v
						};
					}else{
						config.clients.push({
							name: itm,
							ip: v
						});
					}
					
					_setup_clients(config,rl,{cmd:'list'},callback);
				}else{
					_setup_clients(config,rl,{cmd:''},callback);
				}
			}else{
				_setup_clients(config,rl,{cmd:''},callback);
			}
		}
	});
}


function _setup_db(config,rl,opt,callback){
	var help = [
		'',
		'Here you can setup the database options for crossmon-server.',
		'Following commands are allowed: ',
		
		"\thelp\tprint this help",
		
		"\tlist\tshow the current settings",
		
		"\tset\tset/add an entry",
		"\tremove\tremove an entry",
		
		"\tup\tgoing one level up",
		
	];
	
	var lines = [];
	switch (opt.cmd){
		case 'help':
			lines = help;
			break;
		case 'list':
			lines.push(' '+_text('',78,'-')+' ');
			lines.push('|'+_text(' Entry',25)+'|'+_text(' Value',52)+'|');
			lines.push(' '+_text('',78,'-')+' ');
			for(var i in config.db){
				lines.push('|'+_text(' '+i,25)+'|'+_text(' '+config.db[i],52)+'|');
			}
			lines.push(' '+_text('',78,'-')+' ');
			break;
	}
	console.log(lines.join("\n"));
	rl.question('db setup> ',function(answer) {
		var parts = answer.replace(/\s\s/g,' ').split(' ');
		
		if (parts.length==1){
			switch(answer){
				case 'up':
					callback(null,config);
					break;
				case 'list':
					_setup_db(config,rl,{cmd:'list'},callback);
					break;
				case 'remove':
					rl.question('item to remove> ',function(answer) {
						if (typeof config.db[answer]!='undefined'){
							delete config.db[answer];
						}
						_setup_db(config,rl,{cmd:'list'},callback);
					});
					break;
				case 'add':
				case 'set':
					rl.question('item to set> ',function(itm) {
						rl.question('value> ',function(v) {
							
							config.db[itm]=v;
							
							_setup_db(config,rl,{cmd:'list'},callback);
						});
					});
					break;
				default:
					_setup_db(config,rl,{cmd:''},callback);
					break;
			}
		}else{
			if (parts[0]=='remove'){
				if (typeof config.db[parts[1]]!='undefined'){
					delete config.db[parts[1]];
				}
				_setup_db(config,rl,{cmd:'list'},callback);
			}else if ((parts[0]=='set')||(parts[0]=='add')){
				if (parts.length==3){
					config.db[parts[1]]=parts[2];
					_setup_db(config,rl,{cmd:'list'},callback);
				}else{
					_setup_db(config,rl,{cmd:''},callback);
				}
			}else{
				_setup_db(config,rl,{cmd:''},callback);
			}
		}
	});
}
exports.setup = setup;
