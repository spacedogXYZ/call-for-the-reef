import os

from flask import Flask
from flask.ext.assets import Environment, Bundle
from flask.ext.compress import Compress
from flask.ext.cache import Cache
from flask.ext.cdn import CDN


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
    FLASK_ASSETS_USE_CDN = True


def create_app(name=None):
    app = Flask(name)

    if os.environ.get('PRODUCTION'):
        app.config.from_object(ProductionConfig)
        print "running with ProductionConfig"
    else:
        app.config.from_object(DefaultConfig)
        print "running with DefaultConfig"

    # assets
    assets = Environment(app)
    assets.url = app.static_url_path
    scss_bundle = Bundle('css/styles.scss', 'css/fontello.css', 'css/animation.css',
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

    return app
