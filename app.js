/**
 * Modulable core module of Express lib 
 * @author Ioan CHIRIAC
 * @license MIT
 * @link https://github.com/m0dul4r/core-express
 */

var express     = require('express');

module.exports = function(imports) {

  var app;

  return {
    core: {
      // app service declaration
      app: {
        // event :
        on: {
          /**
           * Initialize the app instance
           */
          ready: function() {
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
                  return (/json|text|javascript|css/).test(
                    res.getHeader('Content-Type')
                  );
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
          }
          
          ,start: function() {
            app.listen(
              process.env.PORT || this.config.port
            );
          }
        }

        /**
         * Proxy method for use helper
         */
        ,use: function() {
          return app.use.apply(app, arguments);
        }

        /**
         * Attaching a rendering engine
         */
        ,renderer: function(cb) {
          app.engine('html', cb);
          app.set('view engine', 'html');
          app.set('views', app.config.root + '/template/' + app.config.template + '/');
        }
      }
      // router service declaration
      ,router: {
        // events
        on: {
          /**
           * Initialize the router instance
           */
          ready: function() {
            var self = this;
            this.router = express.Router();
            app.use(router);

            // Assume "not found" in the error msgs is a 404
            app.use(function(err, req, res, next) {
                if (~err.message.indexOf('not found')) return next();
                self.trigger('500', {
                  err: err, req: req, res: res, next: next
                });
            });

            // Assume 404 since no middleware responded
            app.use(function(req, res, next) {
                self.trigger('404', {
                  req: req, res: res, next: next
                });
            });
          }
        }
        ,app: function(pattern, cb) { }
        ,get: function(pattern, cb) { }
        ,post: function(pattern, cb) { }
        ,put: function(pattern, cb) { }
        ,delete: function(pattern, cb) { }
      }
    }
  };
  
};