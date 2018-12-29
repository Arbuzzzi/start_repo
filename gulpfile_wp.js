var gulp 		 = require('gulp'), // Подключаем Gulp
    sass         = require('gulp-sass'), //Подключаем Sass пакет,
    browserSync  = require('browser-sync'), // Подключаем Browser Sync
    concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify       = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
    cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer'),// Подключаем библиотеку для автоматического добавления префиксов
    ftp          = require('gulp-ftp'); // Заливаем файлы по ftp на хостинг
    cleanCSS 	 = require('gulp-clean-css'); // Минимизируем CSS 
    jsmin        = require('gulp-jsmin'); // Минимизируем JS
    gcmq 		 = require('gulp-group-css-media-queries'); // Группируем media-queries
    notify       = require('gulp-notify'); // Обработка ошибок
    tingpng      = require('gulp-tinypng'); // Сжимаем изображения

gulp.task('sass', function(){ // Создаем таск Sass
    return gulp.src('wordpress/wp-content/themes/apptheme/sass/**/*.+(scss|sass)') // Берем источник
        .pipe(sass()
            .on( 'error', notify.onError(
              {
                message: "<%= error.message %>",
                title  : "Sass Error!"
              } ) )) // Преобразуем Sass в CSS посредством gulp-sass
        .pipe(gcmq()) // Группируем медиа
        .pipe(gulp.dest('wordpress/wp-content/themes/apptheme')) // Выгружаем результата в папку app
        .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

//.on('error', function(){console.log('error'); gulp.task('watch')})

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
        proxy: "mystyled.st",


        /*    
        server: { // Определяем параметры сервера
            baseDir: 'wordpress/wp-content/themes/apptheme' // Директория для сервера - app
        },
        */

        notify: false // Отключаем уведомления
    });
});

gulp.task('font', ['sass'], function(){
    return gulp.src([ // Берем все необходимые файлы CSS
        'wordpress/wp-content/themes/apptheme/style.css',
        'wordpress/wp-content/themes/apptheme/font.css'
        ])
        .pipe(concat('style.css')) // Собираем их в кучу в новом файле style.css
        .pipe(gulp.dest('wordpress/wp-content/themes/apptheme')); // Выгружаем в папку app/js
});

gulp.task('watch', ['browser-sync'], function() {
    gulp.watch('wordpress/wp-content/themes/apptheme/sass/**/**/*.+(scss|sass)', ['sass']); // Наблюдение за sass файлами в папке sass
    gulp.watch('wordpress/wp-content/themes/apptheme/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('wordpress/wp-content/themes/apptheme/**/*.php', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('wordpress/wp-content/themes/apptheme/**/*.css', browserSync.reload); // Наблюдение за CSS файлами в корне проекта
    gulp.watch('wordpress/wp-content/themes/apptheme/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

/*
gulp.on('erorr', function(){
    gulp.task('watch');
}); */

gulp.task('optimize', function () {
    gulp.src([ // Берем CSS 
        'wordpress/wp-content/themes/apptheme/*.css',
        'wordpress/wp-content/themes/apptheme/*.min.css',
        '!app/font.css'
        ])
        .pipe(gcmq()) // Группируем медиа
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
        .pipe(cleanCSS({compatibility: 'ie8'})) // Минимизируем CSS
        .pipe(gulp.dest('wordpress/wp-content/themes/apptheme/min'));
    gulp.src(['wordpress/wp-content/themes/apptheme/js/main/*.js']) // Минимизируем JS
        .pipe(jsmin())
        .pipe(gulp.dest('wordpress/wp-content/themes/apptheme/min/js/main'));

});

gulp.task('minjs', function () {
    gulp.src('wordpress/wp-content/themes/apptheme/**/*.js')
        .pipe(jsmin())
        .pipe(gulp.dest('wordpress/wp-content/themes/apptheme/min/js'));
});

gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('tinypng', function () {
    gulp.src([
        'wordpress/wp-content/themes/apptheme/img/**/*',
        '!app/img/**/*.svg'])
        .pipe(tingpng('CUGSOlLz2kMP92hbJnXAM8gVHI461wLZ'))
        .pipe(gulp.dest('wordpress/wp-content/themes/apptheme/min/img'));
    gulp.src('wordpress/wp-content/themes/apptheme/img/**/*.svg')
        .pipe(gulp.dest('wordpress/wp-content/themes/apptheme/min/img'));
});

gulp.task('build', ['clean', 'font', 'optimize'], function() {
    var buildCss = gulp.src([ // Переносим библиотеки в продакшен
        'wordpress/wp-content/themes/apptheme/min/*.css',
        'wordpress/wp-content/themes/apptheme/min/*.min.css',
        '!app//min/font.css'
        ])
    .pipe(gulp.dest('dist'));

    var buildFonts = gulp.src('wordpress/wp-content/themes/apptheme/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('dist/fonts'));

    var buildHtml = gulp.src('wordpress/wp-content/themes/apptheme/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('dist'));

    var buildJs = gulp.src('wordpress/wp-content/themes/apptheme/js/**/*') // Переносим js в продакшен
    .pipe(gulp.dest('dist/js'));    

    var buildSlick = gulp.src('wordpress/wp-content/themes/apptheme/slick/**/*') // Переносим slick в продакшен
    .pipe(gulp.dest('dist/slick'));

    var buildJs = gulp.src('wordpress/wp-content/themes/apptheme/min/js/main/**/*') // Переносим js в продакшен
    .pipe(gulp.dest('dist/js/main'));

    var buildImg = gulp.src('wordpress/wp-content/themes/apptheme/min/img/**/*') // Переносим IMG в продакшен
    .pipe(gulp.dest('dist/img'));

});

gulp.task('ftp', function () {
    return gulp.src('dist/**/*')
        .pipe(ftp({
            host: '88.99.148.81',
            user: 'safon116',
            pass: 'mRhJ064zwv',
            remotePath: '/www/safonov-vladimir.ru/les_16'
        }))
});

gulp.task('clear', function () {
    return cache.clearAll();
})

gulp.task('default', ['watch']);

//  Команды в окне команд:
//  "gulp" - запускаем watch
//  "gulp build" - выгружаем готовый проект в папку dist
//  "gulp ftp" - заливаем папку dist по ftp на хостинг