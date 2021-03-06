'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.manageBuyOffer = manageBuyOffer;

var _isUndefined = require('lodash/isUndefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _jsXdr = require('js-xdr');

var _stellarXdr_generated = require('../generated/stellar-xdr_generated');

var _stellarXdr_generated2 = _interopRequireDefault(_stellarXdr_generated);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns a XDR ManageBuyOfferOp. A "manage buy offer" operation creates, updates, or
 * deletes a buy offer.
 * @function
 * @alias Operation.manageBuyOffer
 * @param {object} opts Options object
 * @param {Asset} opts.selling - What you're selling.
 * @param {Asset} opts.buying - What you're buying.
 * @param {string} opts.buyAmount - The total amount you're buying. If 0, deletes the offer.
 * @param {number|string|BigNumber|Object} opts.price - Price of 1 unit of `buying` in terms of `selling`.
 * @param {number} opts.price.n - If `opts.price` is an object: the price numerator
 * @param {number} opts.price.d - If `opts.price` is an object: the price denominator
 * @param {number|string} [opts.offerId ] - If `0`, will create a new offer (default). Otherwise, edits an exisiting offer.
 * @param {string} [opts.source] - The source account (defaults to transaction source).
 * @throws {Error} Throws `Error` when the best rational approximation of `price` cannot be found.
 * @returns {xdr.ManageBuyOfferOp} Manage Buy Offer operation
 */
function manageBuyOffer(opts) {
  var attributes = {};
  attributes.selling = opts.selling.toXDRObject();
  attributes.buying = opts.buying.toXDRObject();
  if (!this.isValidAmount(opts.buyAmount, true)) {
    throw new TypeError(this.constructAmountRequirementsError('buyAmount'));
  }
  attributes.buyAmount = this._toXDRAmount(opts.buyAmount);
  if ((0, _isUndefined2.default)(opts.price)) {
    throw new TypeError('price argument is required');
  }
  attributes.price = this._toXDRPrice(opts.price);

  if (!(0, _isUndefined2.default)(opts.offerId)) {
    opts.offerId = opts.offerId.toString();
  } else {
    opts.offerId = '0';
  }

  attributes.offerId = _jsXdr.Hyper.fromString(opts.offerId);
  var manageBuyOfferOp = new _stellarXdr_generated2.default.ManageBuyOfferOp(attributes);

  var opAttributes = {};
  opAttributes.body = _stellarXdr_generated2.default.OperationBody.manageBuyOffer(manageBuyOfferOp);
  this.setSourceAccount(opAttributes, opts);

  return new _stellarXdr_generated2.default.Operation(opAttributes);
}