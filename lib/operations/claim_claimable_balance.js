'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.claimClaimableBalance = claimClaimableBalance;

var _stellarXdr_generated = require('../generated/stellar-xdr_generated');

var _stellarXdr_generated2 = _interopRequireDefault(_stellarXdr_generated);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a new claim claimable balance operation.
 * @function
 * @alias Operation.claimClaimableBalance
 * @param {object} opts Options object
 * @param {string} opts.balanceId - The claimable balance id to be claimed.
 * @param {string} [opts.source] - The source account for the operation. Defaults to the transaction's source account.
 * @returns {xdr.Operation} Claim claimable balance operation
 *
 * @example
 * const op = Operation.claimClaimableBalance({
 *   balanceId: '00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be',
 * });
 *
 */
function claimClaimableBalance() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (typeof opts.balanceId !== 'string') {
    throw new Error('must provide a valid claimable balance Id');
  }
  var attributes = {};
  attributes.balanceId = _stellarXdr_generated2.default.ClaimableBalanceId.fromXDR(opts.balanceId, 'hex');
  var claimClaimableBalanceOp = new _stellarXdr_generated2.default.ClaimClaimableBalanceOp(attributes);

  var opAttributes = {};
  opAttributes.body = _stellarXdr_generated2.default.OperationBody.claimClaimableBalance(claimClaimableBalanceOp);
  this.setSourceAccount(opAttributes, opts);

  return new _stellarXdr_generated2.default.Operation(opAttributes);
}