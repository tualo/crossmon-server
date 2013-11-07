function formatDateTime(d){
	var dt = new Date(d);
	var h = dt.getHours()+'';
	var m = dt.getMinutes()+'';
	var s = dt.getSeconds()+'';
	if (h.length==1){h='0'+h;}
	if (m.length==1){m='0'+m;}
	if (s.length==1){s='0'+s ;}
	return h+':'+m+':'+s;
}
$( document ).ready(function() {
	
	/*
	window.setTimeout(function(){
		window.location.reload();
	},90000);
	*/
	
	var socket = io.connect(window.location.origin);
	 
		
	$.ajax({
		url: "/chartData/"+server+"/"+program+"/"+tag+"",
		
	}).done(function( data ) {
		var vdata = data;
		nv.addGraph(function() {

			var chart = nv.models.stackedAreaChart();
			chart.xAxis.axisLabel('Time').tickFormat(formatDateTime);
			chart.yAxis.axisLabel('Percent').tickFormat(d3.format('.02f'));
			 
			//d3.select('#chart').datum(vdata).transition().duration(500).call(chart);
			nv.utils.windowResize(chart.update);
			
			
			socket.on(""+server+"/"+program+"", function (data) {
				//var vdata = d3.select('#chart')[0][0].__data__;
				for(var i in vdata){
					
					if (vdata[i].tag==data.tag){
						 
						vdata[i].values.shift();
						vdata[i].values.push({
							x: data.time,
							y: data.value
						});
					}
				}
				
			});
				
				
			 
			window.setInterval(function(){
				var m = vdata[0].values.length;
				for(var i in vdata){
					m = Math.min(m,vdata[i].values.length);
				}
				
				for(var i in vdata){
					if (vdata[i].values.length>m){
						vdata[i].values.shift();
					}
				}
				
				d3.select('#chart')
				.datum(vdata)
				.transition().duration(50)
				.call(chart);
			},1000)
			 
			return chart;
		});
	});
	
	/*
	$.ajax({
		url: "/chartData/1/1/2",
		
	}).done(function( data ) {
		var vdata = [
			{
				values: data,
				key: 'Memory',
				color: '#7fff0e'
			}
		];
		nv.addGraph(function() {
			var chart = nv.models.stackedAreaChart();
			
			chart.xAxis
			.axisLabel('Time')
			.tickFormat(formatDateTime);
				//d3.format(',r'));
			
			chart.yAxis
			.axisLabel('MB')
			.tickFormat(function(d) { 
				return d3.format('.02f')(d/1024/1024) 
			});
			
			d3.select('#memory')
			.datum(vdata)
			.transition().duration(500)
			.call(chart);
			 
			socket.on('1/1/2', function (data) {
				 
				vdata[0].values.shift();
				vdata[0].values.push({
					x: data.time,
					y: data.value
				});
				d3.select('#memory')
				.datum(vdata)
				.transition().duration(5)
				.call(chart);
				 
			});
			 
			nv.utils.windowResize(chart.update);
			
			return chart;
		});
	});
	*/
});