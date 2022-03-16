import { toContractAddress } from "@rarible/types";

export const getCurrency = (address) => ({
  "@type": "ERC20",
  contract: toContractAddress(
    // WETH address on Rinkeby/Ropsten testnets
    `POLYGON:${address}`
  ),
});

export const getTokenAddress = (id) => `POLYGON:${id}`;

export const getRaribleNftDataFromMeta = (meta) => {
  if (meta.content) {
    return {
      ...meta,
      image: (
        meta.content?.find((content) => content["@type"] === "IMAGE") ?? {}
      ).url,
      animation: (
        meta.content?.find((content) => content["@type"] === "VIDEO") ?? {}
      ).url,
    };
  } else {
    return {
      ...meta,
      image: meta.image.url.ORIGINAL,
      animation: meta.animation.url.ORIGINAL,
    };
  }
};
