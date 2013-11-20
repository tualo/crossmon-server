/*
Copyright (c) 2013 Thomas Hoffmann <thomas.hoffmann@tualo.de>

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
exports = module.exports = Chained;

function Chained() {
	this.chained_functions=[];
	this.chained_functions_results={};
	this._finally = null;
	this._error = null;
	this._run = null;
	this._err = null;
	this.chained_index = 0;
}

// called if an error occured in on of the chained functions
Chained.prototype.error = function (_callback){
	//error.callee.name
	this._error = _callback;//(this._err,this.chained_functions_results);
	return this;
}

// called ad the end of the chain, even if an error occured
Chained.prototype.finally = function (_callback){
	//finaly.callee.name
	this._finally = _callback;//(null,this.chained_functions_results);
	return this;
}

// add a function to the chain
// id is used to store the result of that function
Chained.prototype.add = function (id,_function){
	//finaly.callee.name
	this.chained_functions.push(
		{
			id: id,
			_fn: _function
		}
	);
	return this;
}

// starts the chained function callings
Chained.prototype.run = function(_callback){
	this._run = _callback;
	this.chained_index = 0;
	if (this.chained_functions.length>this.chained_index){
		this._execute();
	}else{
		if (this._run){
			try{
				this._run(this._err,this.chained_functions_results);
			}catch(e){
				if (this._error){
					this._error(this._err,this.chained_functions_results);
				}
			}finally{
				if (this._finally){
					this._finally(this._err,this.chained_functions_results);
				}
			}
		}
	}
	return this;
}

Chained.prototype._execute = function(){
	var scope = this;
	scope.chained_functions[scope.chained_index]._fn(function(err,res){
		/*
		console.log('chained_index '+scope.chained_index);
		console.log(err);
		console.log(res);
		*/
		if (err) {
			scope._err = err;
			if (scope._error){
				scope._error(scope._err,scope.chained_functions_results);
			}
			if (scope._finally){
				scope._finally(scope._err,scope.chained_functions_results);
			}
		}else{
			scope.chained_functions_results[scope.chained_functions[scope.chained_index].id]=res;
			scope.chained_index++;
			if (scope.chained_functions.length>scope.chained_index){
				scope._execute();
			}else{
				if (scope._run){
					try{
						scope._run(scope._err,scope.chained_functions_results);
					}catch(e){
						if (scope._error){
							scope._error(scope._err,scope.chained_functions_results);
						}
					}finally{
						if (scope._finally){
							scope._finally(scope._err,scope.chained_functions_results);
						}
					}
				}
			}
		}
	},scope.chained_functions_results); // passing current results
}

