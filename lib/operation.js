'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Operation = exports.AuthImmutableFlag = exports.AuthRevocableFlag = exports.AuthRequiredFlag = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-disable no-bitwise */

var _jsXdr = require('js-xdr');

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

var _trimEnd = require('lodash/trimEnd');

var _trimEnd2 = _interopRequireDefault(_trimEnd);

var _isUndefined = require('lodash/isUndefined');

var _isUndefined2 = _interopRequireDefault(_isUndefined);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _isNumber = require('lodash/isNumber');

var _isNumber2 = _interopRequireDefault(_isNumber);

var _isFinite = require('lodash/isFinite');

var _isFinite2 = _interopRequireDefault(_isFinite);

var _continued_fraction = require('./util/continued_fraction');

var _asset = require('./asset');

var _claimant = require('./claimant');

var _strkey = require('./strkey');

var _stellarXdr_generated = require('./generated/stellar-xdr_generated');

var _stellarXdr_generated2 = _interopRequireDefault(_stellarXdr_generated);

var _index = require('./operations/index');

var ops = _interopRequireWildcard(_index);

var _decode_encode_muxed_account = require('./util/decode_encode_muxed_account');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ONE = 10000000;
var MAX_INT64 = '9223372036854775807';

/**
 * When set using `{@link Operation.setOptions}` option, requires the issuing account to
 * give other accounts permission before they can hold the issuing account’s credit.
 * @constant
 * @see [Account flags](https://www.stellar.org/developers/guides/concepts/accounts.html#flags)
 */
var AuthRequiredFlag = exports.AuthRequiredFlag = 1 << 0;
/**
 * When set using `{@link Operation.setOptions}` option, allows the issuing account to
 * revoke its credit held by other accounts.
 * @constant
 * @see [Account flags](https://www.stellar.org/developers/guides/concepts/accounts.html#flags)
 */
var AuthRevocableFlag = exports.AuthRevocableFlag = 1 << 1;
/**
 * When set using `{@link Operation.setOptions}` option, then none of the authorization flags
 * can be set and the account can never be deleted.
 * @constant
 * @see [Account flags](https://www.stellar.org/developers/guides/concepts/accounts.html#flags)
 */
var AuthImmutableFlag = exports.AuthImmutableFlag = 1 << 2;

/**
 * `Operation` class represents [operations](https://www.stellar.org/developers/guides/concepts/operations.html) in Stellar network.
 * Use one of static methods to create operations:
 * * `{@link Operation.createAccount}`
 * * `{@link Operation.payment}`
 * * `{@link Operation.pathPaymentStrictReceive}`
 * * `{@link Operation.pathPaymentStrictSend}`
 * * `{@link Operation.manageSellOffer}`
 * * `{@link Operation.manageBuyOffer}`
 * * `{@link Operation.createPassiveSellOffer}`
 * * `{@link Operation.setOptions}`
 * * `{@link Operation.changeTrust}`
 * * `{@link Operation.allowTrust}`
 * * `{@link Operation.accountMerge}`
 * * `{@link Operation.inflation}`
 * * `{@link Operation.manageData}`
 * * `{@link Operation.bumpSequence}`
 * * `{@link Operation.createClaimableBalance}`
 * * `{@link Operation.claimClaimableBalance}`
 * * `{@link Operation.beginSponsoringFutureReserves}`
 * * `{@link Operation.endSponsoringFutureReserves}`
 * * `{@link Operation.revokeAccountSponsorship}`
 * * `{@link Operation.revokeTrustlineSponsorship}`
 * * `{@link Operation.revokeOfferSponsorship}`
 * * `{@link Operation.revokeDataSponsorship}`
 * * `{@link Operation.revokeClaimableBalanceSponsorship}`
 * * `{@link Operation.revokeSignerSponsorship}`
 *
 * @class Operation
 */

var Operation = exports.Operation = function () {
  function Operation() {
    _classCallCheck(this, Operation);
  }

  _createClass(Operation, null, [{
    key: 'setSourceAccount',
    value: function setSourceAccount(opAttributes, opts) {
      if (opts.source) {
        try {
          opAttributes.sourceAccount = (0, _decode_encode_muxed_account.decodeAddressToMuxedAccount)(opts.source);
        } catch (e) {
          throw new Error('Source address is invalid');
        }
      }
    }

    /**
     * Converts the XDR Operation object to the opts object used to create the XDR
     * operation.
     * @param {xdr.Operation} operation - An XDR Operation.
     * @return {Operation}
     */

  }, {
    key: 'fromXDRObject',
    value: function fromXDRObject(operation) {
      var result = {};
      if (operation.sourceAccount()) {
        result.source = (0, _decode_encode_muxed_account.encodeMuxedAccountToAddress)(operation.sourceAccount());
      }

      var attrs = operation.body().value();
      var operationName = operation.body().switch().name;

      switch (operationName) {
        case 'createAccount':
          {
            result.type = 'createAccount';
            result.destination = accountIdtoAddress(attrs.destination());
            result.startingBalance = this._fromXDRAmount(attrs.startingBalance());
            break;
          }
        case 'payment':
          {
            result.type = 'payment';
            result.destination = (0, _decode_encode_muxed_account.encodeMuxedAccountToAddress)(attrs.destination());
            result.asset = _asset.Asset.fromOperation(attrs.asset());
            result.amount = this._fromXDRAmount(attrs.amount());
            break;
          }
        case 'pathPaymentStrictReceive':
          {
            result.type = 'pathPaymentStrictReceive';
            result.sendAsset = _asset.Asset.fromOperation(attrs.sendAsset());
            result.sendMax = this._fromXDRAmount(attrs.sendMax());
            result.destination = (0, _decode_encode_muxed_account.encodeMuxedAccountToAddress)(attrs.destination());
            result.destAsset = _asset.Asset.fromOperation(attrs.destAsset());
            result.destAmount = this._fromXDRAmount(attrs.destAmount());
            result.path = [];

            var path = attrs.path();

            // note that Object.values isn't supported by node 6!
            Object.keys(path).forEach(function (pathKey) {
              result.path.push(_asset.Asset.fromOperation(path[pathKey]));
            });
            break;
          }
        case 'pathPaymentStrictSend':
          {
            result.type = 'pathPaymentStrictSend';
            result.sendAsset = _asset.Asset.fromOperation(attrs.sendAsset());
            result.sendAmount = this._fromXDRAmount(attrs.sendAmount());
            result.destination = (0, _decode_encode_muxed_account.encodeMuxedAccountToAddress)(attrs.destination());
            result.destAsset = _asset.Asset.fromOperation(attrs.destAsset());
            result.destMin = this._fromXDRAmount(attrs.destMin());
            result.path = [];

            var _path = attrs.path();

            // note that Object.values isn't supported by node 6!
            Object.keys(_path).forEach(function (pathKey) {
              result.path.push(_asset.Asset.fromOperation(_path[pathKey]));
            });
            break;
          }
        case 'changeTrust':
          {
            result.type = 'changeTrust';
            result.line = _asset.Asset.fromOperation(attrs.line());
            result.limit = this._fromXDRAmount(attrs.limit());
            break;
          }
        case 'allowTrust':
          {
            result.type = 'allowTrust';
            result.trustor = accountIdtoAddress(attrs.trustor());
            result.assetCode = attrs.asset().value().toString();
            result.assetCode = (0, _trimEnd2.default)(result.assetCode, '\0');
            result.authorize = attrs.authorize();
            break;
          }
        case 'setOptions':
          {
            result.type = 'setOptions';
            if (attrs.inflationDest()) {
              result.inflationDest = accountIdtoAddress(attrs.inflationDest());
            }

            result.clearFlags = attrs.clearFlags();
            result.setFlags = attrs.setFlags();
            result.masterWeight = attrs.masterWeight();
            result.lowThreshold = attrs.lowThreshold();
            result.medThreshold = attrs.medThreshold();
            result.highThreshold = attrs.highThreshold();
            // home_domain is checked by iscntrl in stellar-core
            result.homeDomain = attrs.homeDomain() !== undefined ? attrs.homeDomain().toString('ascii') : undefined;

            if (attrs.signer()) {
              var signer = {};
              var arm = attrs.signer().key().arm();
              if (arm === 'ed25519') {
                signer.ed25519PublicKey = accountIdtoAddress(attrs.signer().key());
              } else if (arm === 'preAuthTx') {
                signer.preAuthTx = attrs.signer().key().preAuthTx();
              } else if (arm === 'hashX') {
                signer.sha256Hash = attrs.signer().key().hashX();
              }

              signer.weight = attrs.signer().weight();
              result.signer = signer;
            }
            break;
          }
        // the next case intentionally falls through!
        case 'manageOffer':
        case 'manageSellOffer':
          {
            result.type = 'manageSellOffer';
            result.selling = _asset.Asset.fromOperation(attrs.selling());
            result.buying = _asset.Asset.fromOperation(attrs.buying());
            result.amount = this._fromXDRAmount(attrs.amount());
            result.price = this._fromXDRPrice(attrs.price());
            result.offerId = attrs.offerId().toString();
            break;
          }
        case 'manageBuyOffer':
          {
            result.type = 'manageBuyOffer';
            result.selling = _asset.Asset.fromOperation(attrs.selling());
            result.buying = _asset.Asset.fromOperation(attrs.buying());
            result.buyAmount = this._fromXDRAmount(attrs.buyAmount());
            result.price = this._fromXDRPrice(attrs.price());
            result.offerId = attrs.offerId().toString();
            break;
          }
        // the next case intentionally falls through!
        case 'createPassiveOffer':
        case 'createPassiveSellOffer':
          {
            result.type = 'createPassiveSellOffer';
            result.selling = _asset.Asset.fromOperation(attrs.selling());
            result.buying = _asset.Asset.fromOperation(attrs.buying());
            result.amount = this._fromXDRAmount(attrs.amount());
            result.price = this._fromXDRPrice(attrs.price());
            break;
          }
        case 'accountMerge':
          {
            result.type = 'accountMerge';
            result.destination = (0, _decode_encode_muxed_account.encodeMuxedAccountToAddress)(attrs);
            break;
          }
        case 'manageData':
          {
            result.type = 'manageData';
            // manage_data.name is checked by iscntrl in stellar-core
            result.name = attrs.dataName().toString('ascii');
            result.value = attrs.dataValue();
            break;
          }
        case 'inflation':
          {
            result.type = 'inflation';
            break;
          }
        case 'bumpSequence':
          {
            result.type = 'bumpSequence';
            result.bumpTo = attrs.bumpTo().toString();
            break;
          }
        case 'createClaimableBalance':
          {
            result.type = 'createClaimableBalance';
            result.asset = _asset.Asset.fromOperation(attrs.asset());
            result.amount = this._fromXDRAmount(attrs.amount());
            result.claimants = [];
            attrs.claimants().forEach(function (claimant) {
              result.claimants.push(_claimant.Claimant.fromXDR(claimant));
            });
            break;
          }
        case 'claimClaimableBalance':
          {
            result.type = 'claimClaimableBalance';
            result.balanceId = attrs.toXDR('hex');
            break;
          }
        case 'beginSponsoringFutureReserves':
          {
            result.type = 'beginSponsoringFutureReserves';
            result.sponsoredId = accountIdtoAddress(attrs.sponsoredId());
            break;
          }
        case 'endSponsoringFutureReserves':
          {
            result.type = 'endSponsoringFutureReserves';
            break;
          }
        case 'revokeSponsorship':
          {
            extractRevokeSponshipDetails(attrs, result);
            break;
          }
        default:
          {
            throw new Error('Unknown operation: ' + operationName);
          }
      }
      return result;
    }
  }, {
    key: 'isValidAmount',
    value: function isValidAmount(value) {
      var allowZero = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (!(0, _isString2.default)(value)) {
        return false;
      }

      var amount = void 0;
      try {
        amount = new _bignumber2.default(value);
      } catch (e) {
        return false;
      }

      if (
      // == 0
      !allowZero && amount.isZero() ||
      // < 0
      amount.isNegative() ||
      // > Max value
      amount.times(ONE).greaterThan(new _bignumber2.default(MAX_INT64).toString()) ||
      // Decimal places (max 7)
      amount.decimalPlaces() > 7 ||
      // NaN or Infinity
      amount.isNaN() || !amount.isFinite()) {
        return false;
      }

      return true;
    }
  }, {
    key: 'constructAmountRequirementsError',
    value: function constructAmountRequirementsError(arg) {
      return arg + ' argument must be of type String, represent a positive number and have at most 7 digits after the decimal';
    }

    /**
     * Returns value converted to uint32 value or undefined.
     * If `value` is not `Number`, `String` or `Undefined` then throws an error.
     * Used in {@link Operation.setOptions}.
     * @private
     * @param {string} name Name of the property (used in error message only)
     * @param {*} value Value to check
     * @param {function(value, name)} isValidFunction Function to check other constraints (the argument will be a `Number`)
     * @returns {undefined|Number}
     */

  }, {
    key: '_checkUnsignedIntValue',
    value: function _checkUnsignedIntValue(name, value) {
      var isValidFunction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      if ((0, _isUndefined2.default)(value)) {
        return undefined;
      }

      if ((0, _isString2.default)(value)) {
        value = parseFloat(value);
      }

      switch (true) {
        case !(0, _isNumber2.default)(value) || !(0, _isFinite2.default)(value) || value % 1 !== 0:
          throw new Error(name + ' value is invalid');
        case value < 0:
          throw new Error(name + ' value must be unsigned');
        case !isValidFunction || isValidFunction && isValidFunction(value, name):
          return value;
        default:
          throw new Error(name + ' value is invalid');
      }
    }
    /**
     * @private
     * @param {string|BigNumber} value Value
     * @returns {Hyper} XDR amount
     */

  }, {
    key: '_toXDRAmount',
    value: function _toXDRAmount(value) {
      var amount = new _bignumber2.default(value).mul(ONE);
      return _jsXdr.Hyper.fromString(amount.toString());
    }

    /**
     * @private
     * @param {string|BigNumber} value XDR amount
     * @returns {BigNumber} Number
     */

  }, {
    key: '_fromXDRAmount',
    value: function _fromXDRAmount(value) {
      return new _bignumber2.default(value).div(ONE).toFixed(7);
    }

    /**
     * @private
     * @param {object} price Price object
     * @param {function} price.n numerator function that returns a value
     * @param {function} price.d denominator function that returns a value
     * @returns {BigNumber} Big string
     */

  }, {
    key: '_fromXDRPrice',
    value: function _fromXDRPrice(price) {
      var n = new _bignumber2.default(price.n());
      return n.div(new _bignumber2.default(price.d())).toString();
    }

    /**
     * @private
     * @param {object} price Price object
     * @param {function} price.n numerator function that returns a value
     * @param {function} price.d denominator function that returns a value
     * @returns {object} XDR price object
     */

  }, {
    key: '_toXDRPrice',
    value: function _toXDRPrice(price) {
      var xdrObject = void 0;
      if (price.n && price.d) {
        xdrObject = new _stellarXdr_generated2.default.Price(price);
      } else {
        price = new _bignumber2.default(price);
        var approx = (0, _continued_fraction.best_r)(price);
        xdrObject = new _stellarXdr_generated2.default.Price({
          n: parseInt(approx[0], 10),
          d: parseInt(approx[1], 10)
        });
      }

      if (xdrObject.n() < 0 || xdrObject.d() < 0) {
        throw new Error('price must be positive');
      }

      return xdrObject;
    }
  }]);

  return Operation;
}();

function extractRevokeSponshipDetails(attrs, result) {
  switch (attrs.switch().name) {
    case 'revokeSponsorshipLedgerEntry':
      {
        var ledgerKey = attrs.ledgerKey();
        switch (ledgerKey.switch().name) {
          case _stellarXdr_generated2.default.LedgerEntryType.account().name:
            {
              result.type = 'revokeAccountSponsorship';
              result.account = accountIdtoAddress(ledgerKey.account().accountId());
              break;
            }
          case _stellarXdr_generated2.default.LedgerEntryType.trustline().name:
            {
              result.type = 'revokeTrustlineSponsorship';
              result.account = accountIdtoAddress(ledgerKey.trustLine().accountId());
              result.asset = _asset.Asset.fromOperation(ledgerKey.trustLine().asset());
              break;
            }
          case _stellarXdr_generated2.default.LedgerEntryType.offer().name:
            {
              result.type = 'revokeOfferSponsorship';
              result.seller = accountIdtoAddress(ledgerKey.offer().sellerId());
              result.offerId = ledgerKey.offer().offerId().toString();
              break;
            }
          case _stellarXdr_generated2.default.LedgerEntryType.data().name:
            {
              result.type = 'revokeDataSponsorship';
              result.account = accountIdtoAddress(ledgerKey.data().accountId());
              result.name = ledgerKey.data().dataName().toString('ascii');
              break;
            }
          case _stellarXdr_generated2.default.LedgerEntryType.claimableBalance().name:
            {
              result.type = 'revokeClaimableBalanceSponsorship';
              result.balanceId = ledgerKey.claimableBalance().balanceId().toXDR('hex');
              break;
            }
          default:
            {
              throw new Error('Unknown ledgerKey: ' + attrs.switch().name);
            }
        }
        break;
      }
    case 'revokeSponsorshipSigner':
      {
        result.type = 'revokeSignerSponsorship';
        result.account = accountIdtoAddress(attrs.signer().accountId());
        result.signer = convertXDRSignerKeyToObject(attrs.signer().signerKey());
        break;
      }
    default:
      {
        throw new Error('Unknown revokeSponsorship: ' + attrs.switch().name);
      }
  }
}

function convertXDRSignerKeyToObject(signerKey) {
  var attrs = {};
  switch (signerKey.switch().name) {
    case _stellarXdr_generated2.default.SignerKeyType.signerKeyTypeEd25519().name:
      {
        attrs.ed25519PublicKey = _strkey.StrKey.encodeEd25519PublicKey(signerKey.ed25519());
        break;
      }
    case _stellarXdr_generated2.default.SignerKeyType.signerKeyTypePreAuthTx().name:
      {
        attrs.preAuthTx = signerKey.preAuthTx().toString('hex');
        break;
      }
    case _stellarXdr_generated2.default.SignerKeyType.signerKeyTypeHashX().name:
      {
        attrs.sha256Hash = signerKey.hashX().toString('hex');
        break;
      }
    default:
      {
        throw new Error('Unknown signerKey: ' + signerKey.switch().name);
      }
  }

  return attrs;
}

function accountIdtoAddress(accountId) {
  return _strkey.StrKey.encodeEd25519PublicKey(accountId.ed25519());
}

// Attach all imported operations as static methods on the Operation class
Operation.accountMerge = ops.accountMerge;
Operation.allowTrust = ops.allowTrust;
Operation.bumpSequence = ops.bumpSequence;
Operation.changeTrust = ops.changeTrust;
Operation.createAccount = ops.createAccount;
Operation.createClaimableBalance = ops.createClaimableBalance;
Operation.claimClaimableBalance = ops.claimClaimableBalance;
Operation.createPassiveSellOffer = ops.createPassiveSellOffer;
Operation.inflation = ops.inflation;
Operation.manageData = ops.manageData;
Operation.manageSellOffer = ops.manageSellOffer;
Operation.manageBuyOffer = ops.manageBuyOffer;
Operation.pathPaymentStrictReceive = ops.pathPaymentStrictReceive;
Operation.pathPaymentStrictSend = ops.pathPaymentStrictSend;
Operation.payment = ops.payment;
Operation.setOptions = ops.setOptions;
Operation.beginSponsoringFutureReserves = ops.beginSponsoringFutureReserves;
Operation.endSponsoringFutureReserves = ops.endSponsoringFutureReserves;
Operation.revokeAccountSponsorship = ops.revokeAccountSponsorship;
Operation.revokeTrustlineSponsorship = ops.revokeTrustlineSponsorship;
Operation.revokeOfferSponsorship = ops.revokeOfferSponsorship;
Operation.revokeDataSponsorship = ops.revokeDataSponsorship;
Operation.revokeClaimableBalanceSponsorship = ops.revokeClaimableBalanceSponsorship;
Operation.revokeSignerSponsorship = ops.revokeSignerSponsorship;