/*
  node boilerbuilder.js add build-name
  node boilerbuilder.js remove build-name
*/

var SERVERSRC = "http://mroczna.stronazen.pl/uigen/";
var buildMode = process.argv[2];
var buildName = process.argv[3];
var request = require("request");
var fs = require('fs');
function httpLoader(url, callback){
  request({
      url: url,
      json: true
  }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
          // console.log(body) // Print the json response
          callback(body);
      }else{
        console.log("\x1b[33m%s\x1b[0m", "-- ░▒  \x1b[30m\x1b[4m\x1b[31mRequest problem from:" ,url);
      }
  });
}
var parser = {
  url:  SERVERSRC+buildName,
  counter: 0,
  last_load: false,
  files: [],
  init: function(){
    /* create main file information */
    fs.readFile(__dirname+'/boilerplate.build.json',function(err,content){
      if(err){ content = '{}' };
      var parseJson = JSON.parse(content);
        if(buildMode == 'remove'){
          delete parseJson[buildName];
          console.log("\x1b[36m%s\x1b[0m", "-- ░▒ \x1b[33m\x1b[0m !! Build "+buildName+" removed");
        }else{
          if(parseJson[buildName] == true){
            console.log("\x1b[36m%s\x1b[0m", "-- ░▒ \x1b[4m\x1b[31m!! Build "+buildName+" exist\n");
          }else{
            parseJson[buildName] = true;
          }
        }
        fs.writeFile(__dirname+'/boilerplate.build.json',JSON.stringify(parseJson),function(err){
          if(err) throw err;
        });
        httpLoader(parser.url+"/build.json", function callback(data){
          parser.files = data;
          parser.load();
        });
    });
  },
  load: function(){
    /* init Action */
    var attrs = parser.files[this.counter];
    httpLoader(SERVERSRC+buildName+'/'+HELPER.getPath(attrs), function callback(data){
      if(buildMode == 'add'){
        ACTION[attrs.type](attrs,data);
      }
      if(buildMode == 'remove'){
        ACTION[attrs.type+"_remove"](attrs,data);
      }
      parser.nextStep();
    });
  },
  nextStep: function(){
    parser.counter++;
    if(parser.counter < parser.files.length){
        parser.load();
    }else{
      this.last_load = true;
    }
  }
}
console.log("\n\x1b[36m%s\x1b[0m", "-- ░▒ ------------------------------------------------------------------------------------");
if(buildMode == 'add'){
  console.log("\x1b[36m-- ░▒ \x1b[0mStart build: \x1b[4m"+buildName+"\x1b[0m");
}
if(buildMode == 'remove'){
  console.log("\x1b[36m-- ░▒ \x1b[0mStart remove: \x1b[4m"+buildName+"\x1b[0m");
}
console.log("\x1b[36m%s\x1b[0m", "-- ░▒ ------------------------------------------------------------------------------------");
parser.init();


/*
  actions
*/

var ACTION = {
  replaceBefore: function(data,contentToAdd){
    var content = fs.readFileSync(__dirname+"/"+data.path,'utf8');
    var tag = data.before;
    var res = content.replace(tag, contentToAdd+"\n"+tag);
    HELPER.writeContent(__dirname+"/"+data.path, res);
  },
  replaceBefore_remove: function(data,contentToAdd){
    var content = fs.readFileSync(__dirname+"/"+data.path,'utf8');
    var res = content.replace(contentToAdd, '');
    HELPER.writeContent(__dirname+"/"+data.path, res);
  },
  addEnd: function(data,contentToAdd){
    var content = fs.readFileSync(__dirname+"/"+data.path,'utf8');
    var res = content+contentToAdd;
    HELPER.writeContent(__dirname+"/"+data.path, res);
  },
  addEnd_remove: function(data,contentToAdd){
    var content = fs.readFileSync(__dirname+"/"+data.path,'utf8');
    var res = content.replace(contentToAdd, '');
    HELPER.writeContent(__dirname+"/"+data.path, res);
  },
}

/*
  helpers
*/
var HELPER = {
  getPath: function(data){
    if(data.path){
      var path = data.path;
    }
    if(data.from){
      var path = data.from;
    }
    if(!data.from && !data.path){
      console.log('no chuj, nie ma dir to plik');
    }
    return path;
  },
  writeContent: function(_dir,content){
    fs.writeFile(_dir, content, function (err) {
       if (err) throw err;
        if(buildMode == 'add'){
         console.log("\x1b[36m-- ░▒ \x1b[0m Add code to: "+_dir);
        }
        if(buildMode == 'remove'){
          console.log("\x1b[36m-- ░▒ \x1b[0m Remove code from: "+_dir);
        }
       if(parser.last_load){
          console.log("\x1b[36m%s\x1b[0m", "-- ░▒ ------------------------------------------------------------------------------------");
        }
    });
  }

}
