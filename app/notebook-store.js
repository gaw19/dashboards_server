/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
var appendExt = require('./append-ext');
var config = require('./config');
var debug = require('debug')('dashboard-proxy:notebook-store');
var fs = require('fs-extra');
var nbfs = require('./notebook-fs');
var path = require('path');
var Promise = require('es6-promise').Promise;

var DATA_DIR = config.get('NOTEBOOKS_DIR');
var ENCODING = 'utf8';
var INDEX_NB_NAME = config.get('DB_INDEX');

debug('store dir: ' + DATA_DIR);

// cached notebook objects
var _cache = {};

//////////////////
// READ OPERATIONS
//////////////////

// Read notebook from cache or from file
function _loadNb(nbpath, stats) {
    if (!stats) {
        stats = nbfs.stat(nbpath);
    }
    return Promise.resolve(stats)
        .then(function(stats) {
            var nbfile = stats.fullpath ||
                path.join(DATA_DIR, appendExt(nbpath, DB_EXT));
            return new Promise(function(resolve, reject) {
                fs.readFile(nbfile, ENCODING, function(err, rawData) {
                    if (err) {
                        reject(new Error('Error loading notebook: ' + err.message));
                    } else {
                        var nb = JSON.parse(rawData);
                        // cache notebook for future reads -- use given `nbpath` since that
                        // is path from request. later calls will look up using request path.
                        _cache[nbpath] = nb;
                        resolve(nb);
                    }
                });
            });
        });
}

// by xsj
function _list(dir, user) {
    // list all (not hidden) children of the specified directory
    // (within the data directory)
    var dbpath = path.join(DATA_DIR, dir || '');
    return new Promise(function(resolve, reject) {
        fs.readdir(dbpath, function(err, files) {
            if (err) {
                reject(new Error('Error reading path: ' + dbpath));
            } else {
                files = files.filter(function(f) {
                    // by xsj
                    if(user && 'group' in user)
                        return user.filterFile( f);
                    return /^[^.]/.test(f); // not hidden
                });
                resolve(files);
            }
        });
    });
}

// by xsj
function _get(nbpath, stats, user) {
    // by xsj
    if(user && 'group' in user){
        if(!user.filterFile(nbpath.split('/').pop())){
            console.log('reject');
            return Promise.reject('Error getting notebook info: ' + nbpath);
        }
    }
    if (_cache.hasOwnProperty(nbpath)) {
        return Promise.resolve(_cache[nbpath]);
    } else {
        return _loadNb(nbpath, stats);
    }
}

////////////////////
// DELETE OPERATIONS
////////////////////

function _uncache(nbpath) {
    delete _cache[nbpath];
}

function _resetCache() {
    _cache = {};
}

module.exports = {
    /**
     * Loads, parses, and returns cells (minus code) of the notebook specified by nbpath
     * @param  {String} nbpath - path of the notebook to load
     * @return {Promise.<Object>} notebook data
     */
    get: _get,
    /**
     * Lists contents of the specified directory
     * @param {String} dir - optional sub-directory to Lists
     * @return {Promise.<string[]>} list of contents
     */
    list: _list,
    /**
     * Removes the specified notebook from the cache
     * @param {String} nbpath - path of notebook to remove from cache
     */
    uncache: _uncache,
    /**
     * Removes all entries from the cache
     */
    resetCache: _resetCache
};
