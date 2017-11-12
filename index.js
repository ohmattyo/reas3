const fs = require('fs');
const _ = require('lodash');
const stopword = require('stopword');

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

const keyUserStories = async function(uSs){
    return await new Promise(function(resolve){
        let userStories = [];
        _.each(uSs, function(uS){
            const indexOfColon = uS.indexOf(":");
            let key = "";
            // console.log(indexOfColon);
            if(indexOfColon === 3){
                key = uS.charAt(indexOfColon - 1);
            }
            else if(indexOfColon === 4){
                key = uS.charAt(indexOfColon - 2) + uS.charAt(indexOfColon - 1);
            }
            let string = uS.substring(indexOfColon + 2);
            
            userStories.push({
                id: key,
                string: string
            });
        });
        resolve(userStories);
    });
};

const formatUserStories = async function(uSs){
    return await new Promise(function(resolve){
        _.each(uSs, function(uS){
            uS.string = uS.string.replace(/:/g, '');
            uS.string = uS.string.replace(/\r\n/g, ' ');
            uS.string = uS.string.replace('  ', ' ');
            uS.string = uS.string.toLowerCase();
            uS.string = uS.string.split(' ');
            uS.string = stopword.removeStopwords(uS.string);
            uS.string = uS.string.filter(function(item, index, array){
                return array.indexOf(item) == index;
            });
        });
        resolve(uSs);
    });
};

const execute = async function(){
    const userStoriesText = await readFile(process.argv[2]);
    const userStoriesSplit = await splitUserStories(userStoriesText);
    const importantUserStories = await selectImportantUserStories(userStoriesSplit, process.argv[3]);
    const keyedUserStories = await keyUserStories(importantUserStories);
    const formattedUserStories = await formatUserStories(keyedUserStories);
};

execute();