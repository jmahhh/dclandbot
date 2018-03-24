import BigNumber from 'bignumber.js';

const max = new BigNumber('0x7fffffffffffffffffffffffffffffff');
const base = new BigNumber('0x100000000000000000000000000000000');

export default function decodeTokenId(hexRepresentation) {
  const yLength = hexRepresentation.length - 32;
	let x = new BigNumber('0x' + (hexRepresentation.slice(0, yLength) || '0'));
  let y = new BigNumber('0x' + hexRepresentation.slice(yLength, hexRepresentation.length));
  if (x.gt(max)) x = base.minus(x).times(-1);
  if (y.gt(max)) y = base.minus(y).times(-1);
  return [ x.toString(10), y.toString(10) ].toString();
}