import os
import requests

from flask import Flask, request, abort, jsonify, render_template
from flask.ext.assets import Environment, Bundle

app = Flask(__name__)
app.ak_auth = (os.environ.get('ACTIONKIT_USERNAME'), os.environ.get('ACTIONKIT_PASSWORD'))

# assets
assets = Environment(app)
assets.url = app.static_url_path
scss_bundle = Bundle('css/styles.scss', 'css/fontello.css', filters=['scss', 'cssmin'], depends='css/*.scss', output='css/all.css')
assets.register('scss_all', scss_bundle)
js_bundle = Bundle('js/*.js', filters='rjsmin', output='js/all.js')
assets.register('js_all', js_bundle)

@app.route('/')
def index():
    # main page
    return render_template('index.html')


@app.route('/prefill', methods=['GET'])
def prefill():
    # prefill user info from akid
    akid = request.values.get('akid')
    if not akid:
        return abort(400, "akid param required")

    try:
        (mailing_id, user_id, token_hash) = akid.split('.')
    except ValueError:
        return abort(400, "malformed akid")

    r = requests.get('https://act.sumofus.org/rest/v1/user/%s/' % user_id, auth=app.ak_auth)
    data = r.json()
    if r.status_code == 200:
        # double check for valid token
        if not '.%s.%s' % (user_id, token_hash) == r.json()['token']:
            abort(403, "invalid akid")

        desired_fields = ['first_name', 'last_name', 'email', 'phone']
        output = {}
        for f in desired_fields:
            output[f] = data.get(f)
        if output.get('first_name') and output.get('last_name'):
            output['name'] = '{first_name} {last_name}'.format(**output)
        return jsonify(output)
    else:
        return abort(r.status_code, r.text)


@app.route('/submit', methods=['POST'])
def submit():
    # save data back to ak
    akData = {}
    for f in ['page', 'source', 'name', 'email', 'phone']:
        akData[f] = request.values.get(f)
    print "submitting", akData
    r = requests.post('https://act.sumofus.org/rest/v1/action/', akData, auth=app.ak_auth)
    if not r.status_code == 200:
        abort(r.status_code, r.text)

    return jsonify({'success': True})

if __name__ == '__main__':
    if os.environ.get('FLASK_DEBUG'):
        app.run(debug=True, use_reloader=True)
    else:
        app.run()
