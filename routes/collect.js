var db;
var serversTable;
var programsTable;
var tagsTable;

var colorList = [
	'#ff7f0e',
	'#ff7ffe'
];

var singleitem = function (req, res, next) {
	var server = req.params.server;
	var program = req.params.program;
	var tag = req.params.tag;
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
	console.log('start ID (collect) '+timestamp);
	
	var sql = "SELECT server_id,program_id,tag_id,time,val FROM data where server_id="+server+" and program_id="+program+" and tag_id="+tag+" order by time desc limit 250";
	if (tag==0){
		sql = "SELECT server_id,program_id,tag_id,time,val FROM data where server_id="+server+" and program_id="+program+"  order by time desc limit 250";
	}
	db.all(sql, function(err, rows) {
		console.log('ID collect '+timestamp+' data: '+(Math.round(new Date().getTime())-timestamp ) );
		if (err){
			return res.json({});
		}
		var tagList = {};
		var tagCount = 0;
		rows.forEach(function (row) {
			//console.log("data: "+JSON.stringify(row));
			if (typeof tagList['T'+row.tag_id]=='undefined'){
				tagList['T'+row.tag_id] = {
					values: [],
					tag: row.tag_id,
					key: tagsTable.get(row.tag_id)/* ,
					color: (colorList[tagCount])?colorList[tagCount]:colorList[0]*/
				};
				tagCount++;
			}
			tagList['T'+row.tag_id].values.push({
				x: row.time,
				y: row.val
			});
		});
		var output=[];
		for(var t in tagList){
			var list=tagList[t].values;
			list.reverse();
			var item = {
				values: list,
				tag: tagList[t].tag,
				key: tagList[t].key/*,
				color: tagList[t].color*/
			}
			output.push(item);
		}
		res.json(output);
		console.log('ID collect '+timestamp+' done');
	});
}

var initRoute=function(app,_db,_serversTable,_programsTable,_tagsTable){
	db= _db;
	
	serversTable=_serversTable;
	programsTable=_programsTable;
	tagsTable=_tagsTable;
	 
	app.get('/chartData/:server/:program/:tag', singleitem);
}

exports.initRoute = initRoute;