const fs = require('fs');
const _ = require('lodash');
const stopword = require('stopword');

const threshold = 0.4;

if(process.argv.length < 4) {
    console.log('Usage: node index.js *filename* *keyword*');
    process.exit(1);
}

const readFile = async function(fileName) {
    return await new Promise(function(resolve, reject) {
        fs.readFile(fileName, 'utf8', function(err, data) {
            if(err) {
                reject(err);
            }
            resolve(data);
        });
    });
};

const splitUserStories = async function(uS) {
    return await new Promise(function(resolve) {
        if(uS.includes('\n\n\n')) {
            resolve(uS.split('\n\n\n'));
        } else if(uS.includes('\r\n\r\n\r\n')) {
            resolve(uS.split('\r\n\r\n\r\n'));
        } else{
            console.log('String was unable to be separated!');
            process.exit(1);
        }
    });
};

const getKeywords = async function(keyword) {
    return await new Promise(function(resolve) {
        if(keyword === 'metadata') {
            resolve(['metadata', 'rights', 'permissions', 'batch', 'technical', 'track', 'bitstream', 'screen', 'integrity', 'terms', 'EAD']);
        } else if(keyword === 'workgroup') {
            resolve(['workgroup', 'workgroups', 'delete', 'batch', 'organize', 'manage ', 'bitstream', 'integrity', 'deposits', 'submit']);
        }
        resolve([keyword]);
    });
};

const selectImportantUserStories = async function(userStoriesSplit, keywords) {
    return await new Promise(function(resolve) {
        let importantUserStories = [];
        _.each(userStoriesSplit, function(userStory) {
            let isImportant = false;
            _.each(keywords, function(keyword) {
                isImportant = userStory.includes(keyword);
                if(isImportant) {
                    return false;
                }
                return true;
            });
            if(isImportant) {
                importantUserStories.push(userStory);
            }
        });
        resolve(importantUserStories);
    });
};

const keyUserStories = async function(uSs) {
    return await new Promise(function(resolve) {
        let userStories = [];
        _.each(uSs, function(uS) {
            const indexOfColon = uS.indexOf(':');
            let key = '';
            if(indexOfColon === 3) {
                key = uS.charAt(indexOfColon - 1);
            } else if(indexOfColon === 4) {
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

const formatUserStories = async function(uSs) {
    return await new Promise(function(resolve) {
        _.each(uSs, function(uS) {
            uS.string = uS.string.replace(/:/g, '');
            if(uS.string.includes('\n\n')) {
                uS.string = uS.string.replace(/\n/g, ' ');
            } else if(uS.string.includes('\r\n\r\n')) {
                uS.string = uS.string.replace(/\r\n/g, ' ');
            }
            uS.string = uS.string.replace('  ', ' ');
            uS.string = uS.string.toLowerCase();
            uS.string = uS.string.split(' ');
            uS.string = stopword.removeStopwords(uS.string);
            uS.string = uS.string.filter(function(item, index, array) {
                return array.indexOf(item) === index;
            });
        });
        resolve(uSs);
    });
};

const compareUserStories = async function(uSs) {
    let similarUserStories = [];
    _.each(uSs, function(uS1) {
        _.each(uSs, function(uS2) {
            if(uS1.id === uS2.id) {
                return;
            }
            const differenceArray = _.xor(uS1.string, uS2.string);
            const totalLength = uS1.string.length + uS2.string.length;
            const differenceLength = differenceArray.length;
            const overlapLength = totalLength - differenceLength;
            const overlapPercentage = overlapLength / totalLength;
            if(overlapPercentage >= threshold) {
                // console.log(uS1.id + ',' + uS2.id);
                // console.log(uS1.id + ',' + uS2.id + ' (' + overlapPercentage + ')');
                similarUserStories.push({
                    id1: uS1.id,
                    id2: uS2.id
                });
            }
        });
    });
    return similarUserStories;
};

const removeDuplicates = async function(uSs) {
    let userStories = uSs;
    let finalUserStories = [];
    _.each(userStories, function(userStory) {
        if(_.some(userStories, { id1: userStory.id2, id2: userStory.id1})) {
            const index = _.findIndex(finalUserStories, { id1: userStory.id2, id2: userStory.id1});
            if(index === -1) {
                finalUserStories.push(userStory);
            }
        }
    });
    return finalUserStories;
};

const printSimilarUserStories = async function(uSs) {
    _.each(uSs, function(uS) {
        console.log(uS.id1 + ',' + uS.id2);
    });
};

const execute = async function() {
    const userStoriesText = await readFile(process.argv[2]);
    const userStoriesSplit = await splitUserStories(userStoriesText);
    const keywords = await getKeywords(process.argv[3]);
    const importantUserStories = await selectImportantUserStories(userStoriesSplit, keywords);
    const keyedUserStories = await keyUserStories(importantUserStories);
    const formattedUserStories = await formatUserStories(keyedUserStories);
    const similarUserStories = await compareUserStories(formattedUserStories);
    const trimmedUserStories = await removeDuplicates(similarUserStories);
    printSimilarUserStories(trimmedUserStories);
};

execute();
