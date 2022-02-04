import BaseActions from '@actions/base-actions';
import { utils as ethersUtils, constants, BigNumber } from 'ethers';
import { utils } from 'web3';
import config from '@utils/config';
import { convertToWei } from '@helpers/price.helpers';
import {
  getEnabledNetworkByChainId,
  getMarketplaceContractAddressByChainId,
  getMonaContractAddressByChainId,
  getSecondaryMarketplaceAddressByChainId,
} from '@services/network.service';

import auctionReducer from '../reducers/auction.reducer';
import {
  getContract,
  getMarketplaceContract,
  getMonaTokenContract,
  getERC721Contract,
  getSecondaryMarketplaceContract,
} from '../services/contract.service';

class BidActions extends BaseActions {
  bid(id, value, monaPerEth) {
    return async (_, getState) => {
      const account = getState().user.get('account');
      const chainId = getState().global.get('chainId');
      const network = getEnabledNetworkByChainId(chainId);
      const auctionContractAddress = config.AUCTION_CONTRACT_ADDRESS[network.alias];
      const contract = await getContract(auctionContractAddress);
      const weiValue = convertToWei(value);

      const monaContractAddress = await getMonaContractAddressByChainId(chainId);
      const monaContract = await getMonaTokenContract(monaContractAddress);
      const allowedValue = await monaContract.methods
        .allowance(account, auctionContractAddress)
        .call({ from: account });
      const jsAllowedValue = parseFloat(ethersUtils.formatEther(allowedValue));
      if (jsAllowedValue < 10000000000) {
        const listener = monaContract.methods
          .approve(auctionContractAddress, convertToWei(20000000000))
          .send({ from: account });
        const promise = new Promise((resolve, reject) => {
          listener.on('error', (error) => reject(error));
          listener.on('confirmation', (transactionHash) => resolve(transactionHash));
        });
        return {
          promise,
          unsubscribe: () => {
            listener.off('error');
            listener.off('transactionHash');
          },
        };
      }
      const listener = contract.methods.placeBid(id, weiValue).send({ from: account });
      const promise = new Promise((resolve, reject) => {
        listener.on('error', (error) => reject(error));
        listener.on('transactionHash', (transactionHash) => resolve(transactionHash));
      });
      return {
        promise,
        unsubscribe: () => {
          listener.off('error');
          listener.off('transactionHash');
        },
      };
    };
  }

  getAllowanceForAcution() {
    return async (_, getState) => {
      const account = getState().user.get('account');
      const chainId = getState().global.get('chainId');
      const network = getEnabledNetworkByChainId(chainId);
      const auctionContractAddress = config.AUCTION_CONTRACT_ADDRESS[network.alias];
      const monaContractAddress = await getMonaContractAddressByChainId(chainId);
      const monaContract = await getMonaTokenContract(monaContractAddress);
      const allowedValue = await monaContract.methods
        .allowance(account, auctionContractAddress)
        .call({ from: account });
      return allowedValue;
    };
  }

  getApprovedInMona() {
    return async (_, getState) => {
      const account = getState().user.get('account');
      const chainId = getState().global.get('chainId');
      const marketplaceContract = await getMarketplaceContractAddressByChainId(chainId);
      const monaContractAddress = await getMonaContractAddressByChainId(chainId);
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
      const account = getState().user.get('account');
      const chainId = getState().global.get('chainId');
      const secondaryMarketplaceAddress = await getSecondaryMarketplaceAddressByChainId(chainId);
      const monaContractAddress = await getMonaContractAddressByChainId(chainId);
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
      const account = getState().user.get('account');
      const chainId = getState().global.get('chainId');
      const secondaryMarketplaceAddress = await getSecondaryMarketplaceAddressByChainId(chainId);
      const tokenContract = await getERC721Contract(tokenAddress);

      const approved = await tokenContract.methods
        .isApproved(tokenId, secondaryMarketplaceAddress)
        .call({ from: account });

      return approved;
    };
  }

  approveSecondaryNft(tokenAddress, tokenId) {
    return async (_, getState) => {
      const account = getState().user.get('account');
      const chainId = getState().global.get('chainId');
      const secondaryMarketplaceAddress = await getSecondaryMarketplaceAddressByChainId(chainId);
      const tokenContract = await getERC721Contract(tokenAddress);

      const res = await tokenContract.methods
        .setApprovalForAll(secondaryMarketplaceAddress, true)
        .send({ from: account });

      return res;
    };
  }

  addSecondaryMarketplaceProduct(tokenAddress, tokenId, value, buyOrSell) {
    return async (_, getState) => {
      const account = getState().user.get('account');
      const chainId = getState().global.get('chainId');
      const address = await getMonaContractAddressByChainId(chainId);
      const secondaryMarketplaceAddress = await getSecondaryMarketplaceAddressByChainId(chainId);
      const monaContract = await getMonaTokenContract(address);

      // const allowedValue = await monaContract.methods
      //   .allowance(account, secondaryMarketplaceAddress)
      //   .call({ from: account });
      // const jsAllowedValue = parseFloat(ethersUtils.formatEther(allowedValue));
      // if (jsAllowedValue < 10000000000) {
      //   await monaContract.methods
      //     .approve(secondaryMarketplaceAddress, convertToWei(20000000000))
      //     .send({ from: account });
      // }

      const secondaryMarketplaceContract = await getSecondaryMarketplaceContract(chainId);
      const res = await secondaryMarketplaceContract.methods
        .addOrder(
          tokenAddress,
          constants.AddressZero,
          buyOrSell,
          0,
          [tokenId],
          ethersUtils.parseEther(`${parseFloat(value).toFixed(18)}`),
          Date.now() + 157800000,
          10,
          100,
          constants.AddressZero,
        )
        .send({ from: account, value: 0 });

      return res;
    };
  }

  updateSecondaryMarketplaceOrder(tokenAddress, orderIndex, tokenIds, price) {
    return async (_, getState) => {
      const account = getState().user.get('account');
      const chainId = getState().global.get('chainId');
      const address = await getMonaContractAddressByChainId(chainId);
      const secondaryMarketplaceAddress = await getSecondaryMarketplaceAddressByChainId(chainId);
      const tokenContract = await getERC721Contract(tokenAddress);
      // const approved = await tokenContract.methods
      //   .isApproved(tokenIds[0], secondaryMarketplaceAddress)
      //   .call({ from: account });

      // if (!approved) {
      //   await tokenContract.methods.setApprovalForAll(secondaryMarketplaceAddress, true).send({
      //     from: account,
      //   });
      // }

      const secondaryMarketplaceContract = await getSecondaryMarketplaceContract(chainId);
      const res = await secondaryMarketplaceContract.methods
        .updateOrder(
          tokenAddress,
          orderIndex,
          constants.AddressZero,
          tokenIds,
          ethersUtils.parseEther(`${parseFloat(price).toFixed(18)}`),
          Date.now() + 157800000,
          10,
          100,
          constants.AddressZero,
        )
        .send({ from: account, value: 0 });

      return res;
    };
  }

  delistSecondaryNft(tokenAddress, orderId) {
    return async (_, getState) => {
      const account = getState().user.get('account');
      const chainId = getState().global.get('chainId');
      const secondaryMarketplaceContract = await getSecondaryMarketplaceContract(chainId);

      const res = await secondaryMarketplaceContract.methods
        .disableOrder(tokenAddress, orderId, account)
        .send({ from: account });

      return res;
    };
  }

  secondaryBuyNow(id, orderId, tokenAddress, value, buyOrSell = false) {
    return async (_, getState) => {
      const account = getState().user.get('account');
      const chainId = getState().global.get('chainId');
      const address = await getMonaContractAddressByChainId(chainId);
      const secondaryMarketplaceAddress = await getSecondaryMarketplaceAddressByChainId(chainId);
      const tokenContract = await getERC721Contract(tokenAddress);
      if (!buyOrSell) {
        const monaContract = await getMonaTokenContract(address);

        const allowedValue = await monaContract.methods
          .allowance(account, secondaryMarketplaceAddress)
          .call({ from: account });
        const jsAllowedValue = parseFloat(ethersUtils.formatEther(allowedValue));
        if (jsAllowedValue < 10000000000) {
          await monaContract.methods
            .approve(secondaryMarketplaceAddress, convertToWei(20000000000))
            .send({ from: account });
        }
      }

      const approved = await tokenContract.methods
        .isApprovedForAll(account, secondaryMarketplaceAddress)
        .call({ from: account });

      if (!approved) {
        await tokenContract.methods.setApprovalForAll(secondaryMarketplaceAddress, true).send({
          from: account,
        });
      }

      const secondaryMarketplaceContract = await getSecondaryMarketplaceContract(chainId);

      const res = await secondaryMarketplaceContract.methods
        .executeOrders(
          [tokenAddress],
          [orderId],
          [[id]],
          buyOrSell
            ? ethersUtils.parseEther(`${parseFloat(value).toFixed(18)}`)
            : ethersUtils.parseEther(`-${parseFloat(value).toFixed(18)}`),
          100,
          constants.AddressZero,
        )
        .send({
          from: account,
          value: 0,
        });

      return res;
    };
  }

  buyNow(id, value, isMona) {
    return async (_, getState) => {
      const account = getState().user.get('account');
      const chainId = getState().global.get('chainId');
      const marketplaceContract = await getMarketplaceContractAddressByChainId(chainId);
      const contract = await getMarketplaceContract(chainId);
      if (isMona) {
        const monaContractAddress = await getMonaContractAddressByChainId(chainId);
        const monaContract = await getMonaTokenContract(monaContractAddress);
        const allowedValue = await monaContract.methods
          .allowance(account, marketplaceContract)
          .call({ from: account });
        const jsAllowedValue = parseFloat(ethersUtils.formatEther(allowedValue));
        if (jsAllowedValue < 10000000000) {
          const listener = monaContract.methods
            .approve(marketplaceContract, convertToWei(20000000000))
            .send({ from: account });
          const promise = new Promise((resolve, reject) => {
            listener.on('error', (error) => reject(error));
            listener.on('confirmation', (transactionHash) => resolve(transactionHash));
          });
          return {
            promise,
            unsubscribe: () => {
              listener.off('error');
              listener.off('transactionHash');
            },
          };
        }
      }
      const listener = contract.methods.buyOffer(id).send({ from: account });
      const promise = new Promise((resolve, reject) => {
        listener.on('error', (error) => reject(error));
        listener.on('confirmation', (transactionHash) => resolve(transactionHash));
      });
      return {
        promise,
        unsubscribe: () => {
          listener.off('error');
          listener.off('transactionHash');
        },
      };
    };
  }

  withdraw(id) {
    return async (_, getState) => {
      const account = getState().user.get('account');
      const auctionContractAddress = getState().global.get('auctionContractAddress');
      const contract = await getContract(auctionContractAddress);
      const listener = contract.methods.withdrawBid(id).send({ from: account });
      const promise = new Promise((resolve, reject) => {
        listener.on('error', (error) => reject(error));
        listener.on('transactionHash', (transactionHash) => resolve(transactionHash));
      });

      return {
        promise,
        unsubscribe: () => {
          listener.off('error');
          listener.off('transactionHash');
        },
      };
    };
  }
}

export default new BidActions(auctionReducer);
