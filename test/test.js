import path from 'path'
import expect from 'expect'
import vcr from 'nock-vcr-recorder'

vcr.config({
  cassetteLibraryDir: path.resolve('./test/cassettes')
})

import Smyte from '../src'

const API_KEY = 'key'
const API_SECRET = 'secret'

describe('smyte-client', () => {

  it('should cry when there is no key and secret', () => {
    expect(
      () => new Smyte({})
    ).toThrow(/smyte-client: expected apiKey to be present/)

    expect(
      () => new Smyte({apiKey: '123'})
    ).toThrow(/smyte-client: expected apiSecret to be present/)
  })

  describe('#classify', () => {
    it('should get a classification result', () => {
      const smyte = new Smyte({ apiKey: API_KEY, apiSecret: API_SECRET })
      const signupPayload = require('./action-fixtures/signup.json')

      return vcr.useCassette('signup-classify', () => {
        return smyte.classify('signup', signupPayload).then(classification => {
          expect(classification.verdict).toBe(Smyte.Classification.ALLOW)
        })
      })
    })

    it('should allow for a custom transformer fn', () => {
      const smyte = new Smyte({
        apiKey: API_KEY,
        apiSecret: API_SECRET,
        transformClassifyResponse(raw) {
          return new ClassifyResponse(raw)
        },
      })

      const signupPayload = require('./action-fixtures/signup.json')
      return vcr.useCassette('signup-classify', () => {
        return smyte.classify('signup', signupPayload).then(response => {
          expect(response.whoami).toBe('ClassifyResponse')
        })
      })
    })
  })

  describe('#send', () => {
    it('should send an action', () => {
      const smyte = new Smyte({ apiKey: API_KEY, apiSecret: API_SECRET })
      const signupPayload = require('./action-fixtures/signup.json')

      return vcr.useCassette('signup-regular', () => {
        return smyte.send('signup', signupPayload).then(response => {
          expect(response.message).toBe(
            'Action was logged.'
          )
        })
      })
    })

    it('should allow for a custom transformer fn', () => {
      const smyte = new Smyte({
        apiKey: API_KEY,
        apiSecret: API_SECRET,
        transformSendResponse(raw) {
          return new SendResponse(raw)
        },
      })

      const signupPayload = require('./action-fixtures/signup.json')
      return vcr.useCassette('signup-regular', () => {
        return smyte.send('signup', signupPayload).then(response => {
          expect(response.whoami).toBe('SendResponse')
        })
      })
    })
  })
})

class CustomResponse {
  constructor(options = {}) {
    Object.keys(options).forEach(key => {
      this[key] = options[key]
    })
  }
}

class ClassifyResponse extends CustomResponse {
  constructor(options = {}) {
    super(options)
    this.whoami = 'ClassifyResponse'
  }
}

class SendResponse extends CustomResponse {
  constructor(options = {}) {
    super(options)
    this.whoami = 'SendResponse'
  }
}
