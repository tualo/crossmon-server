
/*
var config = require('../config').config;
var access = null;
*/
var db;

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
	console.log('start ID '+timestamp);
	db.all("select id,name from servers order by name", function(err, servers) {
		console.log('ID '+timestamp+' servers: '+(Math.round(new Date().getTime())-timestamp ) );
		if (err){
			return res.json({err: err});
		}
		//select id,name from programs join data on programs.id=data.program_id where server_id=1  group by id,name
		db.all("select id,name from programs join data on programs.id=data.program_id where server_id="+server+"  group by id,name", function(err, programs) {
			console.log('ID '+timestamp+' programs: '+(Math.round(new Date().getTime())-timestamp ) );
			if (err){
				return res.json({err: err});
			}
			db.all("select id,name from tags join data on tags.id=data.tag_id where server_id="+server+" and program_id="+program+"  group by id,name", function(err, tags) {
				
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
				console.log('done '+timestamp+'' );
			});
		});
	});
	
	
	
}



var initRoute=function(app,_db){
	//access=ac;
	//app.use(mainnavigation);
	db = _db;
	app.get('/', singleitem);
	app.get('/:server', singleitem);
	app.get('/:server/:program', singleitem);
	app.get('/:server/:program/:tag', singleitem);
}

exports.initRoute = initRoute;