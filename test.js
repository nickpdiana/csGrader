const { spawn } = require("child_process");

const ls = spawn("python3", ["../../../COSC101L/grading/lab4/output/Abbie\ Sloan_1438465_assignsubmission_file_/lab4_turtle.py"]);
//const ls = spawn("echo", ["test@test.com","|","python3","../hw04/output/berenblumra/hw4_email.py"]);

ls.stdin.write('10\n10');
ls.stdin.end();

ls.stdout.on("data", data => {
    // console.log(`stdout: ${data}`);
    console.log(`\n${data}`);
});

ls.stderr.on("data", data => {
    console.log(`stderr: ${data}`);
});

ls.on('error', (error) => {
    console.log(`error: ${error.message}`);
});

ls.on("close", code => {
    console.log(`child process exited with code ${code}`);
});


// ls.stdout.pipe(process.stdout);

