const BigNumber = require('bignumber.js');
const axios = require('axios');

const path = require('path');
const lib = path.join(path.dirname(require.resolve('axios')),'lib/adapters/http');
const http = require(lib);

const abis = require('./abis.js');

const EST_ADDR = '0x959e104e1a4db6317fa58f8295f586e1a978c297';

// from https://github.com/decentraland/auction/blob/578219535f962232dc984f76adf79c77a15c9603/scripts/recovery.js
const max = new BigNumber('0x7fffffffffffffffffffffffffffffff');
const base = new BigNumber('0x100000000000000000000000000000000');

const decodeTokenId = (hexRepresentation) => {
  const yLength = hexRepresentation.length - 32;
	let x = new BigNumber('0x' + (hexRepresentation.slice(0, yLength) || '0'));
  let y = new BigNumber('0x' + hexRepresentation.slice(yLength, hexRepresentation.length));
  if (x.gt(max)) x = base.minus(x).times(-1);
  if (y.gt(max)) y = base.minus(y).times(-1);
  return [ x.toString(10), y.toString(10) ];
}

const getEstateLandCoords= (web3, tokenId) => {
	const estContract = web3.eth.contract(abis.EST_ABI);
	const estInstance = estContract.at(EST_ADDR);
	const amount = estInstance.getEstateSize(tokenId);
	let coords = [];
	for (let x = 0; x < amount; x++) {
		const hexRep = estInstance.estateLandIds(tokenId, x).toString(16);
		coords.push(decodeTokenId(hexRep));
	}
	return coords;
}

const getBase64 = (url) => {
  return axios
    .get(url, {
			adapter: http,
      responseType: 'arraybuffer'
    })
    .then(response => new Buffer(response.data, 'binary').toString('base64'));
}

exports.MANA_DEC = 18;
exports.MPLACE_ADDR = '0x8e5660b4Ab70168b5a6fEeA0e0315cb49c8Cd539';
exports.LAND_ADDR = '0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d';
exports.EST_ADDR = EST_ADDR;
exports.CMC_API = 'https://api.coinmarketcap.com/v1/ticker/decentraland/?convert=USD';
exports.decodeTokenId = decodeTokenId;
exports.getBase64 = getBase64;
exports.getEstateLandCoords = getEstateLandCoords;
