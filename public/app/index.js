function formatDateTime(d){
	var dt = new Date(d);
	var h = dt.getHours()+'';
	var m = dt.getMinutes()+'';
	var s = dt.getSeconds()+'';
	if (h.length==1){h='0'+h;}
	if (m.length==1){m='0'+m;}
	if (s.length==1){s='0'+s ;}
	return h+':'+m+':'+s+"\n"+(dt.getMonth()+1)+"/"+dt.getDate()+"/"+dt.getFullYear();
}
function reloadChart(){} // emtpy, for later use

var liveData = false;
var socket;

$( document ).ready(function() {
	
	
	socket = io.connect(window.location.origin);
	
	
	$('#reload').click(function(){
		reloadChart();
	});
	
	$('#month').click(function(){
		$.ajax({
			url: "/chartData/"+server+"/"+program+"/"+tag+"",
			type: 'post',
			data:{
				show: 'month'
			},
		}).done(createChart);
	});

	
	$('#week').click(function(){
		$.ajax({
			url: "/chartData/"+server+"/"+program+"/"+tag+"",
			type: 'post',
			data:{
				show: 'week'
			},
		}).done(createChart);
	});
	
	$('#day').click(function(){
		$.ajax({
			url: "/chartData/"+server+"/"+program+"/"+tag+"",
			type: 'post',
			data:{
				show: 'day'
			},
		}).done(createChart);
	});
	
	$('#startstop').click(function(){
		if(liveData){
			$('#startstop .txt').html('Start');
			$('#startstop').removeClass('active');
			$('#startstop .glyphicon').removeClass('glyphicon-stop');
			$('#startstop .glyphicon').addClass('glyphicon-play');
			liveData=false;
		}else{
			$('#startstop .txt').html('Stop');
			$('#startstop').addClass('active');
			$('#startstop .glyphicon').removeClass('glyphicon-play');
			$('#startstop .glyphicon').addClass('glyphicon-stop');
			liveData=true;
		}
	});
	
	$.ajax({
		url: "/chartData/"+server+"/"+program+"/"+tag+"",
		
	}).done(createChart);
	
	
});

var createChart=function( obj ) {
	var data = obj.list;
	var vdata = data;
	if (typeof obj.preveredChart=='undefined'){
		obj.preveredChart = 'lineChart';
	}
	nv.addGraph(function() {
		
		
		//			var chart = nv.models.cumulativeLineChart();
		//var chart = nv.models.lineChart();
		//var chart = nv.models.multiBarHorizontalChart();
		//var chart = nv.models.scatterChart();
		//var chart = nv.models.discreteBarChart();
		//var chart = nv.models.pieChart();
		//var chart = nv.models.multiBarChart();
		var chart;
		if (typeof nv.models[obj.preveredChart]=='function'){
			chart = nv.models[obj.preveredChart]();
		}else{
			chart = nv.models.lineChart();
		}
		var mx = 0;
		var mxi = 0;
		for(var i =0;i<vdata.length;i++){
			if (mx<vdata[i].values.length){
				mx=vdata[i].values.length;
				mxi=i;
			}
		}
		var diff = Math.abs(vdata[mxi].values[0].x-vdata[mxi].values[vdata[mxi].values.length-1].x);
		if (diff> 24*60*60* 1000){
			chart.xAxis.axisLabel('Time').tickFormat(function(d) {
				return d3.time.format("%Y-%m-%d")(new Date(d))
			});
		}else{
			chart.xAxis.axisLabel('Time').tickFormat(function(d) {
				return d3.time.format("%H:%M:%S")(new Date(d))
			});
		}
		chart.yAxis.axisLabel('Percent').tickFormat(d3.format('.02f'));
		
		d3.select('#chart').datum(vdata).transition().duration(500).call(chart);
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
		
		
		reloadChart = function(){
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
		}
		window.setInterval(function(){
			if (liveData){
				reloadChart();
			}
		},3000)
		
		return chart;
	});
}