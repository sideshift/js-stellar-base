'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FeeBumpTransaction = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stellarXdr_generated = require('./generated/stellar-xdr_generated');

var _stellarXdr_generated2 = _interopRequireDefault(_stellarXdr_generated);

var _hashing = require('./hashing');

var _transaction = require('./transaction');

var _transaction_base = require('./transaction_base');

var _decode_encode_muxed_account = require('./util/decode_encode_muxed_account');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Use {@link TransactionBuilder.buildFeeBumpTransaction} to build a
 * FeeBumpTransaction object. If you have an object or base64-encoded string of
 * the transaction envelope XDR use {@link TransactionBuilder.fromXDR}.
 *
 * Once a {@link FeeBumpTransaction} has been created, its attributes and operations
 * should not be changed. You should only add signatures (using {@link FeeBumpTransaction#sign}) before
 * submitting to the network or forwarding on to additional signers.
 * @param {string|xdr.TransactionEnvelope} envelope - The transaction envelope object or base64 encoded string.
 * @param {string} networkPassphrase passphrase of the target stellar network (e.g. "Public Global Stellar Network ; September 2015").
 * @extends TransactionBase
 */
var FeeBumpTransaction = exports.FeeBumpTransaction = function (_TransactionBase) {
  _inherits(FeeBumpTransaction, _TransactionBase);

  function FeeBumpTransaction(envelope, networkPassphrase) {
    _classCallCheck(this, FeeBumpTransaction);

    if (typeof envelope === 'string') {
      var buffer = Buffer.from(envelope, 'base64');
      envelope = _stellarXdr_generated2.default.TransactionEnvelope.fromXDR(buffer);
    }

    var envelopeType = envelope.switch();
    if (envelopeType !== _stellarXdr_generated2.default.EnvelopeType.envelopeTypeTxFeeBump()) {
      throw new Error('Invalid TransactionEnvelope: expected an envelopeTypeTxFeeBump but received an ' + envelopeType.name + '.');
    }

    var txEnvelope = envelope.value();
    var tx = txEnvelope.tx();
    var fee = tx.fee().toString();
    // clone signatures
    var signatures = (txEnvelope.signatures() || []).slice();

    var _this = _possibleConstructorReturn(this, (FeeBumpTransaction.__proto__ || Object.getPrototypeOf(FeeBumpTransaction)).call(this, tx, signatures, fee, networkPassphrase));

    var innerTxEnvelope = _stellarXdr_generated2.default.TransactionEnvelope.envelopeTypeTx(tx.innerTx().v1());
    _this._feeSource = (0, _decode_encode_muxed_account.encodeMuxedAccountToAddress)(_this.tx.feeSource());
    _this._innerTransaction = new _transaction.Transaction(innerTxEnvelope, networkPassphrase);
    return _this;
  }

  /**
   * @type {Transaction}
   * @readonly
   */


  _createClass(FeeBumpTransaction, [{
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
      var taggedTransaction = new _stellarXdr_generated2.default.TransactionSignaturePayloadTaggedTransaction.envelopeTypeTxFeeBump(this.tx);

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
      var envelope = new _stellarXdr_generated2.default.FeeBumpTransactionEnvelope({
        tx: _stellarXdr_generated2.default.FeeBumpTransaction.fromXDR(this.tx.toXDR()), // make a copy of the tx
        signatures: this.signatures.slice() // make a copy of the signatures
      });

      return new _stellarXdr_generated2.default.TransactionEnvelope.envelopeTypeTxFeeBump(envelope);
    }
  }, {
    key: 'innerTransaction',
    get: function get() {
      return this._innerTransaction;
    }

    /**
     * @type {string}
     * @readonly
     */

  }, {
    key: 'feeSource',
    get: function get() {
      return this._feeSource;
    }
  }]);

  return FeeBumpTransaction;
}(_transaction_base.TransactionBase);