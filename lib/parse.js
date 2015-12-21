var fs = require('fs')
var xmldom = require('xmldom');
var TAG_KEY = '#';
var CHILD_KEY = '['
function filterNode(node,filter){
	if(node.nodeType == 1){
		node =  filter(node);
		if(!node)return null;
		var child = node.firstChild;
		while(child){
			var child2 = filterNode(child,filter);
			if(child2 != child){
				if(child2 ){
					node.insertBefore(child2,child)
				}
				//console.error('remove element:',child+'')
				node.removeChild(child)
			}
			child = child.nextSibling
		}
		var attrs = node.attributes;
		var i = attrs.length;
		while(i--){
			var attr = attrs.item(i);
			if(filter(attr) == null){
				//console.error('remove attributes: ',attr+'');
				node.removeAttributeNode(attr)
			}
		}
		return (node);
	}else if(node.nodeType == 9){
		filterNode(node.documentElement,filter)
		return node;
	}else{
		return filter(node)
	}
}
function svgClear(node){
	switch(node.nodeType){
	case 2://attr
		if(node.nodeName == 'id'){
			var inDefs ;
			var p = node.ownerElement.parentNode;
			while(p){
				if(p.nodeName == 'defs'){
					inDefs = true;
					break;
				}
				p = p.parentNode;
			}
			if(!inDefs){
				return null;
			}
		}
	case 1://attrs && node
		var nodeName = node.nodeName;
		if(nodeName.indexOf(':')>0 ||nodeName=='metadata'){//删掉有所的非默认名称空间
			//console.log('debug remove ns node',node+'')
			return null;
		}
		break;
	case 3:
		return null;//删除所有文字
	}
	return node;
}
exports.gen = function(paths,idMap,options){
	var sourceMap = {};
	var bin = fs.openSync('./output.bin', 'a+');
	for(var i=0;i<paths.length;i++){
		var p = paths[i];
		sourceMap[p] = fs.readFileSync(p).toString().replace(/<\?.*?\?>/,'');//ignore xml dec
		
		fs.writeSync(bin, sourceMap[p]);
	}
	
	var domMap = {};
	var filter = svgClear;
	
	for(var p in sourceMap){
		var parser = new xmldom.DOMParser();
		//try
		{
			var dom = parser.parseFromString(sourceMap[p]);
			if(filter){
				dom = filterNode(dom,filter);
				//console.log('filter:',dom+'');
				//filter = null;
			}
			domMap[p] = dom;
			sourceMap[p] = dom.toString();
		//}catch(e){//console.error('parse xml error:', p, e);delete contentMap[p];
			
		}
	}
	var idHitMap = {};
	var valueHitMap = {};
	for(var p in domMap){
		parseXMLTokens(domMap[p],idHitMap,valueHitMap);
	}
	var tokenIds = genHitFrequencyList(idHitMap,-1);
	var tokenValues = genHitFrequencyList(valueHitMap,5);//最少两次命中才会申明为变量
	var tokenIdMap = {};
	tokenIds.map(function(t,i){tokenIdMap[(t)] = i})
	
	var decodedTokenIds = tokenIds.map(function(c){return c.replace(/[#[]/g,'')});
	for(var i = 0;i<tokenValues.length;i++){
		var t = tokenValues[i];
		var p = decodedTokenIds.indexOf('');
		if(p>=0){
			decodedTokenIds[p]=t;
		}else{
			decodedTokenIds.push(t);
		}
	}
	var resultMap = {};
	var tagKey = tokenIdMap[TAG_KEY];//十进制数字
	var childKey = tokenIdMap[CHILD_KEY];
	//console.log(Object.keys(domMap))
	for(var p in domMap){
		var dom = domMap[p];
		var json = genJSON(dom,tokenIdMap,decodedTokenIds);
		//console.log(dom.toString+'')
		var resource2 = decodeXML(json,decodedTokenIds,tagKey,childKey)
		//console.log(resource2)
		var s1 = xmlsort(sourceMap[p]);
		var s2 = xmlsort(resource2)
		if(s1 != s2){
			console.error('Encode Check Error:',p,'\n')
			console.log(s1)
			console.log(' !=   ')
			console.log(s2)
			//console.dir(JSON.stringify(json))
			break;
		}
		resultMap[p] = json;
	}
	var decoder = decoderSource;
	if(tokenIds.length <10){
		decoder = decoderSource.replace(/parseJSONKeyable\(([^)]+)\)/g,'$1')
	}else if(tokenIds.length < 36){
		decoder = decoderSource.replace(/parseJSONKeyable\(([^)]+)\)/g,'parseInt($1,36)')
	}else{
		decoder +='\n'+parseJSONKeyable;
	}
	
	var result = [decoder,'\nvar tokenIds='+JSON.stringify(decodedTokenIds)];
	for(var p in resultMap){
		var id = (idMap && idMap[p] || p).replace(/[^\w\$]/g,'_')
		result.push('\nexports.$'+id+'='+JSON.stringify(resultMap[p]))
	}
	result.push('\nexports.toXML = function(json){return decodeXML(json,tokenIds,',tagKey,',',childKey,')}')
	return result.join('');//.slice(0,80000);
}
var decoderSource = decodeXML.toString();
function decodeXML(json,tokenIds,tagKey,childKey){
	var tagValue = json[parseJSONKeyable(tagKey)];
	var tagName = tokenIds[tagValue];
	var children = json[parseJSONKeyable(childKey)];
	var source = ["<",tagName];
	for(var n in json){
		if(n != tagKey && n != childKey){
			var attrName = tokenIds[parseJSONKeyable(n)];
			var attrValue = json[n]
			if(typeof attrValue == 'number'){
				attrValue = tokenIds[attrValue];
			}
			source.push(' ',attrName,'="',attrValue,'"');
		}
	}
	if(children){
		source.push('>')
		for(var i=0;i<children.length;i++){
			var child = children[i];
			if(typeof child == 'string'){
				source.push(child)
			}else{
				source.push(decodeXML(child,tokenIds,tagKey,childKey))
			}
		}
		source.push('</',tagName,'>')
	}else{
		source.push('/>')
	}
	return source.join('')
}
function parseJSONKeyable(t){
	var v = parseInt(t,36);
	if(v>= 36){
		throw new Error('not support')
	}else if(v >=10 && t < 'a'){//a-z
		return v+26;
	}
	return v;
}


function toJSONKeyable(v){
	if(v>=62){
		throw new Error('not support')
	}else if(v>=36){
		return v.toString(v-26).toUpperCase();
	}
	return v.toString(36);
}
function xmlsort(source){
	var dom = new xmldom.DOMParser().parseFromString(source);
	var text = dom.toString(function(a1,a2){
		return a1.nodeName > a2.nodeName?1:-1;
	})
	return text;
}
function genJSON(node,tokenIdMap,decodedTokenIds){
	switch(node.nodeType){
		case 9://document
		return genJSON(node.documentElement,tokenIdMap,decodedTokenIds);
		case 1://element
			var result = {};
			var tagKey = tokenIdMap[TAG_KEY];
			result[toJSONKeyable(tagKey)] = tokenIdMap [node.tagName];
			var attrs = node.attributes;
			var len = attrs.length;
			for(var i=0;i<len;i++){
				var attr = attrs.item(i);
				var attrKey = tokenIdMap [attr.nodeName];
				var value = attr.nodeValue
				var p = decodedTokenIds.indexOf(value);
				
				result[toJSONKeyable(attrKey)] = p>=0?p:value;
			}
			var child = node.firstChild
			if(child){
				var childKey = tokenIdMap[CHILD_KEY];
				var children = result[toJSONKeyable(childKey)] = [];
				do{
					children.push(genJSON(child,tokenIdMap,decodedTokenIds));
				}while(child = child.nextSibling)
			}
			var max = 0;
			var arr = [];
			var count = 0;
			for(var n in result){
				var v = parseJSONKeyable(n);
				arr[v] = result[n];
				max = Math.max(v,max);
				count ++;
			}
			if(count == max+1){
				return arr;
			}
			return result;
		case 3:
			return node.nodeValue
	}
}
function parseXMLTokens(node,idIncMap,attrIncMap){
	switch(node.nodeType){
		case 9://document
			return parseXMLTokens(node.documentElement,idIncMap,attrIncMap);
		case 1://element
			incHit(idIncMap,TAG_KEY);
			incHit(idIncMap,node.tagName);
			var attrs = node.attributes;
			var len = attrs.length;
			for(var i=0;i<len;i++){
				var attr = attrs.item(i);
				incHit(idIncMap,attr.nodeName);
				incHit(attrIncMap,attr.nodeValue);
			}
			var child = node.firstChild;
			if(child){
				incHit(idIncMap,CHILD_KEY);
				do{
					parseXMLTokens(child,idIncMap,attrIncMap)
				}while(child= child.nextSibling)
			}
	}
}


/* utils*/


function xmlsort(source){
	var dom = new xmldom.DOMParser().parseFromString(source);
	var text = dom.toString(function(a1,a2){
		return a1.nodeName > a2.nodeName?1:-1;
	})
	return text;
}
function parseJSONKeyable(t){
	var v = parseInt(t,36);
	if(v>= 36){
		throw new Error('not support')
	}else if(v >=10 && t < 'a'){//a-z
		return v+26;
	}
	return v;
}

function genHitFrequencyList(map,minHit){
	var buf = [];
	for(var n in map){
		buf.push([map[n],n]);
	}
	buf.sort(function(a1,a2){
		return a1[0]-a2[0];
	});
	var i = buf.length;
	var inc = 0;
	//var hitIdMap = {};
	var hitIds = [];
	while(i--){
		//hitIdMap[buf[i][1]] = inc++;
		var item = buf[i];
		if(item[0]>=minHit && item[1]){
			hitIds.push(item[1])
		}
	}
	return hitIds;
	//return hitIdMap;
}
function incHit(result,key){
	if(key in result){
		result[key]++;
	}else{
		result[key]=1;
	}
}