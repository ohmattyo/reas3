const fs = require('fs');
const _ = require('lodash');

if(process.argv.length < 4){
    console.log('Usage: node index.js *filename* *keyword*');
    process.exit(1);
}

const readFile = async function(fileName){
    return await new Promise(function(resolve, reject){
        fs.readFile(fileName, 'utf8', function(err, data) {
            if(err){
                reject(err);
            }
            resolve(data);
        });
    });
};

const splitUserStories = async function(uS){
    return await new Promise(function(resolve){
        if(uS.includes('\n\n\n')){
            resolve(uS.split('\n\n\n'));
        }
        else if(uS.includes('\r\n\r\n\r\n')){
            resolve(uS.split('\r\n\r\n\r\n'));
        }
        else{
            console.log('String was unable to be separated!');
            process.exit(1);
        }

    });
};

const selectImportantUserStories = async function(userStoriesSplit, keyword){
    return await new Promise(function(resolve){
        let importantUserStories = [];
        _.each(userStoriesSplit, function(userStory){
            const isImportant = userStory.includes(keyword);
            if(isImportant){
                importantUserStories.push(userStory);
            }
        });
        resolve(importantUserStories);
    });
};

const execute = async function(){
    const userStoriesText = await readFile(process.argv[2]);
    const userStoriesSplit = await splitUserStories(userStoriesText);
    const importantUserStories = await selectImportantUserStories(userStoriesSplit, process.argv[3]);
};

execute();