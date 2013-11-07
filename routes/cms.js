
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
	db.all("select id,name from servers order by name", function(err, rows) {
		if (err){
			res.json({});
		}
		var servers = rows;
		db.all("select id,name from programs join data on programs.id=data.program_id where server_id="+server+"  group by id,name", function(err, rows) {
			if (err){
				res.json({});
			}
			var programs = rows;
			db.all("select id,name from tags join data on tags.id=data.tag_id where server_id="+server+" and program_id="+program+"  group by id,name", function(err, rows) {
				if (err){
					res.json({});
				}
				var tags = rows;
				
				res.render('index', {
					title: 'title',
					servers: servers,
					programs: programs,
					tags: tags,
					server: server,
					program: program,
					tag: tag
				});
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