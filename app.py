from flask import request, abort, jsonify, render_template
import requests

from config import create_app
app = create_app(__name__)


@app.cache.cached(timeout=60)
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

    user_url = '%s/rest/v1/user/%s' % (app.config['AK_BASE'], user_id)
    r = requests.get(user_url, auth=app.config['AK_AUTH'])
    data = r.json()
    if r.status_code == 200:
        # double check for valid token
        if not '.%s.%s' % (user_id, token_hash) == r.json()['token']:
            abort(403, "invalid akid")

        phones = data.get('phones', [])
        if phones[0]:
            phone_url = '%s%s' % (app.config['AK_BASE'], str(phones[0]))  # earlier response is root-relative
            p = requests.get(phone_url, auth=app.config['AK_AUTH'])
            if p.status_code == 200:
                data['phone'] = p.json()['normalized_phone']
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
    for f in ['page', 'source', 'name', 'email', 'phone', 'phone_type']:
        akData[f] = request.values.get(f)
    action_url = '%s/rest/v1/action' % app.config['AK_BASE']
    r = requests.post(action_url, akData, auth=app.config['AK_AUTH'])
    if not str(r.status_code).startswith('2'):
        abort(r.status_code, r.text)

    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'], use_reloader=app.config['DEBUG'])
