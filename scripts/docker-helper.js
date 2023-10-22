const {exec} = require('child_process');

const imgName = 'zokrates/zokrates';
const ctName = 'zokrates';
const zkDir = "/home/zokrates/zk-related";

const zokratesExec = (cmd) => {
  if (cmd.startsWith('./')) {
    cmd = cmd.slice(2);
  }

  const c = exec(
    `docker exec --workdir ${zkDir} ${ctName} ../${cmd}`
  );

  return new Promise((resolve, reject) => {
    c.stdout.on('data', function(data) {
      // console.log('stdout: ' + data);
    });

    c.stderr.on('data', function(data) {
      // console.log('stderr: ' + data);
    });

    c.on('exit', function(code) {
      // console.log('exit: ' + code);

      if (!code) resolve(code);
      else reject(new Error(`Exit with code ${code}: ${cmd}`));
    });
  });
};

module.exports = {
  zokratesExec,
};