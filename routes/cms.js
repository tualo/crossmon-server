
/*
var config = require('../config').config;
var access = null;
*/
var db;
var logger;

var singleitem = function (req, res, next) {
	var server = req.params.server;
	
	var program = req.params.program;
	var tag = req.params.tag;
	if (typeof server=='undefined'){server=1};
	if (typeof program=='undefined'){program=1};
	if (typeof tag=='undefined'){tag=0};
	
	if (isNaN(server)){
		return next();
		
	}
	if (isNaN(program)){
		return next();
	}
	if (isNaN(tag)){
		return next();
	}
	var timestamp = Math.round(new Date().getTime());
	logger.log('debug','start ID '+timestamp);
	db.all("select id,name from servers order by name", function(err, servers) {
		logger.log('debug','ID '+timestamp+' servers: '+(Math.round(new Date().getTime())-timestamp ) );
		if (err){
			return res.json({err: err});
		}
		//select id,name from programs join data on programs.id=data.program_id where server_id=1  group by id,name
		db.all("select id,name from programs join data on programs.id=data.program_id where server_id="+server+"  group by id,name", function(err, programs) {
			logger.log('debug','ID '+timestamp+' programs: '+(Math.round(new Date().getTime())-timestamp ) );
			if (err){
				return res.json({err: err});
			}
			db.all("select id,name from tags join data on tags.id=data.tag_id where server_id="+server+" and program_id="+program+"  group by id,name", function(err, tags) {
				logger.log('debug','ID '+timestamp+' tags: '+(Math.round(new Date().getTime())-timestamp ) );
			
				if (err){
					return res.json({err: err});
				}
				
				res.render('index', {
					title: 'title',
					servers: servers,
					programs: programs,
					tags: tags,
					server: server,
					program: program,
					tag: tag
				});
				logger.log('debug','done '+timestamp+'' );
			});
		});
	});
	
	
	
}



var initRoute=function(app,options){
	//access=ac;
	//app.use(mainnavigation);
	db = options.db;
	logger = options.logger;
	
	app.get('/', singleitem);
	app.get('/:server', singleitem);
	app.get('/:server/:program', singleitem);
	app.get('/:server/:program/:tag', singleitem);
}

exports.initRoute = initRoute;