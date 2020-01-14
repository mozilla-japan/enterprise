"use strict";

var Config = (function(Config){
  var fs = require("graceful-fs");
  var path = require("path");

  Config = function(){
    this.initialize.apply(this, arguments);
  };

  Config.prototype = {
    initialize: function(config){
      this.title = config.title || "FAQ";
      this.source = config.source ||
        "https://github.com/mozilla-japan/enterprise/blob/master/FAQ.md";
      this.src = config.src || "./src";
      this.dest = config.dest || "./dist";
      this.ids = config.ids || [];
      this.documentRoot = config.documentRoot || "./doc";
    },
    get markdownFile(){
      var dir = this.src;
      if(!dir.match(/\/$/)){
        dir = dir + "/";
      }
      return dir + this.source.split(/\//).pop();
    },
    get markdown(){
      return fs.readFileSync(this.markdownFile).toString("utf-8");
    },
    get allFilesInDest(){
      return this.dest + "/*";
    }
  };

  Config.create = function(filename){
    var json = fs.readFileSync(filename, "utf-8");
    var parsed = JSON.parse(json);
    return new Config(parsed);
  };

  return Config;
})(Config || {});

module.exports = Config;
