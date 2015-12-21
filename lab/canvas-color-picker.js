function init(){
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d')
	var img = document.images[0];
	var out = document.anchors[0];
	canvas.width = img.width;
	canvas.height = img.height;
	ctx.drawImage(img,0,0);
	
	img.onmousemove = function(event){
		var x = event.clientX,y=event.clientY;
		var rgb = color(x,y)
		out.style.background = rgb;
		out.innerHTML = [x,y,'<br>'+rgb,[p[0],p[1],p[2]]];
	}
	function color(x,y){
		var p = ctx.getImageData(x,y,1,1).data;
		return '#'+[p[0],p[1],p[2]].map(function(v){
			return (0x100 | v).toString(16).substr(1)
		}).join('')
	}
	var html = ['<table>'];
	
	var start = [60,768]//660,884
	for(var i=0;i<4;i++){
		html.push('<tr>')
		var y = 768 + i*(884-768);
		for(j =0;j<7;j++){
			x = 60+(660-60)/6*j;
			html.push('<td style="color:#FFF;background-color:',color(x,y),'">',color(x,y),'</td>')
			
		}
		html.push('</tr>')
	}
	html.push('</table>');
	out.innerHTML = html.join('')
}
/*
经典
#2b8567	#1d9c7e	#22b59a	#4cd4bc	#1fe3bf	#90d7c5	#98c0b4
#04576b	#227580	#4699a3	#40baca	#52d6eb	#7dcadc	#88b8cc
#611023	#991924	#c24924	#de6530	#e67b63	#cc8f8f	#ae7d7d
#484570	#68638c	#8b85a8	#b3afc5	#c8c6d4	#cdcdd1	#a3a1a8


#7fadd1	#334c66	#c2576d	#f51a7a	#fa1836	#fd6404	#fdd39f
#f59c01	#eee715	#39fd61	#29e688	#38ffe2	#3ecbe6	#2a9bfd
#7394ff	#82f5ff	#0fd0ff	#2884ee	#073dff	#29688f	#083959
#595248	#fae084	#f0794a	#c03134	#28ba9f	#78075e	#cdcdd1

 */
document.write('<style>*{padding:0;margin:0;}</style><img src="2.png"><a name="a" href="#"></a>')
document.body.onload = init;