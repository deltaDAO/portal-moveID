const PONTUSX_ADDRESSES = require('./pontusxAddresses.json')

module.exports = {
  whitelists: {
    'nft.owner': [],
    'datatokens.address': []
  },
  featured: [
    {
      title: 'Vehicle Data - Road Condition Monitoring',
      assets: [
        'did:op:f892fdeb6e4aead439a992ee66322d96d625f7acfed999e633c4b5c81b0968a9', // Hamburg Urban Data
        'did:op:60345a1cffaf69e978846858760f69ebe6688e3fa1b9a21f2cdb81b82c415049', // Road Condition Short
        'did:op:4103da1b9000f90c4262b94353b23175e490f47e3fd9bf3bda440f550178f423', // Road Condition Long
        'did:op:423ae6f53c14980e871ba8109f1f493077c1691dac7a56c413a973238a90f2fa', // Hamburg Road 18
        'did:op:61788149bc0837d0bea0ee32b04eb8bebb20c2e73e1098cfdec4807d86eddac7', // Hamburg Road 17
        'did:op:1cccfa6b2de76b2f831183c9404675a84f12c336c2ebde87dbfad9e2b39c1295', // SH Road 16
        'did:op:f6b81477c783e84cb9fbb0d7b57b1974b6f0a86067f2f17bbdd9f2e2dd7802a3', // SH Road 15
        'did:op:555b7d7c03f365c9166afb4524fe5e332f9794fbeb5e9770fe47d1da9adff9c4', // SH Road 14
        'did:op:aea8d72bd0ea2f2633599caa69488b212ecaa7fb0b44abb0e3c58494da143b95', // SH Road 13
        'did:op:1501d13f41eca77a6a5449a1ecf5d8ff5ca4a1881889af5b8912629ab71856e5', // zone
        'did:op:14f5679644249e7889b85d9964abb96eb31eb5537651d3458b9616d29450772c' // ArcGIS
      ]
    }
  ],
  verifiedAddresses: PONTUSX_ADDRESSES
}
