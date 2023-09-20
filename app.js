const express = require('express')
const zip = require('zip-a-folder')
const app = express()
const port = 3101

const open = require('open');
const path = require('path');
const fs = require('fs-extra');
const hljs = require('highlightjs');
const rtfToHTML = require('@iarna/rtf-to-html')
var textract = require('textract');
var stringify = require('csv-stringify');
const mammoth = require('mammoth');
var walk = require('walk');
// const childProcess = require('child_process')
// const { spawn } = childProcess.spawn;
// const { spawnSync } = childProcess.spawnSync;

const { spawn, spawnSync, exec } = require('child_process');

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
			if (err) console.log(err);
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

app.post('/getDirectories', function(req, res){
	var dirPath = req.body.parent+'/';
	var result = []; //this is going to contain paths

	// fs.readdir(__dirname + dirPath, function (err, filesPath) {
	fs.readdir(dirPath, function (err, filesPath) {
	    if (err) throw err;
	    result = filesPath.map(function (filePath) {
	        return dirPath + filePath;
	    }).filter(x => { return x.split('/').pop()[0] !== '.' }).filter(x => {
	    	return fs.lstatSync(x).isDirectory()
	    });
	    res.send(result)
	});
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

app.post('/openTerminalAtDir', function(req, res){
	console.log(req.body.path)
	exec('open -a Terminal ' + '"'+req.body.path+'"');
})

app.post('/processFiles', async function(req, res){
	console.log("Processing Files")
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
			o.raw = ret;
		}
		if (ext === 'txt'){
			var ret = await fs.promises.readFile(directoryPath+"/"+file, 'utf8', function(err, data) {
				if (err) throw err;
			})
			o.type = 'txt'
			o.html = '<pre>'+ret+'</pre>';
			o.raw = ret;
		}
		if (file.indexOf('_textresponse') !== -1){
			var ret = await fs.promises.readFile(directoryPath+"/"+file, 'utf8', function(err, data) {
				if (err) throw err;
			})

			var questionText = file.split('/');
			questionText.pop()
			questionText.push('Question text')
			questionText = questionText.join('/')
			var ret2 = await fs.promises.readFile(directoryPath+"/"+questionText, 'utf8', function(err, data) {
				if (err) throw err;
			})
			o.type = 'txt'
			o.html = `<div class='saQuestion'><div class="questionText">${ret2}</div><div class="textResponse">${ret}</div></div>`;
			o.raw = ret;
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
			o.raw = ret;
			// o.type = 'txt'
			// o.html = '<pre>'+convertToPlain(ret);+'</pre>'
		}
		if (ext === 'pdf'){

				var srcPath = directoryPath+"/"+file;
				var destPath = 'tmp.pdf'
				// fs.copyFileSync(srcPath, destPath);

				//if (fs.existsSync('stuDir')){
					//console.log('stuDir exists')
					fs.unlinkSync('stuDir')
				//}
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

app.post('/lsr', function(req, res){

	var files = [];

	// Walker options
	var directoryPath = req.body.path;
	var walker  = walk.walk(directoryPath, { followLinks: false });

	walker.on('file', function(root, stat, next) {
	    // Add this file to the list of files
	    var fullName = root + '/' + stat.name
	    files.push(fullName.replace(directoryPath, ''));
	    next();
	});

	walker.on('end', function() {
	    console.log(files);
	    res.send(files);
	});

})

function runScriptWithInput(req, res, input){
	return new Promise(function(resolve, reject){
		const ls = spawn("python3", [req.body.path], {cwd: path.dirname(req.body.path)});

		console.log('')
		console.log(`Running ${req.body.path} with piped input`);
		console.log('------------------------------------')

		ls.stdin.on("data", function(data) { // Doesn't work
			console.log("recieved " + data)
			ret.push(`\u001b[35m${data}\u001b[0m`)
		});

		

		
		// console.log("inp")
		// console.log(inpAr)
		var ret = [];
		var stderr = [];
		var err = [];

		ls.stdout.on("data", data => {
		    console.log(`${data}`);
		    // let i = inpAr[ret.length]
		    // console.log("hello", i)
		    // ret.push(`${data} ${i}`);
		    ret.push(`${data}`)
		});

		ls.stderr.on("data", data => {
		    console.log(`stderr: ${data}`);
		    ret.push(`\u001b[41m${data}\u001b[0m`)
		});

		ls.on('error', (error) => {
		    console.log(`error: ${error.message}`);
		    ret.push(`\u001b[41m${error}\u001b[0m`)
		});

		ls.on("close", code => {
		    console.log(`child process exited with code ${code}`);
		    ls.stdin.end();
		    if (stdInt) clearInterval(stdInt)
		    // resolve({stdout: ret.join('\n'), stderr: stderr.join('\n'), err: err.join('\n')});
		    resolve(ret.join('\n'));
		});

		var inpAr = input.split('\n')
		var i = 0
		var stdInt = setInterval(function(){
			console.log(i, inpAr[i])
			ls.stdin.write(inpAr[i]+'\n');
			ret[ret.length-1] += `\u001b[36m${inpAr[i]}\u001b[0m`
			i++
			if (i >= inpAr.length){
				ls.stdin.end();
				clearInterval(stdInt)
			}

		}, 50)

		// var inpAr = input.split('\n')
		// for (var i = 0; i < inpAr.length; i++) {
		// 	ls.stdin.write(inpAr[i]+'\n');
		// 	ret.push(`\u001b[35m${inpAr[i]}\u001b[0m`)
		// }

		// ls.stdin.write(input);
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


app.post('/runEditedScript', async function(req, res){
	var newPath = req.body.path+"_temp.py";

	console.log('')
	console.log(`Running ${newPath} with piped input`);
	console.log('------------------------------------')

	var tests = '';
	if (req.body.testingSuite === true){
		tests = fs.readFileSync('./testingSuite.py', {encoding:'utf8', flag:'r'});
	}

	var newFileData = req.body.code+'\n'+tests+'\n'+req.body.line;

	fs.writeFile(newPath, newFileData, async function(err){

		var aggRet = []
		var runs = req.body.input.split(';')
		let promises = [];

		for (let i=0; i<runs.length; i++){
			var inp = runs[i].split(',').join('\n');
			console.log("Running script with:\n"+inp)

			var modReq = {...req}
			modReq.body.path = newPath;

			var ret = await runScriptWithInput(req, res, inp);
			aggRet.push(ret);
		}

		console.log("AggRet:")
		console.log(aggRet)
		fs.unlinkSync(newPath);
		console.log(`Temporary file ${newPath} deleted`);
		res.send(aggRet);

		// const ls = spawn("python3", [newPath], {cwd: path.dirname(req.body.path)});

		// ls.stdin.write(req.body.input);
		// ls.stdin.end();

		// var ret = [];
		// ls.stdout.on("data", data => {
		//     console.log(`${data}`);
		//     ret.push(`${data}`);
		// });

		// ls.stderr.on("data", data => {
		//     console.log(`stderr: ${data}`);
		// });

		// ls.on('error', (error) => {
		//     console.log(`error: ${error.message}`);
		// });

		// ls.on("close", code => {
		//     console.log(`child process exited with code ${code}`);
		//     fs.unlinkSync(newPath);
		//     console.log(`Temporary file ${newPath} deleted`);
		//     res.send(ret);
		// });

	})
});

app.post('/runGraderOnAll', function(req, res){

	var directoryPath = req.body.path;
	console.log(directoryPath)

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

app.post('/makeGradeWorksheet', async function(req, res){
	var hwDirPath = req.body.dir;
	console.log(hwDirPath);

	var directoryPath = req.body.dir;

	var rar = []

	var dirs = fs.readdirSync(directoryPath+'/output', { withFileTypes: true })
	    .filter(dirent => dirent.isDirectory())
	    .map(dirent => dirent.name)

  //if (!fs.existsSync(directoryPath+'/feedback')){
	fs.mkdirSync(directoryPath+'/feedback', { recursive: true });
  //}
	dirs.forEach(function(dir){
		//if (!fs.existsSync(directoryPath+'/feedback'+dir)){
		fs.mkdirSync(directoryPath+'/feedback/'+dir, { recursive: true })
		//}
		var newFile = directoryPath+'/feedback/'+dir+'/feedback.html';
		fs.writeFileSync(newFile, req.body.fob[dir]);
	})

	await zip.zip(directoryPath+'/feedback', directoryPath+'/feedback.zip');

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

		var source = req.body.path+'/copy';
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