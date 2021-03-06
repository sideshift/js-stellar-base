'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Transaction = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _stellarXdr_generated = require('./generated/stellar-xdr_generated');

var _stellarXdr_generated2 = _interopRequireDefault(_stellarXdr_generated);

var _hashing = require('./hashing');

var _strkey = require('./strkey');

var _operation = require('./operation');

var _memo = require('./memo');

var _transaction_base = require('./transaction_base');

var _decode_encode_muxed_account = require('./util/decode_encode_muxed_account');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Use {@link TransactionBuilder} to build a transaction object. If you have
 * an object or base64-encoded string of the transaction envelope XDR use {@link TransactionBuilder.fromXDR}.
 *
 * Once a Transaction has been created, its attributes and operations
 * should not be changed. You should only add signatures (using {@link Transaction#sign}) to a Transaction object before
 * submitting to the network or forwarding on to additional signers.
 * @constructor
 * @param {string|xdr.TransactionEnvelope} envelope - The transaction envelope object or base64 encoded string.
 * @param {string} [networkPassphrase] passphrase of the target stellar network (e.g. "Public Global Stellar Network ; September 2015").
 * @extends TransactionBase
 */
var Transaction = exports.Transaction = function (_TransactionBase) {
  _inherits(Transaction, _TransactionBase);

  function Transaction(envelope, networkPassphrase) {
    _classCallCheck(this, Transaction);

    if (typeof envelope === 'string') {
      var buffer = Buffer.from(envelope, 'base64');
      envelope = _stellarXdr_generated2.default.TransactionEnvelope.fromXDR(buffer);
    }

    var envelopeType = envelope.switch();
    if (!(envelopeType === _stellarXdr_generated2.default.EnvelopeType.envelopeTypeTxV0() || envelopeType === _stellarXdr_generated2.default.EnvelopeType.envelopeTypeTx())) {
      throw new Error('Invalid TransactionEnvelope: expected an envelopeTypeTxV0 or envelopeTypeTx but received an ' + envelopeType.name + '.');
    }

    var txEnvelope = envelope.value();
    var tx = txEnvelope.tx();
    var fee = tx.fee().toString();
    var signatures = (txEnvelope.signatures() || []).slice();

    var _this = _possibleConstructorReturn(this, (Transaction.__proto__ || Object.getPrototypeOf(Transaction)).call(this, tx, signatures, fee, networkPassphrase));

    _this._envelopeType = envelopeType;
    _this._memo = tx.memo();
    _this._sequence = tx.seqNum().toString();

    switch (_this._envelopeType) {
      case _stellarXdr_generated2.default.EnvelopeType.envelopeTypeTxV0():
        _this._source = _strkey.StrKey.encodeEd25519PublicKey(_this.tx.sourceAccountEd25519());
        break;
      default:
        _this._source = (0, _decode_encode_muxed_account.encodeMuxedAccountToAddress)(_this.tx.sourceAccount());
        break;
    }

    var timeBounds = tx.timeBounds();
    if (timeBounds) {
      _this._timeBounds = {
        minTime: timeBounds.minTime().toString(),
        maxTime: timeBounds.maxTime().toString()
      };
    }
    var operations = tx.operations() || [];
    _this._operations = (0, _map2.default)(operations, function (op) {
      return _operation.Operation.fromXDRObject(op);
    });
    return _this;
  }

  /**
   * @type {object}
   * @property {string} 64 bit unix timestamp
   * @property {string} 64 bit unix timestamp
   * @readonly
   */


  _createClass(Transaction, [{
    key: 'signatureBase',


    /**
     * Returns the "signature base" of this transaction, which is the value
     * that, when hashed, should be signed to create a signature that
     * validators on the Stellar Network will accept.
     *
     * It is composed of a 4 prefix bytes followed by the xdr-encoded form
     * of this transaction.
     * @returns {Buffer}
     */
    value: function signatureBase() {
      var tx = this.tx;

      // Backwards Compatibility: Use ENVELOPE_TYPE_TX to sign ENVELOPE_TYPE_TX_V0
      // we need a Transaction to generate the signature base
      if (this._envelopeType === _stellarXdr_generated2.default.EnvelopeType.envelopeTypeTxV0()) {
        tx = _stellarXdr_generated2.default.Transaction.fromXDR(Buffer.concat([
        // TransactionV0 is a transaction with the AccountID discriminant
        // stripped off, we need to put it back to build a valid transaction
        // which we can use to build a TransactionSignaturePayloadTaggedTransaction
        _stellarXdr_generated2.default.PublicKeyType.publicKeyTypeEd25519().toXDR(), tx.toXDR()]));
      }

      var taggedTransaction = new _stellarXdr_generated2.default.TransactionSignaturePayloadTaggedTransaction.envelopeTypeTx(tx);

      var txSignature = new _stellarXdr_generated2.default.TransactionSignaturePayload({
        networkId: _stellarXdr_generated2.default.Hash.fromXDR((0, _hashing.hash)(this.networkPassphrase)),
        taggedTransaction: taggedTransaction
      });

      return txSignature.toXDR();
    }

    /**
     * To envelope returns a xdr.TransactionEnvelope which can be submitted to the network.
     * @returns {xdr.TransactionEnvelope}
     */

  }, {
    key: 'toEnvelope',
    value: function toEnvelope() {
      var rawTx = this.tx.toXDR();
      var signatures = this.signatures.slice(); // make a copy of the signatures

      var envelope = void 0;
      switch (this._envelopeType) {
        case _stellarXdr_generated2.default.EnvelopeType.envelopeTypeTxV0():
          envelope = new _stellarXdr_generated2.default.TransactionEnvelope.envelopeTypeTxV0(new _stellarXdr_generated2.default.TransactionV0Envelope({
            tx: _stellarXdr_generated2.default.TransactionV0.fromXDR(rawTx), // make a copy of tx
            signatures: signatures
          }));
          break;
        case _stellarXdr_generated2.default.EnvelopeType.envelopeTypeTx():
          envelope = new _stellarXdr_generated2.default.TransactionEnvelope.envelopeTypeTx(new _stellarXdr_generated2.default.TransactionV1Envelope({
            tx: _stellarXdr_generated2.default.Transaction.fromXDR(rawTx), // make a copy of tx
            signatures: signatures
          }));
          break;
        default:
          throw new Error('Invalid TransactionEnvelope: expected an envelopeTypeTxV0 or envelopeTypeTx but received an ' + this._envelopeType.name + '.');
      }

      return envelope;
    }
  }, {
    key: 'timeBounds',
    get: function get() {
      return this._timeBounds;
    },
    set: function set(value) {
      throw new Error('Transaction is immutable');
    }

    /**
     * @type {string}
     * @readonly
     */

  }, {
    key: 'sequence',
    get: function get() {
      return this._sequence;
    },
    set: function set(value) {
      throw new Error('Transaction is immutable');
    }

    /**
     * @type {string}
     * @readonly
     */

  }, {
    key: 'source',
    get: function get() {
      return this._source;
    },
    set: function set(value) {
      throw new Error('Transaction is immutable');
    }

    /**
     * @type {Array.<xdr.Operation>}
     * @readonly
     */

  }, {
    key: 'operations',
    get: function get() {
      return this._operations;
    },
    set: function set(value) {
      throw new Error('Transaction is immutable');
    }

    /**
     * @type {string}
     * @readonly
     */

  }, {
    key: 'memo',
    get: function get() {
      return _memo.Memo.fromXDRObject(this._memo);
    },
    set: function set(value) {
      throw new Error('Transaction is immutable');
    }
  }]);

  return Transaction;
}(_transaction_base.TransactionBase);