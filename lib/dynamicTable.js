
var logger;
var dt = function(db,tableName,_logger) {
	logger = _logger;
	var scope = this;
	scope.db = db;
	scope.tableName = tableName;
	scope.vals = {};
	scope.rows = {};
	scope.refresh();
};

dt.prototype.refresh = function() {
	var scope = this;
	
	scope.maxID = 0;
	
	scope.db.all("SELECT id,name FROM "+scope.tableName, function(err, rows) {
		scope.tvals = {};
		scope.trows = {};
		rows.forEach(function (row) {
			logger.log('debug',scope.tableName+": "+row.id+"\t"+row.name);
			scope.trows['T'+row.id] = row.name;
			scope.tvals[row.name] = row.id;
			scope.maxID = Math.max(scope.maxID,row.id);
		});
		scope.vals = scope.tvals;
		scope.rows = scope.trows;
	})
}

dt.prototype.get = function(id) {
	
	var scope = this;
	if (typeof scope.rows['T'+id]!='undefined'){
		return scope.rows['T'+id];
	}else{
		return '';
	}
	
}

dt.prototype.set = function(name) {
	var scope = this;
	if (typeof scope.vals[name]!='undefined'){
		return scope.vals[name];
	}else{
		scope.maxID++;
		scope.vals[name]=scope.maxID;
		scope.db.run('insert or ignore into '+scope.tableName+' (id,name) values (?,?) ',[scope.maxID,name],function(){
			scope.refresh();
		});
		return scope.maxID;
	}
}
	
module.exports.DynamicTable = dt;