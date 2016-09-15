var readline = require('readline'),
    telegram = require('./telegram');

var interactive = () => {
  //this.context = typeof initContext === 'object' ? initContext : {};
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.setPrompt('> ');
  rl.prompt();
  rl.write(null, {ctrl: true, name: 'e'});
  rl.on('line', ((line) => {
    const msg = line.trim();
    var user = msg.split(',')[0].trim();
    var message = msg.split(',')[1].trim();
    telegram.sendMessage(user, message);

    rl.setPrompt('> ');
    rl.prompt();
    /*this.runActions(
      sessionId,
      msg,
      this.context,
      (error, context) => {
        if (error) {
          l.error(error);
        } else {
          this.context = context;
        }
        this.rl.prompt();
        this.rl.write(null, {ctrl: true, name: 'e'});
      },
      steps
    );*/
  }).bind(this));
};

interactive();
