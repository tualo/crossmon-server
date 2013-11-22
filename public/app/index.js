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

$( document ).ready(function() {
	
	
	var socket = io.connect(window.location.origin);
	
	
	$('#reload').click(function(){
		reloadChart();
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
		
	}).done(function( data ) {
		var vdata = data;
		nv.addGraph(function() {

			var chart = nv.models.lineChart();
			chart.xAxis.axisLabel('Time').tickFormat(formatDateTime);
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
				console.log('tick')
				if (liveData){
					reloadChart();
				}
			},3000)
			 
			return chart;
		});
	});
	
	
});