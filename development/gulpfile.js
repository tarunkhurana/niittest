var gulp        = require('gulp'),
    gulpconcat  = require('gulp-concat'),
    gulpuglify  = require('gulp-uglify'),
    gulpminify  = require('gulp-minify-css'),
    gulphtmlbuild= require('gulp-htmlbuild'),
    connect=require('gulp-connect');



gulp.task('minifyjs',function(){
   return gulp.src(['lib/videojs/video.js','lib/videojs/Youtube.js','js/main.js'])
         .pipe(gulpconcat('main.js'))
         .pipe(gulp.dest('../production/js')) 
         .pipe(gulpuglify())
         .pipe(gulpconcat('main.min.js'))
         .pipe(gulp.dest('../production/js')); 
});
gulp.task('minifycss',function(){
   return gulp.src(['lib/videojs/video-js.css','css/style.css'])
         .pipe(gulpconcat('main.css'))
         .pipe(gulp.dest('../production/css')) 
         .pipe(gulpminify())
         .pipe(gulpconcat('main.min.css'))
         .pipe(gulp.dest('../production/css')); 
});

gulp.task('copydata',function(){
   return gulp.src(['data/**/*','videos/**/*'], {
            base: './'
        }).pipe(gulp.dest('../production'));
});

gulp.task('copyswf',function(){
   return gulp.src(['lib/videojs/*.swf'], {
            base: ''
        }).pipe(gulp.dest('../production/swf'));
});

gulp.task('copyfonts',function(){
   return gulp.src(['lib/videojs/font/**/*'], {
            base: './lib/videojs'
        }).pipe(gulp.dest('../production/css'));
});

gulp.task('htmlbuild',function(){
  return gulp.src('index.html')
         .pipe(gulphtmlbuild({

          js:gulphtmlbuild.preprocess.js(function(block){
            block.write('js/main.min.js');
            block.end();
          }),
          css: gulphtmlbuild.preprocess.css(function (block) {
        
            block.write('css/main.min.css');
            block.end();
        
         })

         }))
         .pipe(gulp.dest('../production'));
});

gulp.task('copy',['copyfonts','copyswf','copydata']);
gulp.task('minify',['minifyjs','minifycss']);

gulp.task('reload',function(){

  gulp.src('../production/**/*.*')
  .pipe(connect.reload());

});

gulp.task('watch',function(){

  gulp.watch(['./css/*.css','./lib/videojs/*.css'], ['minifycss']);
  gulp.watch(['./lib/videojs/video.js','./lib/videojs/Youtube.js','./js/main.js'], ['minifyjs']);
  gulp.watch(['./data/**/*','./lib/videojs/*.swf','./lib/videojs/font/**/*'], ['copy']);
  gulp.watch(['./index.html'], ['htmlbuild']);
  gulp.watch(['../production/**/*.*'], ['reload']);
});




gulp.task('connect',function(){
   connect.server({
     port:8001,
     root:'../production',
     livereload:true
   });
});

gulp.task('default', ['connect', 'watch']);