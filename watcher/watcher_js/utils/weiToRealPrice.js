const MANA_DECIMALS = 18;

export default function weiToRealPrice(priceInWei) {
		return priceInWei.toNumber() / 10 ** MANA_DECIMALS;
};