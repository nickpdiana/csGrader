const express = require('express')
const app = express()
const port = 3000

const open = require('open');
const path = require('path');
const fs = require('fs-extra');
const hljs = require('highlightjs');
const rtfToHTML = require('@iarna/rtf-to-html')
var textract = require('textract');
var stringify = require('csv-stringify');
const mammoth = require('mammoth');
// const childProcess = require('child_process')
// const { spawn } = childProcess.spawn;
// const { spawnSync } = childProcess.spawnSync;

const { spawn, spawnSync } = require('child_process');

app.use(express.static('.'))

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '100kb'}))

app.get('/', (req, res) => {
  // res.send('Hello World!')

})

function save(req, res, file, dat){
	fs.writeFile(req.body.dir+'/'+file, dat, function (err) {
	  if (err) return console.log(err);
	  res.send(req.body.dat);
	});
}

function load(req, res, file){
	fs.readFile(req.body.dir+'/'+file, function(err, data){
			res.send(data);
	})
}

app.post('/save', function(req, res){
	fs.writeFile(req.body.dir+'/grades.txt', req.body.dat, function (err) {
	  if (err) return console.log(err);
	  res.send(req.body.dat);
	});
})

app.post('/load', function(req, res){
	fs.readFile(req.body.dir+'/grades.txt', function(err, data){
		if (err){
			console.log(err)
			res.send(err)
		}
		else
			res.send(data);
	})
})

app.post('/saveRubricData', function(req, res){
	save(req, res, 'rubric.json', req.body.dat)
})

app.post('/loadRubricData', function(req, res){
	load(req, res, 'rubric.json')
})

app.post('/saveStudentData', function(req, res){
	save(req, res, 'students.json', req.body.dat)
})

app.post('/loadStudentData', function(req, res){
	load(req, res, 'students.json')
})

app.post('/loadEmailAddresses', function(req, res){
	load(req, res, 'emailAddresses.csv')
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
    	var far = file.split('.')
    	var ext = far[far.length-1].toLowerCase();

    	console.log(file)

    	var o = {
    		name: file,
    		runOriginal: true
    	}	

		if (ext === 'py'){
			if (file == 'grader.py')
				continue;
			o.raw = fs.readFileSync(directoryPath+"/"+file, {encoding:'utf8', flag:'r'})
			var ret = await fs.promises.readFile(directoryPath+"/"+file, 'utf8', function(err, data) {
				if (err) throw err;
			})
			o.type = 'py'
			o.html = '<pre>'+hljs.highlight('python', ret).value+'</pre>';
		}
		if (ext === 'html'){
			var ret = await fs.promises.readFile(directoryPath+"/"+file, 'utf8', function(err, data) {
				if (err) throw err;
			})
			o.type = 'html'
			o.html = ret;
		}
		if (ext === 'txt'){
			var ret = await fs.promises.readFile(directoryPath+"/"+file, 'utf8', function(err, data) {
				if (err) throw err;
			})
			o.type = 'txt'
			o.html = '<pre>'+ret+'</pre>';
		}
		if (ext === 'rtf'){
			// var ret = await fs.promises.readFile(directoryPath+"/"+file, 'utf8', function(err, data) {
			// 	if (err) throw err;
			// })
			var ret = await new Promise((resolve, reject) => {
				var options = {
					preserveLineBreaks: true
				}
				textract.fromFileWithPath(directoryPath+"/"+file, options, function( error, text ) {
					if (error) throw error;
					console.log(text);
					resolve(text);
				})
			})
			// var h = await new Promise((resolve, reject) => {
			// 	rtfToHTML.fromString(ret, function(err,html){
			// 		if (err) throw err;
			// 		resolve(html);
			// 	});
			// });
			o.type = 'txt'
			o.html = '<pre>'+ret+'</pre>';
			// o.type = 'txt'
			// o.html = '<pre>'+convertToPlain(ret);+'</pre>'
		}
		if (ext === 'pdf'){

				var srcPath = directoryPath+"/"+file;
				var destPath = 'tmp.pdf'
				// fs.copyFileSync(srcPath, destPath);

				if (fs.existsSync('stuDir'))
					fs.unlinkSync('stuDir')
				fs.symlinkSync(directoryPath, 'stuDir', 'dir')

				o.type = "html"
				o.html = `<embed id="embededPDF" src="${"stuDir/"+encodeURIComponent(file)}" />`
		}
		if (ext === 'docx'){
			var ret = await new Promise((resolve, reject) => {

				mammoth.convertToHtml({path: directoryPath+"/"+file})
		    .then(function(result){
		        var html = result.value; // The generated HTML
		        // var messages = result.messages; // Any messages, such as warnings during conversion
		        resolve(html)
		    })
		    .done();

			})
			o.type = 'html'
			o.html = '<div id="docxContain">'+ret+'</div>';
		}
		rar.push(o);
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

function runScriptWithInput(req, res, input){
	return new Promise(function(resolve, reject){
		const ls = spawn("python3", [req.body.path], {cwd: path.dirname(req.body.path)});

		console.log('')
		console.log(`Running ${req.body.path} with piped input`);
		console.log('------------------------------------')

		ls.stdin.write(input);
		ls.stdin.end();

		var ret = [];
		ls.stdout.on("data", data => {
		    console.log(`${data}`);
		    ret.push(`${data}`);
		});

		ls.stderr.on("data", data => {
		    console.log(`stderr: ${data}`);
		});

		ls.on('error', (error) => {
		    console.log(`error: ${error.message}`);
		});

		ls.on("close", code => {
		    console.log(`child process exited with code ${code}`);
		    resolve(ret.join('\n'));
		});
	})
}

app.post('/runScript', async function(req, res){

	var aggRet = []
	var runs = req.body.input.split(';')
	let promises = [];

	for (let i=0; i<runs.length; i++){
		var inp = runs[i].split(',').join('\n');
		console.log("Running script with:\n"+inp)
		var ret = await runScriptWithInput(req, res, inp);
		aggRet.push(ret);
	}

	// runs.forEach(function(run){
	// 	var inp = run.split(',').join('\n');
	// 	console.log("Running script with:\n"+inp)
	// 	var ret = runScriptWithInput(req, res, inp);
	// 	aggRet.push(ret)
	// })

	console.log("AggRet:")
	console.log(aggRet)
	res.send(aggRet);
});

app.post('/runScriptWithLine', function(req, res){

	var newPath = req.body.path+"_temp.py";
	console.log('')
	console.log(`Running ${newPath} with piped input`);
	console.log('------------------------------------')
	fs.copyFile(req.body.path, newPath, function(err){

		fs.appendFileSync(newPath, req.body.line);

		const ls = spawn("python3", [newPath], {cwd: path.dirname(req.body.path)});

		ls.stdin.write(req.body.input);
		ls.stdin.end();

		var ret = [];
		ls.stdout.on("data", data => {
		    console.log(`${data}`);
		    ret.push(`${data}`);
		});

		ls.stderr.on("data", data => {
		    console.log(`stderr: ${data}`);
		});

		ls.on('error', (error) => {
		    console.log(`error: ${error.message}`);
		});

		ls.on("close", code => {
		    console.log(`child process exited with code ${code}`);
		    fs.unlinkSync(newPath);
		    console.log(`Temporary file ${newPath} deleted`);
		    res.send(ret);
		});

	})
});


app.post('/runEditedScript', function(req, res){
	var newPath = req.body.path+"_temp.py";

	console.log('')
	console.log(`Running ${newPath} with piped input`);
	console.log('------------------------------------')

	fs.writeFile(newPath, req.body.code, function(err){

		const ls = spawn("python3", [newPath], {cwd: path.dirname(req.body.path)});

		ls.stdin.write(req.body.input);
		ls.stdin.end();

		var ret = [];
		ls.stdout.on("data", data => {
		    console.log(`${data}`);
		    ret.push(`${data}`);
		});

		ls.stderr.on("data", data => {
		    console.log(`stderr: ${data}`);
		});

		ls.on('error', (error) => {
		    console.log(`error: ${error.message}`);
		});

		ls.on("close", code => {
		    console.log(`child process exited with code ${code}`);
		    fs.unlinkSync(newPath);
		    console.log(`Temporary file ${newPath} deleted`);
		    res.send(ret);
		});

	})
});

app.post('/runGraderOnAll', function(req, res){

	var directoryPath = req.body.path;

	var rar = []

	var dirs = fs.readdirSync(directoryPath+'/output', { withFileTypes: true })
	    .filter(dirent => dirent.isDirectory())
	    .map(dirent => dirent.name)

	dirs.forEach(function(destDir){

		var srcPath = req.body.path+'/grader.py';
		var destPath = directoryPath+'/output/'+destDir+'/grader.py';
		fs.copyFileSync(srcPath, destPath); // copy grader.py to student dir
		
		const ls = spawnSync("python3",  ['grader.py'], {cwd: path.dirname(destPath)});
		fs.unlinkSync(destPath) // remove grader.py from student dir
	})

	res.send("Grader run")

});

app.post('/makeGradeWorksheet', function(req, res){
	var hwDirPath = req.body.dir;
	console.log(hwDirPath);

	stringify(req.body.dat, function(err, output) {
	  fs.writeFile(req.body.dir+'/gradeWorksheet.csv', output, 'utf8', function(err) {
	    if (err) {
	      console.log('Some error occured - file either not saved or corrupted file saved.');
	      res.send("Error saving grade worksheet");
	    } else {
	    	res.send('Grade worksheet saved!');
	    }
	  });
	});

})

app.post('/makeGradeFile', function(req, res){

	var hwDirPath = req.body.path;
	console.log(hwDirPath);
	
	const ls = spawn("python3", ['mkgradesheet.py', '-g', `${hwDirPath}/grades.txt`, '-c', `${hwDirPath}/moodleGrades.csv`, '-o', `${hwDirPath}/gradeOutput.csv`, '-f']);

	var ret = [];
	ls.stdout.on("data", data => {
	    console.log(`${data}`);
	    ret.push(`${data}`);
	});

	ls.stderr.on("data", data => {
	    console.log(`stderr: ${data}`);
	});

	ls.on('error', (error) => {
	    console.log(`error: ${error.message}`);
	    res.send(`error: ${error.message}`)
	});

	ls.on("close", code => {
	    console.log(`child process exited with code ${code}`);
	    res.send(ret);
	});

});

app.post('/copyCommonFiles', function(req, res){
	var directoryPath = req.body.path;

	var rar = []

	var dirs = fs.readdirSync(directoryPath+'/output', { withFileTypes: true })
	    .filter(dirent => dirent.isDirectory())
	    .map(dirent => dirent.name)

	dirs.forEach(function(destDir){
		// var files = fs.readdirSync(directoryPath+'/copy')

		// files.forEach(function(file){
		// 	var srcPath = req.body.path+'/copy/'+file;
		// 	var destPath = directoryPath+'/output/'+destDir+'/'+file;
		// 	fs.copyFileSync(srcPath, destPath);
		// })

		var source = req.body.path+'copy';
		var destination = directoryPath+'/output/'+destDir;
		try {
			fs.copySync(source, destination)
			console.log("Success!")
		} catch (err){
			console.error(err)
		}
	})
	res.send('Files copied!');

})

function convertToPlain(rtf) {
    rtf = rtf.replace(/\\par[d]?/g, "");
    rtf = rtf.replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, "")
    return rtf.replace(/\\'[0-9a-zA-Z]{2}/g, "").trim();
}




app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
 //  open( `http://localhost:${port}`, function (err) {
	//   if ( err ) throw err;    
	// });
})