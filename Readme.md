smyte-client
============

Very thin wrapper to work with [smyte](https://www.smyte.com/) web api. It
works both with browser and node.js.

### What?

```js
import Smyte from 'smyte-client'

const smyte = new Smyte({ apiKey: ..., apiSecret: ... })

// you can send actions directly without waiting a result.
const payload = {
  "timestamp": "2015-07-29T10:54:34-04:00",
  "data": {
    "chargeback": {
      "createdAt": "2015-07-29T10:54:34-04:00",
      "id": "chargebackId",
      "amount": "300",
      "currency": "USD",
      "paymentId": "paymentId",
    },
  },
}
smyte.send('chargeback', payload)

// or you can get a classification result
smyte.classify('chargeback', payload).then(res => {
  console.log(res.verdict)
  // => either Smyte.Classification.ALLOW or Smyte.Classification.BLOCK
})
```

That's it.

### install

    npm install smyte-client


### licence

MIT

