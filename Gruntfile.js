module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    mkdir: {
      options: {
        create: ['public/dist']
      }
    },

    clean: ['public/dist'],

    concat: {
      options: {
        separator: '\n'
      },
      lib: {
        src: ['public/lib/jquery.js', 'public/lib/underscore.js', 'public/lib/backbone.js', 'public/lib/handlebars.js'],
        dest: 'public/dist/<%= pkg.name %>-lib.js'
      },
      client: {
        src: ['public/client/app.js', 'public/client/link.js', 'public/client/links.js', 'public/client/linkView.js',
        'public/client/linksView.js', 'public/client/createLinkView.js', 'public/client/router.js'],
        dest: 'public/dist/<%= pkg.name %>-client.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      options: {
        // add a comment with the date the file  was minified
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'public/dist/lib.min.js': ['<%= concat.lib.dest %>'],
          'public/dist/client.min.js': ['<%= concat.client.dest %>']
        }
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'public/**/*.js', 'server-config.js', 'server.js'],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js'
        ]
      }
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'public',
          src: ['*.css', '!*.min.css'],
          dest: 'public/dist',
          ext: '.min.css'
        }]
      }
    },

    watch: {
      scripts: {
        files: ['<%= concat.lib.src %>', '<%= concat.client.src %>'],
        tasks: [
          'jshint',
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
      }
    },
  });
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', ['jshint', 'mochaTest']);

  grunt.registerTask('build', ['jshint', 'mochaTest', 'clean', 'mkdir', 'concat', 'uglify', 'cssmin']);

  grunt.registerTask('deploy', ['clean', 'mkdir', 'concat', 'uglify', 'cssmin']);
      // add your production server task here

  grunt.registerTask('default', ['jshint']);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      grunt.task.run(['deploy']);
      // add your production server task here
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });
};
