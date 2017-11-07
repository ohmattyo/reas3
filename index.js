const fs = require('fs');

if(process.argv.length < 3){
    // console.log('Usage: node ' + process.argv[1] + ' *filename*');
    console.log('Usage: node index.js *filename*');
    process.exit(1);
}

const readFile = function(fileName){
    fs.readFile(fileName, 'utf8', function(err, data) {
        if (err) throw err;
        // console.log('OK: ' + fileName);
        // console.log(data)
        //return data.split('\n\n\n');
        return data;
    });
};

const splitUserStories = function(uS){
    return uS.split('\n\n\n');
};

const execute = async function(){
    const userStoriesText = await readFile(process.argv[2]);
    const userStories = await splitUserStories(userStoriesText);
    console.log('test');
};

execute();

// console.log('test');