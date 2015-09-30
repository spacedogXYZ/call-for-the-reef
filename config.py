import os

from flask import Flask
from flask.ext.assets import Environment, Bundle
from flask.ext.compress import Compress
from flask.ext.cache import Cache
from flask.ext.cdn import CDN

from raven.contrib.flask import Sentry


class DefaultConfig(object):
    DEBUG = True
    CACHE_TYPE = 'null'
    AK_AUTH = (os.environ.get('ACTIONKIT_USERNAME'), os.environ.get('ACTIONKIT_PASSWORD'))
    AK_BASE = 'https://act.sumofus.org'
    CDN_DOMAIN = None


class ProductionConfig(DefaultConfig):
    DEBUG = False
    CACHE_TYPE = 'simple'
    CDN_DOMAIN = 'd21j2a4znzg4av.cloudfront.net'
    FLASK_ASSETS_USE_CDN = False
    SENTRY_DSN = os.environ.get('SENTRY_DSN', None)


def create_app(name=None):
    app = Flask(name)

    if os.environ.get('PRODUCTION'):
        app.config.from_object(ProductionConfig)
        print "running with ProductionConfig"
    else:
        app.config.from_object(DefaultConfig)
        print "running with DefaultConfig"

    # sentry
    if app.config.get('SENTRY_DSN'):
        sentry = Sentry()
        sentry.init_app(app)
        app.sentry = sentry

    # assets
    assets = Environment(app)
    assets.url = app.static_url_path
    scss_bundle = Bundle('css/*.scss', 'css/*.css',
        filters=['scss', 'cssmin'], depends='css/*.scss', output='css/all.css')
    assets.register('scss_all', scss_bundle)
    js_bundle = Bundle('js/*.js', filters='rjsmin', output='js/all.js')
    assets.register('js_all', js_bundle)
    Compress(app)

    # cache
    if app.config['DEBUG']:
        cache_type = 'null'
    else:
        cache_type = 'simple'

    cache = Cache(config={'CACHE_TYPE': cache_type})
    cache.init_app(app)
    app.cache = cache

    # CDN
    cdn = CDN()
    cdn.init_app(app)

    # workaround flask-assets / flask-cdn integration
    if app.config.get('CDN_HTTPS'):
        cdn_scheme = 'https'
    else:
        cdn_scheme = 'http'
    if app.config.get('FLASK_ASSETS_USE_CDN') and app.config.get('CDN_DOMAIN'):
        app.jinja_env.globals['FLASK_CDN'] = '%s://%s' % (cdn_scheme, app.config['CDN_DOMAIN'])

    return app
