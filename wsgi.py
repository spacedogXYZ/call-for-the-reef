try:
    from gevent import monkey
    monkey.patch_all()
except ImportError:
    import os
    if os.environ.get('PRODUCTION'):
        print "unable to apply gevent monkey patch"

from werkzeug.contrib.fixers import ProxyFix

from app import app
app.wsgi_app = ProxyFix(app.wsgi_app)
