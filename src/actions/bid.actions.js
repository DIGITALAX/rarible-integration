import BaseActions from "@actions/base-actions";
import { utils as ethersUtils, constants, BigNumber } from "ethers";
import { utils } from "web3";
import config from "@utils/config";
import { convertToWei } from "@helpers/price.helpers";
import {
  getEnabledNetworkByChainId,
  getMarketplaceContractAddressByChainId,
  getMonaContractAddressByChainId,
  getSecondaryMarketplaceAddressByChainId,
} from "@services/network.service";

import auctionReducer from "../reducers/auction.reducer";
import {
  getContract,
  getMarketplaceContract,
  getMonaTokenContract,
  getERC721Contract,
  getSecondaryMarketplaceContract,
} from "../services/contract.service";
import { toContractAddress, toItemId, toOrderId } from "@rarible/types";
import { getCurrency, getTokenAddress } from "@utils/rarible";

class BidActions extends BaseActions {
  bid(id, price) {
    return async (_, getState) => {
      // const account = getState().user.get("account");
      // const chainId = getState().global.get("chainId");
      // const network = getEnabledNetworkByChainId(chainId);
      // const auctionContractAddress =
      //   config.AUCTION_CONTRACT_ADDRESS[network.alias];
      // const digitalaxNFTV2Address =
      //   config.DIGITALAX_NFT_V2_ADDRESS[network.alias];
      // const monaContractAddress = await getMonaContractAddressByChainId(
      //   chainId
      // );
      // const currency = getCurrency(monaContractAddress);
      // const amount = 1;
      // const orderRequest = {
      //   itemId: toItemId(tokenAddress),
      // };
      // console.log({ orderRequest });
      // try {
      //   const bidResponse = await window.raribleSdk.order.bid(orderRequest);
      //   console.log({ bidResponse });
      //   console.log({ currency });
      //   const response = await bidResponse.submit({
      //     amount,
      //     price,
      //     currency,
      //   });
      //   console.log({ response });
      //   return response;
      // } catch (error) {
      //   console.log({ error });
      //   throw error;
      // }
      // const monaContract = await getMonaTokenContract(monaContractAddress);
      // const allowedValue = await monaContract.methods
      //   .allowance(account, auctionContractAddress)
      //   .call({ from: account });
      // const jsAllowedValue = parseFloat(ethersUtils.formatEther(allowedValue));
      // if (jsAllowedValue < 10000000000) {
      //   const listener = monaContract.methods
      //     .approve(auctionContractAddress, convertToWei(20000000000))
      //     .send({ from: account });
      //   const promise = new Promise((resolve, reject) => {
      //     listener.on('error', (error) => reject(error));
      //     listener.on('confirmation', (transactionHash) => resolve(transactionHash));
      //   });
      //   return {
      //     promise,
      //     unsubscribe: () => {
      //       listener.off('error');
      //       listener.off('transactionHash');
      //     },
      //   };
      // }
      // const listener = contract.methods.placeBid(id, weiValue).send({ from: account });
      // const promise = new Promise((resolve, reject) => {
      //   listener.on('error', (error) => reject(error));
      //   listener.on('transactionHash', (transactionHash) => resolve(transactionHash));
      // });
      // return {
      //   promise,
      //   unsubscribe: () => {
      //     listener.off('error');
      //     listener.off('transactionHash');
      //   },
      // };
    };
  }

  getAllowanceForAcution() {
    return async (_, getState) => {
      const account = getState().user.get("account");
      const chainId = getState().global.get("chainId");
      const network = getEnabledNetworkByChainId(chainId);
      const auctionContractAddress =
        config.AUCTION_CONTRACT_ADDRESS[network.alias];
      const monaContractAddress = await getMonaContractAddressByChainId(
        chainId
      );
      const monaContract = await getMonaTokenContract(monaContractAddress);
      const allowedValue = await monaContract.methods
        .allowance(account, auctionContractAddress)
        .call({ from: account });
      return allowedValue;
    };
  }

  getApprovedInMona() {
    return async (_, getState) => {
      const account = getState().user.get("account");
      const chainId = getState().global.get("chainId");
      const marketplaceContract = await getMarketplaceContractAddressByChainId(
        chainId
      );
      const monaContractAddress = await getMonaContractAddressByChainId(
        chainId
      );
      const monaContract = await getMonaTokenContract(monaContractAddress);
      const allowedValue = await monaContract.methods
        .allowance(account, marketplaceContract)
        .call({ from: account });
      const jsAllowedValue = parseFloat(ethersUtils.formatEther(allowedValue));
      return jsAllowedValue > 10000000000;
    };
  }

  getSecondaryApprovedInMona() {
    return async (_, getState) => {
      const account = getState().user.get("account");
      const chainId = getState().global.get("chainId");
      const secondaryMarketplaceAddress =
        await getSecondaryMarketplaceAddressByChainId(chainId);
      const monaContractAddress = await getMonaContractAddressByChainId(
        chainId
      );
      const monaContract = await getMonaTokenContract(monaContractAddress);
      const allowedValue = await monaContract.methods
        .allowance(account, secondaryMarketplaceAddress)
        .call({ from: account });
      const jsAllowedValue = parseFloat(ethersUtils.formatEther(allowedValue));
      return jsAllowedValue > 10000000000;
    };
  }

  getSecondaryNftApproved(tokenAddress, tokenId) {
    return async (_, getState) => {
      const account = getState().user.get("account");
      const chainId = getState().global.get("chainId");
      const secondaryMarketplaceAddress =
        await getSecondaryMarketplaceAddressByChainId(chainId);
      const tokenContract = await getERC721Contract(tokenAddress);

      const approved = await tokenContract.methods
        .isApproved(tokenId, secondaryMarketplaceAddress)
        .call({ from: account });

      return approved;
    };
  }

  approveSecondaryNft(tokenAddress, tokenId) {
    return async (_, getState) => {
      const account = getState().user.get("account");
      const chainId = getState().global.get("chainId");
      const secondaryMarketplaceAddress =
        await getSecondaryMarketplaceAddressByChainId(chainId);
      const tokenContract = await getERC721Contract(tokenAddress);

      const res = await tokenContract.methods
        .setApprovalForAll(secondaryMarketplaceAddress, true)
        .send({ from: account });

      return res;
    };
  }

  addSecondaryMarketplaceProduct(tokenId, price) {
    return async (_, getState) => {
      const chainId = getState().global.get("chainId");
      const address = await getMonaContractAddressByChainId(chainId);
      const tokenMultichainAddress = getTokenAddress(tokenId);
      const currency = getCurrency(address);
      const amount = 1;
      const orderRequest = {
        itemId: toItemId(tokenMultichainAddress),
      };

      try {
        const orderResponse = await window.raribleSdk.order.sell(orderRequest);
        const response = await orderResponse.submit({
          amount,
          price,
          currency,
        });

        return response;
      } catch (error) {
        throw error;
      }
    };
  }

  updateSecondaryMarketplaceOrder(orderId, price) {
    return async (_, getState) => {
      const updateOrderRequest = {
        orderId: toOrderId(orderId),
      };

      try {
        const orderResponse = await window.raribleSdk.order.sellUpdate(
          updateOrderRequest
        );
        const response = await orderResponse.submit({
          price,
        });
        return response;
      } catch (error) {
        console.log({ error });
        throw error;
      }
    };
  }

  secondaryBid(id, contract, price) {
    return async (_, getState) => {
      const chainId = getState().global.get("chainId");
      const monaContractAddress = await getMonaContractAddressByChainId(
        chainId
      );
      const currency = getCurrency(monaContractAddress);
      const tokenMultiChainAddress = `${contract}:${id}`;
      const amount = 1;
      const orderRequest = {
        itemId: toItemId(tokenMultiChainAddress),
      };
      try {
        const bidResponse = await window.raribleSdk.order.bid(orderRequest);
        const response = await bidResponse.submit({
          amount,
          price,
          currency,
        });
        console.log({ response });
        return response;
      } catch (error) {
        console.log({ error });
        throw error;
      }
    };
  }

  cancelSecondaryItem(orderId) {
    return async (_, getState) => {
      const cancelOrderRequest = {
        orderId: toOrderId(orderId),
      };
      const tx = await window.raribleSdk.order.cancel
        .start(cancelOrderRequest)
        .runAll();
      await tx.wait();

      return tx;
    };
  }

  secondaryAcceptBid(orderId) {
    return async (_, getState) => {
      const fillRequest = {
        orderId: toOrderId(orderId),
      };
      try {
        const fillResponse = await window.raribleSdk.order.acceptBid(
          fillRequest
        );
        const response = await fillResponse.submit({
          amount: 1,
        });
        return response;
      } catch (e) {
        console.log({ e });
      }
    };
  }

  secondaryBuyNow(orderId) {
    return async (_, getState) => {
      const fillRequest = {
        orderId: toOrderId(orderId),
      };
      try {
        const fillResponse = await window.raribleSdk.order.fill(fillRequest);

        const response = await fillResponse.submit({
          amount: 1, // Number of NFTs to buy
        });
        return response;
      } catch (error) {
        console.log({ error });
      }
    };
  }

  buyNow(id, value, isMona) {
    return async (_, getState) => {
      const account = getState().user.get("account");
      const chainId = getState().global.get("chainId");
      const marketplaceContract = await getMarketplaceContractAddressByChainId(
        chainId
      );
      const contract = await getMarketplaceContract(chainId);
      if (isMona) {
        const monaContractAddress = await getMonaContractAddressByChainId(
          chainId
        );
        const monaContract = await getMonaTokenContract(monaContractAddress);
        const allowedValue = await monaContract.methods
          .allowance(account, marketplaceContract)
          .call({ from: account });
        const jsAllowedValue = parseFloat(
          ethersUtils.formatEther(allowedValue)
        );
        if (jsAllowedValue < 10000000000) {
          const listener = monaContract.methods
            .approve(marketplaceContract, convertToWei(20000000000))
            .send({ from: account });
          const promise = new Promise((resolve, reject) => {
            listener.on("error", (error) => reject(error));
            listener.on("confirmation", (transactionHash) =>
              resolve(transactionHash)
            );
          });
          return {
            promise,
            unsubscribe: () => {
              listener.off("error");
              listener.off("transactionHash");
            },
          };
        }
      }
      const listener = contract.methods.buyOffer(id).send({ from: account });
      const promise = new Promise((resolve, reject) => {
        listener.on("error", (error) => reject(error));
        listener.on("confirmation", (transactionHash) =>
          resolve(transactionHash)
        );
      });
      return {
        promise,
        unsubscribe: () => {
          listener.off("error");
          listener.off("transactionHash");
        },
      };
    };
  }

  withdraw(id) {
    return async (_, getState) => {
      const account = getState().user.get("account");
      const auctionContractAddress = getState().global.get(
        "auctionContractAddress"
      );
      const contract = await getContract(auctionContractAddress);
      const listener = contract.methods.withdrawBid(id).send({ from: account });
      const promise = new Promise((resolve, reject) => {
        listener.on("error", (error) => reject(error));
        listener.on("transactionHash", (transactionHash) =>
          resolve(transactionHash)
        );
      });

      return {
        promise,
        unsubscribe: () => {
          listener.off("error");
          listener.off("transactionHash");
        },
      };
    };
  }
}

export default new BidActions(auctionReducer);
