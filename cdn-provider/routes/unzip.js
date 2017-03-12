
var fs = require('fs');
var jszip = require('jszip');
var path = require('path');
var Q = require('q');
var mkdirp = require('mkdirp');
var unzip = require('unzip');

/**
 * Unzip zip files and store into directory.
 * @Parms
 *      filePath : directory to store into
 *      zipFilePath : file to unzip
 */
module.exports = function (filePath, zipFilePath) {
    return Q.Promise(function(resolve, reject) {
            fs.createReadStream(zipFilePath).pipe(unzip.Extract({ path: filePath }))
            .on('finish', function() {
                resolve();
            }).on('error', function(err) {
                reject(err);
            });
    });
}
