/**
 * Module dependencies.
 */
var util = require('util'),
    OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
    InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://beam.pro/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://beam.pro/api/v1/oauth/token';
  OAuth2Strategy.call(this, options, verify);

  this.name = 'beam';
  this._oauth2.setAuthMethod('OAuth');
  this._oauth2.useAuthorizationHeaderforGET(true);
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Beam.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `beam`
 *   - `id`
 *   - `username`
 *   - `email`
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
  this._oauth2.get('https://beam.pro/api/v1/users/current', accessToken, function (err, body, res) {
    if (err) {
      return done(new InternalOAuthError('failed to fetch user profile', err));
    }
    try {

      var json = JSON.parse(body);

      var profile = { provider: 'beam' };
      profile.id = json.id;
      profile.username = json.username;
      profile.email = json.email;
      profile._raw = body;
      profile._json = json;
      done(null, profile);
    } catch (e) {
      done(e);
    }
  });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
