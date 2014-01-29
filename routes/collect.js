var db;
var logger;
var serversTable;
var programsTable;
var tagsTable;


var singleitem = function (req, res, next) {
    var server = req.params.server;
    var program = req.params.program;
    var tag = req.params.tag;

    var show = ''; // default way
    if (req.body){
        if (req.body.show){
            show = req.body.show;
        }
    }

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
    logger.log('debug','start ID (collect) '+timestamp);


    var tag_filter =" and tag_id="+tag+" ";
    if (tag==0){
        tag_filter = " ";
        //sql = "SELECT server_id,program_id,tag_id,time,val FROM data where server_id="+server+" and program_id="+program+"  order by time desc limit 250";
    }
    
    var mintime =(new Date()).getTime() - (1* 24 * 60 * 60 * 1000);
    
    var group_scale = 60 * 60 * 1000; // every hour
    var limit = 300;
    var sql = "SELECT server_id,program_id,tag_id,time t,val v FROM data where time >"+mintime+" and  server_id="+server+" and program_id="+program+" "+tag_filter+" order by t desc limit "+limit;
    switch(show){
        case 'month':
            mintime = (new Date()).getTime() - (31* 24 * 60 * 60 * 1000)
            limit = (5* 24 * 60 * 60 * 1000)/group_scale;
            sql = "SELECT server_id,program_id,tag_id,floor(time/"+group_scale+")*"+group_scale+" t,avg(val) v FROM data where time >"+mintime+" and  server_id="+server+" and program_id="+program+" "+tag_filter+" group by server_id,program_id,tag_id,t order by t desc limit "+limit;
            break;
        case 'week':
            mintime = (new Date()).getTime() - (7* 24 * 60 * 60 * 1000)
            limit = (7* 24 * 60 * 60 * 1000)/group_scale;
            sql = "SELECT server_id,program_id,tag_id,floor(time/"+group_scale+")*"+group_scale+" t,avg(val) v FROM data where time >"+mintime+" and  server_id="+server+" and program_id="+program+" "+tag_filter+" group by server_id,program_id,tag_id,t order by t desc limit "+limit;
            break;
        case 'day':
            mintime = (new Date()).getTime() - (1* 24 * 60 * 60 * 1000)
            limit = ( 24 * 60 * 60 * 1000)/group_scale;
            sql = "SELECT server_id,program_id,tag_id,floor(time/"+group_scale+")*"+group_scale+" t,avg(val) v FROM data where time >"+mintime+" and  server_id="+server+" and program_id="+program+" "+tag_filter+" group by server_id,program_id,tag_id,t order by t desc limit "+limit;
            break;
    }
    //console.log(sql);
    db.all(sql, function(err, rows) {
        logger.log('debug','ID collect '+timestamp+' data: '+(Math.round(new Date().getTime())-timestamp ) );
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
                x: row.t,
                y: row.v
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
        res.json({
            list:output,
            preveredChart: 'lineChart'
        });
        logger.log('debug','ID collect '+timestamp+' done');
    });
}

var initRoute=function(app,options){
    db= options.db;
    logger=options.logger;
    serversTable=options.serversTable;
    programsTable=options.programsTable;
    tagsTable=options.tagsTable;
    app.get('/chartData/:server/:program/:tag', singleitem);
    app.post('/chartData/:server/:program/:tag', singleitem);
}

exports.initRoute = initRoute;