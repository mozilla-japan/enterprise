"use strict";

var gulp = require("gulp");
var $ = require("gulp-load-plugins")();
$.nunjucksRender.nunjucks.configure({watch: false});

var configFile = "etc/settings.json";
var config = require("./lib/config").create(configFile);

(function(){
  var del = require("del");
  gulp.task("clean", () => {
    return del([config.allFilesInDest]);
  });
})();

(function(){
  var browserSync = require("browser-sync");
  gulp.task("serve", () => {
    browserSync({
      proxy: "local.mozilla.jp",
      open: false
    });
  });
})();

gulp.task("lint", function() {
  return gulp.src(configFile)
    .pipe($.jsonlint())
    .pipe($.jsonlint.reporter());
});

(function(){
  var transform = require("./lib/transformer").transform;
  var eachAsync = require("each-async");
  var path = require("path");

  gulp.task("transform", callback => {
    var markdown = config.markdown;
    var data = transform(markdown, config.title, config.ids);

    gulp.src("templates/index.html")
      .pipe($.nunjucksRender({
        title: data.title,
        categories: data.categories
      }))
      .pipe($.size({showFiles: true}))
      .pipe(gulp.dest(config.dest));

    eachAsync(data.categories, function(item, index, next) {
      gulp.src("templates/category.html")
        .pipe($.nunjucksRender({
          title: data.title,
          categories: data.categories,
          currentIndex: index,
          currentCategory: item
        }))
        .pipe($.rename({
          dirname: item.id,
          basename: "index"
        }))
        .pipe($.size({showFiles: true}))
        .pipe(gulp.dest(config.dest))
        .on("end", next);
    }, callback);
  });

})();

(function(){
  var runner = require("run-sequence");
  gulp.task("build", () => {
    runner("clean", "transform");
  });
})();

gulp.task("default", ["build"]);
