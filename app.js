const express = require('express')
const app = express()
const port = 3000

const path = require('path');
const fs = require('fs');
const hljs = require('highlightjs');
const rtfToHTML = require('@iarna/rtf-to-html')

app.use(express.static('.'))

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.get('/', (req, res) => {
  // res.send('Hello World!')

})

app.post('/save', function(req, res){
	fs.writeFile(req.body.dir+'/grades.txt', req.body.dat, function (err) {
	  if (err) return console.log(err);
	  res.send(req.body.dat);
	});
})

app.post('/load', function(req, res){
	fs.readFile(req.body.dir+'/grades.txt', function(err, data){
		res.send(data);
	})
})

app.post('/highlightFile', function(req, res){
	fs.readFile(req.body.path, 'utf8', function(err, data) {
		if (err) throw err;
		var html = hljs.highlight('python', data)
		res.send(html);
	});
})

app.post('/processFiles', async function(req, res){
	var rar = []
	directoryPath = req.body.path;
	console.log(directoryPath);
	var files = req.body.files
	console.log(files)

    //listing all files using forEach
    for (var i=0; i<files.length; i++){
    	var file = files[i];
    	console.log(file)
		if (file.py){
			var ret = await fs.promises.readFile(directoryPath+"/"+file.py.name, 'utf8', function(err, data) {
				if (err) throw err;
			})
			file.py.html = hljs.highlight('python', ret).value
		}
		if (file.grader){
			var ret = await fs.promises.readFile(directoryPath+"/"+file.grader.name, 'utf8', function(err, data) {
				if (err) throw err;
			})
			file.grader.html = ret;
		}
		if (file.rtf){
			var ret = await fs.promises.readFile(directoryPath+"/"+file.rtf.name, 'utf8', function(err, data) {
				if (err) throw err;
			})
			var h = await new Promise((resolve, reject) => {
				rtfToHTML.fromString(ret, function(err,html){
					if (err) throw err;
					console.log(html);
					resolve(html);
				});
			});
			console.log(h);
			file.rtf.html = h;
		}
		console.log("PUSH FILE");
		rar.push(file);
    };
    res.send(rar);
});

app.post('/getHighlightedPythonFiles', async function(req, res){
	console.log("GETTING HIGHLIGHTED PYTHON FILES")
	var rar = []
	directoryPath = path.join(__dirname, req.body.path);
	console.log(directoryPath);
	var files = req.body.files
	console.log(files)

    //listing all files using forEach
    for (var i=0; i<files.length; i++){
    	var file = files[i];
    	console.log(file)
    	var tar = file.split('.')
		if (tar[tar.length-1] == 'py'){
			var ret = await fs.promises.readFile(directoryPath+"/"+file, 'utf8', function(err, data) {
				if (err) throw err;
				// var html = 
				// return html;
			})
			rar.push(hljs.highlight('python', ret).value);
		}
    };
    res.send(rar);
})


app.post('/ls', function(req, res){
	//joining path of directory 

	// var directoryPath = __dirname;
	var directoryPath = req.body.path;

	// if (req.params.path)
	// 	directoryPath = path.join(directoryPath, req.params.path);
	// if (req.params.path2)
	// 	directoryPath = path.join(directoryPath, req.params.path2);
	// if (req.params.path3)
	// 	directoryPath = path.join(directoryPath, req.params.path3);
	// if (req.params.path4)
	// 	directoryPath = path.join(directoryPath, req.params.path4);

	console.log(directoryPath)

	var rar = []
	// directoryPath = __dirname
	// res.send(directoryPath)
	//passsing directoryPath and callback function
	fs.readdir(directoryPath, function (err, files) {
	    //handling error
	    if (err) {
	        return console.log('Unable to scan directory: ' + err);
	    } 
	    //listing all files using forEach
	    files.forEach(function (file) {
	        // Do whatever you want to do with the file
	        rar.push(file);
	        console.log(file);
	    });
	    // res.send(JSON.stringify(rar))
	    res.send(rar)
	});
	// res.send(JSON.stringify(rar));
});




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})