const fs = require('fs');

if(process.argv.length < 3){
    // console.log('Usage: node ' + process.argv[1] + ' *filename*');
    console.log('Usage: node index.js *filename*');
    process.exit(1);
}

const fileName = process.argv[2];
let userStoriesText = null;

fs.readFile(fileName, 'utf8', function(err, data) {
    if (err) throw err;
    // console.log('OK: ' + fileName);
    // console.log(data)
    userStoriesText = data;
});

let userStories = userStoriesText.split('\n\n\n');

console.log(userStories[1]);

const execute = async function(){

};

// console.log('test');