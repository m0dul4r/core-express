/**
 * Modulable core module of Express lib 
 * @author Ioan CHIRIAC
 * @license MIT
 * @link https://github.com/m0dul4r/core-express
 */

var express     = require('express');

module.exports = function(imports, modulable) {

  var app;

  // module declaration
  modulable.provides('app')
    /**
     * Initialize the app instance
     */
    .on('init', function() {

      // init instance
      app = express();

      // enables the debug mode
      app.set('showStackError', this.config.showStackError);

      // prettify HTML
      app.locals.pretty = this.config.prettyHTML;

      // should be placed before express.static
      if (this.config.compression) {
        app.use(require('compression')({
          filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
          },
          level: 9
        }));
      }

      // serving static files
      if (this.config.static) {
        for(var path in this.config.static) {
          app.use(
            path,
            express.static(
              modulable.resolvePath(
                this.config.static[path]
              )
            ) 
          );
        }
      }

      // set views path, template engine and default layout
      app.engine('html', swig.renderFile);
      app.set('view engine', 'html');
      app.set('views', app.config.root + '/template/' + app.config.template + '/');

      // enable jsonp
      if (this.config.jsonp) {
        app.enable("jsonp callback");
      }

      // parsers
      app.use(require('cookie-parser')());
      app.use(require('body-parser').json());
      app.use(require('body-parser').urlencoded({ extended: true }));

    })
    .on('start', function() {
      app.listen(
        process.env.PORT || this.config.port
      );
    })
    /**
     * Proxy method for use helper
     */
    .method('use', function() {
      return app.use.apply(app, arguments);
    })
  ;
};