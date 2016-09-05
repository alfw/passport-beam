/**
 * Module dependencies.
 */
var util = require('util'),
    OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
    InternalOAuthError = require('passport-oauth').InternalOAuthError;

/**
 * Setting the beam url.
 */
var BEAM_LINK = 'https://beam.pro/';


/**
 * `Strategy` constructor.
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || BEAM_LINK + 'oauth/authorize';
  options.tokenURL = options.tokenURL || BEAM_LINK + 'api/v1/oauth/token';
  options.approval_prompt = true;
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
 *   - `_raw`
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
  this._oauth2.get(BEAM_LINK + 'api/v1/users/current', accessToken, function (err, body) {
    if (err) {
      return done(new InternalOAuthError('Failed to fetch user profile.', err));
    }
    try {
      var data = JSON.parse(body);
      var profile = {
        provider: 'beam',
        id: data.id,
        username: data.username,
        email: data.email,
        _raw: data
      };
      done(null, profile);
    } catch (e) {
      done(e);
    }
  });
};

/**
 * Return extra parameters to be included in the authorization request.
 *
 * Some OAuth 2.0 providers allow additional, non-standard parameters to be
 * included when requesting authorization.  Since these parameters are not
 * standardized by the OAuth 2.0 specification, OAuth 2.0-based authentication
 * strategies can overrride this function in order to populate these parameters
 * as required by the provider.
 *
 * @param {Object} options
 * @return {Object}
 */

Strategy.prototype.authorizationParams = function(options) {
  return {approval_prompt: "force"};
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
