export const getChainId = (state) => state.global.get("chainId");
export const getIsInitialized = (state) => state.global.get("isInitialized");
export const getExchangeRateETH = (state) =>
  state.global.get("exchangeRateETH");
export const getMinBidIncrement = (state) =>
  state.global.get("minBidIncrement");
export const getBidWithdrawalLockTime = (state) =>
  state.global.get("bidWithdrawalLockTime");
export const getRewards = (state) => state.global.get("rewards");
export const getMonaPerEth = (state) => state.global.get("monaPerEth");
export const getMonaMaticBalance = (state) =>
  state.global.get("monaMaticBalance");
export const getMonaEthBalance = (state) => state.global.get("monaEthBalance");
export const getIsLoading = (state) => state.global.get("isLoading");
export const getDtxEthIds = (state) => state.global.get("dtxEthIds");
export const getDtxMaticIds = (state) => state.global.get("dtxMaticIds");
export const getEthNfts = (state) => state.global.get("ethNfts");
export const getMaticNfts = (state) => state.global.get("maticNfts");
export const getAllUsers = (state) => state.global.get("allUsers");
export const getAllDesigners = (state) => state.global.get("allDesigners");
