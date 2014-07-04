/**
 * Modulable core module of Express lib 
 * @author Ioan CHIRIAC
 * @license MIT
 * @link https://github.com/m0dul4r/core-express
 */

var express     = require('express');

module.exports = function(imports) {

  var app;
  var router;

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
            if (process.env.PORT) {
              this.config.port = process.env.PORT;
            }
            app.listen(this.config.port);
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
        ,renderer: function(cb, path, locate) {
          app.engine('html', cb);
          app.set('view engine', 'html');
          app.set('views', path);
          // manage multiple views levels (template & system defaults)
          var expressLookup = app.get('view').prototype.lookup;
          var customLookup = function(viewName) {
            var match = locate.apply(this, [viewName]);
            if (!match) {
              this.root = path;
              match = expressLookup.apply(this, [viewName]);
            }
            return match;
          };
          app.get('view').prototype.lookup = customLookup;
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
            router = express.Router();
            app.use(router);
            // Assume "not found" in the error msgs is a 404
            app.use(function(err, req, res, next) {
              if (~err.message.indexOf('not found')) return next();
              self.trigger('500', {
                err: err, req: req, res: res, next: next
              });
              res.end();
            });

            // Assume 404 since no middleware responded
            app.use(function(req, res, next) {
              self.trigger('404', {
                req: req, res: res, next: next
              });
              res.end();
            });
          }
        }
        // routing methods :
        ,all: function(pattern, cb) {
          router.route(pattern).all(cb);
          return this;
        }
        ,get: function(pattern, cb) { 
          router.route(pattern).get(cb);
          return this;
        }
        ,post: function(pattern, cb) {
          router.route(pattern).post(cb);
          return this;
        }
        ,put: function(pattern, cb) {
          router.route(pattern).put(cb);
          return this;
        }
        ,delete: function(pattern, cb) {
          router.route(pattern).delete(cb);
          return this;
        }
      }
    }
  };
  
};