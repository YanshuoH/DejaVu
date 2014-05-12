
var cp = require('child_process');
cp.exec('ls -l', function(e, stdout, stderr) {
　　if(!e) {
　　　　console.log(stdout);
　　　　console.log(stderr);
　　}
});