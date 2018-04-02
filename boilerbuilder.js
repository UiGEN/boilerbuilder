
var request = require("request");
var fs = require('fs');
function runInjector(url, callback){
  request({
      url: url,
      json: true
  }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
          // console.log(body) // Print the json response
          callback(body);
      }
  });
}

var buildName = process.argv[2];
var parser = {
  url:  "http://mroczna.stronazen.pl/uigen/"+buildName,
  counter: 0,
  last_load: false,
  files: [],
  init: function(){
    
    /* create main file information */
    fs.readFile(__dirname+'/boilerplate.build.json',function(err,content){
      
      if(err){
        content = '{}';
      };
      var parseJson = JSON.parse(content);

      if(parseJson[buildName] == true){

        console.log("\x1b[36m%s\x1b[0m", "-- ░▒ \x1b[0m!! Build "+buildName+" exist\n");

      }else{

        parseJson[buildName] = true;
        fs.writeFile(__dirname+'/boilerplate.build.json',JSON.stringify(parseJson),function(err){
          if(err) throw err;
        });

        runInjector(parser.url+"/build.json", function callback(data){
          parser.files = data;
          parser.load();
        });

      }
    });

    /* end */

  },
  load: function(){

    var _path = this.url+"/"+parser.files[this.counter].path;

    runInjector(_path, function callback(data){

      var _dir =  __dirname+"/"+parser.files[parser.counter].path;

      if( parser.files[parser.counter].type == 'file' ){

        fs.writeFile(_dir, data, function (err) {
           if (err) throw err;
           console.log("\x1b[36m-- ░▒ \x1b[0m Create file: "+_dir);
           if(this.last_load){
              console.log("\x1b[36m%s\x1b[0m", "-- ░▒ ------------------------------------------------------------------------------------");
            }
        });

      }

      if( parser.files[parser.counter].type == 'code' ){

        var text = fs.readFileSync(_dir,'utf8');
        var tag = parser.files[parser.counter].before;
        var res = text.replace(tag, "// ░░ start "+buildName+"\n"+data+"\n// ░░ end "+buildName+"\n\n"+tag);

        fs.writeFile(_dir, res, function (err) {
           if (err) throw err;
           console.log("\x1b[36m-- ░▒ \x1b[0m Add code to: "+_dir);
           if(this.last_load){
              console.log("\x1b[36m%s\x1b[0m", "-- ░▒ ------------------------------------------------------------------------------------");
            }
        });
      }
        
      parser.counter++;
      if(parser.counter < parser.files.length){

          parser.load();
        
      }else{
        this.last_load = true;
      }

    });
  }
}
console.log("\n\x1b[36m%s\x1b[0m", "-- ░▒ ------------------------------------------------------------------------------------");
console.log("\x1b[36m-- ░▒ \x1b[0mStart build: \x1b[4m"+buildName+"\x1b[0m");
console.log("\x1b[36m%s\x1b[0m", "-- ░▒ ------------------------------------------------------------------------------------");
parser.init();
