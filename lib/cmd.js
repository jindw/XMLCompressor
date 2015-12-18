var fs = require('fs')
exports.run = function(args){
	var files = [];
	var fileMap = {};
	var key = '';
	var options = {};
	for(var i=0;i<args.length;i++){
		var f =args[i];
		if(key){
			options[key] = f;
			key = '';
		}else if(f.charAt() == '-'){
			key = f.replace(/^\-+/,'');
		}else if(f.indexOf('*')>=0){
			var dir = f.replace(/[^\\\/]+$/,'');
			var filename = f.substr(dir.length);
			var regexp = filename.replace(/[*-]/,function(c){
				if(c == '*')return '(.*)';
				if(c == '-')return '\-';
			})
			regexp = new RegExp('^'+regexp+'$')
			var list = fs.readdirSync(dir||'./');
			for(var j=0;j<list.length;j++){
				var n = list[j];
				var m = n.match(regexp);
				if(m){
					files.push(dir+n);
					fileMap[dir+n]=(m[1] || n.replace(/\.\w+$/,''))
				}
			}
		}else{
			files.push(f);
			fileMap[f]=(f.replace(/.*[\\\/]|\.\w+$/g,''))
		}
	}
	
	console.log(options)
	var content = require('./parse').gen(files,fileMap,options);
	var output = options.o || options.output;
	if(output == null){
		console.log('//please set -o <output file> for file output')
		console.log(content)
	}else{
		fs.writeFileSync('./'+output,content);
		console.log('file output > ',output)
	}
	
	//console.log(content)
}