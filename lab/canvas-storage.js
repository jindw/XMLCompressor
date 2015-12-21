var fs = require('fs'),
    PNG = require('pngjs').PNG;
var data = fs.readFileSync('output.bin');

var zlib = require('zlib');
//console.log(Object.keys(zlib),zlib.deflate+'')

var compressedData = require('zlib').deflate(data, function(e,compressedData){
	console.log("原始数据大小：",data.length/1024);
	console.log("压缩数据大小：",compressedData.length/1024)
});


var width = 2048;
var height = Math.ceil(data.length/width/4)
var png = new PNG({
    	width:width,
    	height:height,
        deflateChunkSize:32*1024,
    	checkCRC:false,
        filterType: 0,
        deflateLevel:9
    });
(function(){
    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            var idx = (this.width * y + x) << 2;

            // invert color
            this.data[idx] = data[idx]||0 ;//- this.data[idx];
            this.data[idx+1] = data[idx+1]||0;//255 - this.data[idx+1];
            this.data[idx+2] = data[idx+2]||0;//255 - this.data[idx+2];

            // and reduce opacity
            this.data[idx+3] = data[idx+3]||0;//this.data[idx+3] >> 1;
        }
    }

    this.pack().pipe(fs.createWriteStream('out.png'))
    this.on('end',function(a){
        
fs.createReadStream('out.png')
    .pipe(new PNG({
        filterType: 4
    }))
    .on('parsed', function() {
        for (var i = data.length - 1; i >= 0; i--) {
            if(data[i] != this.data[i]){
                console.error('unmatched data:',data[i]);
            }
        };


function readInt(){
    var value = 0;
    while (true) {
        var lastByte = data[index++];
        if (lastByte < 0) {
            return -1;
        } else if (lastByte <= 0x7F) {// ended
            return value | lastByte;
        } else {// not ended
            value |= (lastByte & 0x7F);
        }
        value <<= 7;
    }
}
data = this.data
        var offsets = []
        var keys = [];
        var index = 0;

        var count = readInt();
        console.log(count)
        var offset = 0;
        for(var i = 0;i<count;i++){
            var key = [readInt().toString(16)];
            var len = readInt();
            while(len == 0){
                key.push(readInt().toString(16));
                len = readInt();
            }
            if(i==0){
                console.log(key)
            }
            keys.push(key.join('-'));
            offsets.push(offset);
            offset+=len;
        }
        offsets = offsets.map(function(v){return v+index});
        //console.log(offsets[0],offsets[1],keys)

        //var source = data.slice(offsets[0],offsets[1]);
        var start = offsets[0];
        var end = offsets[1]
        var buf = [];
        var buf2 = [];
        //console.log(data)
        for(var i=start;i<end;i++){
            buf2.push(data[i])
            buf.push(String.fromCharCode(data[i] & 0xFF));
        }
//2963 5833
console.log(start ,end);
        console.log(buf2.join(','))
        console.log(buf.join(''))
        console.info('test success:',fs.readFileSync('out.png').length/1024);
    });




    });


}).apply(png,[]);


/**
<html>
<body>
<script>var exports = window
</script>
<script src="output.base64.js"></script>
<script src="svg3.js"></script>
<script>
alert(exports.toXML(exports.$1f4e0))
var rawData =atob(base64data);
//loadData();
function loadData(){
	var img = window.img = new Image();
	img.onload = function(){
		console.dir(img);
		var canvas = document.createElement('canvas')

		canvas.width = img.width;
		canvas.height = img.height;
		var ctx = canvas.getContext('2d')


	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	ctx.filter = "none";

		ctx.drawImage(img,0,0);
		data = ctx.getImageData(0,0,512,1024).data;
		//data = rawData.split('').map(function(c){return c.charCodeAt()})
		//console.log(data)
		//var indexMap = {};
		var offsets = []
		var keys = [];
		var index = 0;

		var count = readInt();
		console.log(count)
		var offset = 0;
		for(var i = 0;i<count;i++){
			var key = [readInt().toString(16)];
			var len = readInt();
			while(len == 0){
				key.push(readInt().toString(16));
				len = readInt();
			}
			if(i==0){
				//console.log(key)
			}
			keys.push(key.join('-'));
			offsets.push(offset);
			offset+=len;
		}
		offsets = offsets.map(function(v){return v+index});
		console.log(offsets[0],offsets[1])

		//var source = data.slice(offsets[0],offsets[1]);
		var start = offsets[0];
		var end = offsets[1]
		var buf = [];
		console.log(data)
		for(var i=start;i<end;i++){
			buf.push(String.fromCharCode(data[i] & 0xFF));
		}
		console.log(buf.join(''))

function readInt(){
	var value = 0;
	while (true) {
		var lastByte = data[index++];
		if (lastByte < 0) {
			return -1;
		} else if (lastByte <= 0x7F) {// ended
			return value | lastByte;
		} else {// not ended
			value |= (lastByte & 0x7F);
		}
		value <<= 7;
	}
}


		document.body.appendChild(canvas)
	}
	img.crossOrigin = 'Anonymous'
	img.src = "./out.png";
}
</script>
</body>
</html>
*/