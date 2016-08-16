import invariant from 'invariant'
import axios from 'axios'

const identity = x => x

/**
 * Initialize an object to interact with `smyte` api.
 * @public
 */
export default class Smyte {
  constructor(options = {}) {
    invariant(
      !!options.apiKey,
      'smyte-client: expected apiKey to be present'
    )

    invariant(
      !!options.apiSecret,
      'smyte-client: expected apiSecret to be present'
    )

    this._apiKey = options.apiKey
    this._apiSecret = options.apiSecret
    this._classifyFn = options.transformClassifyResponse || identity
    this._sendFn = options.transformSendResponse || identity

    this.connection = axios.create({
      baseURL: 'https://api.smyte.com',
      headers: {
        'Content-Type': 'application/json'
      },
      auth: {
        username: this._apiKey,
        password: this._apiSecret
      }
    })
  }

  /**
   * Send an action to classify payload. Success handler will have
   * classification result.
   *
   * @public
   * @param {string} eventName - name of action
   * @param {object} payload
   * @returns {Promise}
   */
  classify(eventName, payload) {
    return process(
      this.connection, eventName, payload, '/v2/action/classify'
    ).then(res => this._classifyFn(pickData(res)))
  }

  /**
   * Send an action without waiting for an immediate result.
   *
   * @public
   * @param {string} eventName
   * @param {object} payload
   * @returns {Promise}
   */
  send(eventName, payload) {
    return process(
      this.connection, eventName, payload, '/v2/action'
    ).then(res => this._sendFn(pickData(res)))
  }
}

/**
 * Only return `data` from argument.
 *
 * @param {object}
 * @returns {object}
 */
const pickData = res => res.data

/**
 * Process the event to smyte.
 *
 * @public
 * @param {axios} connection
 * @param {string} eventName
 * @param {object} payload
 * @param {string} url
 * @returns {Promise}
 */
const process = (connection, eventName, payload, url) => {
  payload = { ...payload, name: eventName }
  return connection.post(url, payload)
}

/**
 * Enum for classification types.
 * @public
 */
Smyte.Classification = {
  ALLOW: 'ALLOW',
  BLOCK: 'BLOCK'
}

