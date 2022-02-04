import { getAPIUrlByChainId, getEnabledNetworkByChainId } from '@services/network.service';
import { request } from 'graphql-request';
import {
  COLLECTIONS,
  COLLECTIONSV2,
  COLLECTION_GROUPS,
  COLLECTION_GROUP_BY_ID,
  DIGITALAX_GARMENT_AUCTIONS,
  DIGITALAX_GARMENT_COLLECTIONS,
  DIGITALAX_GARMENT_NFT_V2_GLOBAL_STATS,
  DIGITALAX_GARMENT_PURCHASE_HISTORIES,
  DIGITALAX_GARMENT_V2S,
  DIGITALAX_GARMENT_V2_PURCHASE_HISTORIES,
  DIGITALAX_MARKETPLACE_OFFER,
  DIGITALAX_MARKETPLACE_OFFERS,
  DIGITALAX_MARKETPLACE_PURCHASE_HISTORIES,
  DIGITALAX_MARKETPLACE_V2_OFFER,
  DIGITALAX_MARKETPLACE_V2_OFFERS,
  DIGITALAX_MARKETPLACE_V2_PURCHASE_HISTORIES,
  GARMENTV2_BY_AUCTION_ID,
  GARMENTV2_BY_COLLECTION_ID,
  GARMENTV2_BY_COLLECTION_IDS,
  GARMENT_BY_AUCTION_ID,
  GARMENT_BY_COLLECTION_ID,
  // For Profile Page
  DIGITALAX_GARMENTS_BY_OWNER,
  DIGITALAX_GARMENTS,
  DIGITALAX_GARMENT_V2S_BY_OWNER,
  DIGITALAX_SUBSCRIPTIONS_BY_OWNER,
  DIGITALAX_SUBSCRIPTION_COLLECTORS_BY_OWNER,
  DIGITALAX_NFT_STAKERS_BY_ADDRESS,
  DIGITALAX_GARMENT_STAKED_TOKENS_BY_ADDRESS,
  DIGITALAX_GENESIS_NFTS_BY_ADDRESS,
  DIGITALAX_GENESIS_NFTS,
  DIGITALAX_GENESIS_STAKED_TOKENS_BY_ADDRESS,
  DIGITALAX_GARMENT_V2_COLLECTION_BY_GARMENT_ID,
  PODE_NFT_V2S_BY_ADDRESS,
  PODE_NFT_V2_STAKERS_BY_ADDRESS,
  DIGITALAX_COLLETOR_V2_BY_OWNER,
  GDN_MEMBERSHIP_NFTS_BY_OWNER,
  DIGITALAX_LOOK_NFTS_BY_OWNER,
  DIGITALAX_GARMENT_V2_COLLECTIONS_BY_GARMENT_IDS,
  DIGITALAX_LOOK_GOLDEN_TICKETS_BY_OWNER,
  DIGITALAX_NFT_STAKERS_BY_GARMENTS,
  GUILD_WHITELISTED_NFT_STAKERS_BY_GARMENTS,
  GUILD_WHITELISTED_NFT_STAKERS_BY_STAKER,
  PATRONS_MARKETPLACE_OFFERS,
  GET_ALL_NFTS_BY_OWNER,
  GET_NFT_BY_ID,
  IS_NFT_LISTED,
  GET_SELLING_NFTS,
  GET_SECONDARY_ORDER_BY_CONTRACT_AND_TOKEN_ID,
  GET_SECONDARY_NFT_INFO,
  GET_NFT_BY_CONTRACT_AND_TOKEN_ID,
  GET_SECODARY_ORDERS_BY_OWNER,
  GET_TRADES_BY_ORDER_ID,
  GET_ALL_NFTS,
  GET_ALL_NFTS_BY_IDS,
  GET_SECONDARY_ORDER_BY_CONTRACT_TOKEN_AND_BUY_OR_SELL,
  GET_SECONDARY_ORDERS,
  GET_DIGITALAX_COLLECTION_GROUPS_BY_GARMENT,
  GET_ALL_TRADES_BY_TOKEN_AND_TOKENID,
} from './gql.apiService';
import config from '../../utils/config';

const apiRequest = (chainId, gql, params) => request(config.API_URLS['matic'], gql, params);

export const getCollections = async (chainId) => apiRequest(chainId, COLLECTIONS);

export const getCollectionsV2 = async (chainId) => apiRequest(chainId, COLLECTIONSV2);

export const getCollectionGroups = async (chainId) => apiRequest(chainId, COLLECTION_GROUPS);

export const getDigitalaxGarmentCollections = async (chainId) =>
  apiRequest(chainId, DIGITALAX_GARMENT_COLLECTIONS);

export const getCollectionGroupById = async (chainId, id) =>
  apiRequest(chainId, COLLECTION_GROUP_BY_ID, { id });

export const getGarmentV2ByCollectionId = async (chainId, id) =>
  apiRequest(chainId, GARMENTV2_BY_COLLECTION_ID, { id });

export const getGarmentByCollectionId = async (chainId, id) =>
  apiRequest(chainId, GARMENT_BY_COLLECTION_ID, { id });

export const getCollectionV2ByIds = async (chainId, ids) =>
  apiRequest(chainId, GARMENTV2_BY_COLLECTION_IDS, { ids });

export const getGarmentV2ByAuctionId = async (chainId, id) =>
  apiRequest(chainId, GARMENTV2_BY_AUCTION_ID, { id });

export const getDigitalaxMarketplaceOffers = async (chainId) =>
  apiRequest(chainId, DIGITALAX_MARKETPLACE_OFFERS);

export const getDigitalaxMarketplaceV2Offer = async (chainId, garmentCollection) =>
  apiRequest(chainId, DIGITALAX_MARKETPLACE_V2_OFFER, { garmentCollection });

export const getDigitalaxMarketplaceOffer = async (chainId, garmentCollection) =>
  apiRequest(chainId, DIGITALAX_MARKETPLACE_OFFER, { garmentCollection });

export const getDigitalaxMarketplaceV2Offers = async (chainId) =>
  apiRequest(chainId, DIGITALAX_MARKETPLACE_V2_OFFERS);

export const getDigitalaxMarketplaceV2PurchaseHistories = async (chainId, ids) =>
  apiRequest(chainId, DIGITALAX_MARKETPLACE_V2_PURCHASE_HISTORIES, { ids });

export const getDigitalaxMarketplacePurchaseHistories = async (chainId, ids) =>
  apiRequest(chainId, DIGITALAX_MARKETPLACE_PURCHASE_HISTORIES, { ids });

export const getDigitalaxGarmentV2PurchaseHistories = async (chainId, id) =>
  apiRequest(chainId, DIGITALAX_GARMENT_V2_PURCHASE_HISTORIES, { id });

export const getDigitalaxGarmentPurchaseHistories = async (chainId, id) =>
  apiRequest(chainId, DIGITALAX_GARMENT_PURCHASE_HISTORIES, { id });

export const getDigitalaxGarmentNftV2GlobalStats = async (chainId) =>
  apiRequest(chainId, DIGITALAX_GARMENT_NFT_V2_GLOBAL_STATS);

export const getDigitalaxGarmentAuctions = async (chainId) =>
  apiRequest(chainId, DIGITALAX_GARMENT_AUCTIONS);

export const getGarmentByAuctionId = async (chainId, id) =>
  apiRequest(chainId, GARMENT_BY_AUCTION_ID, { id });

export const getDigitalaxGarmentV2s = async (chainId, ids) =>
  apiRequest(chainId, DIGITALAX_GARMENT_V2S, { ids });

// For Profile Page
export const getDigitalaxGarmentsByOwner = async (chainId, owner, first = 1000, lastID = '') =>
  apiRequest(chainId, DIGITALAX_GARMENTS_BY_OWNER, { owner, first, lastID });

export const getDigitalaxGarments = async (chainId, ids, first = 1000, lastID = '') =>
  apiRequest(chainId, DIGITALAX_GARMENTS, { ids, first, lastID });

export const getDigitalaxGarmentV2sByOwner = async (chainId, owner, first = 1000, lastID = '') =>
  apiRequest(chainId, DIGITALAX_GARMENT_V2S_BY_OWNER, { owner, first, lastID });

export const getDigitalaxSubscriptionsByOwner = async (chainId, owner, first = 1000, lastID = '') =>
  apiRequest(chainId, DIGITALAX_SUBSCRIPTIONS_BY_OWNER, { owner, first, lastID });

export const getDigitalaxSubscriptionCollectorsByOwner = async (
  chainId,
  owner,
  first = 1000,
  lastID = '',
) => apiRequest(chainId, DIGITALAX_SUBSCRIPTION_COLLECTORS_BY_OWNER, { owner, first, lastID });

export const getDigitalaxNFTStakersByOwner = async (chainId, staker, first = 1000, lastID = '') =>
  apiRequest(chainId, DIGITALAX_NFT_STAKERS_BY_ADDRESS, { staker, first, lastID });

export const getDigitalaxGarmentStakedTokensByOwner = async (
  chainId,
  staker,
  first = 1000,
  lastID = '',
) => apiRequest(chainId, DIGITALAX_GARMENT_STAKED_TOKENS_BY_ADDRESS, { staker, first, lastID });

export const getDigitalaxGenesisNFTsByOwner = async (chainId, owner, first = 1000, lastID = '') =>
  apiRequest(chainId, DIGITALAX_GENESIS_NFTS_BY_ADDRESS, { owner, first, lastID });

export const getDigitalaxGenesisNFTs = async (chainId, ids, first = 1000, lastID = '') =>
  apiRequest(chainId, DIGITALAX_GENESIS_NFTS, { ids, first, lastID });

export const getDigitalaxGenesisStakedTokensByOwner = async (
  chainId,
  staker,
  first = 1000,
  lastID = '',
) => apiRequest(chainId, DIGITALAX_GENESIS_STAKED_TOKENS_BY_ADDRESS, { staker, first, lastID });

export const getCollectionV2ByGarmentId = async (chainId, garmentID) =>
  apiRequest(chainId, DIGITALAX_GARMENT_V2_COLLECTION_BY_GARMENT_ID, { garmentIDs: [garmentID] });

export const getPodeNFTV2sByOwner = async (chainId, owner, first = 1000, lastID = '') =>
  apiRequest(chainId, PODE_NFT_V2S_BY_ADDRESS, { owner, first, lastID });

export const getPodeNFTV2StakersByStaker = async (chainId, staker, first = 1000, lastID = '') =>
  apiRequest(chainId, PODE_NFT_V2_STAKERS_BY_ADDRESS, { staker, first, lastID });

export const getDigitalaxCollectorV2ByOwner = async (chainId, owner) =>
  apiRequest(chainId, DIGITALAX_COLLETOR_V2_BY_OWNER, { owner });

export const getGDNMembershipNFTsByOwner = async (chainId, owner, first = 1000, lastID = '') =>
  apiRequest(chainId, GDN_MEMBERSHIP_NFTS_BY_OWNER, { owner, first, lastID });

export const getDigitalaxLookNFTsByOwner = async (chainId, owner, first = 1000, lastID = '') =>
  apiRequest(chainId, DIGITALAX_LOOK_NFTS_BY_OWNER, { owner, first, lastID });

export const getDigitalaxGarmentV2CollectionsByGarmentIDs = async (
  chainId,
  garmentIDs,
  first = 1000,
  lastID = '',
) =>
  apiRequest(chainId, DIGITALAX_GARMENT_V2_COLLECTIONS_BY_GARMENT_IDS, {
    garmentIDs,
    first,
    lastID,
  });

export const getDigitalaxLookGoldenTicketsByOwner = async (
  chainId,
  owner,
  first = 1000,
  lastID = '',
) => apiRequest(chainId, DIGITALAX_LOOK_GOLDEN_TICKETS_BY_OWNER, { owner, first, lastID });

export const getDigitalaxNFTStakersByGarments = async (
  chainId,
  garmentIDs,
  first = 1000,
  lastID = '',
) => apiRequest(chainId, DIGITALAX_NFT_STAKERS_BY_GARMENTS, { garmentIDs, first, lastID });

export  const getPatronMarketplaceOffers = async (chainId, first=1000, lastID='') =>
  apiRequest(chainId, PATRONS_MARKETPLACE_OFFERS, { first, lastID  })

export const getGuildWhitelistedNFTStakersByGarments = async (
  chainId,
  garmentIDs,
  first = 1000,
  lastID = '',
) =>
  request(config.DLTA_API_URL, GUILD_WHITELISTED_NFT_STAKERS_BY_GARMENTS, {
    garmentIDs,
    first,
    lastID,
  });

export const getGuildWhitelistedNFTStakersByStaker = async (
  chainId,
  staker,
  first = 1000,
  lastID = '',
) =>
  request(config.DLTA_API_URL, GUILD_WHITELISTED_NFT_STAKERS_BY_STAKER, { staker, first, lastID });

export const getAllNFTsByOwner = async (owner, url) =>
  request(url, GET_ALL_NFTS_BY_OWNER, { owner });

export const getAllTradesByTokensAndTokenIds = async (url) =>
  request(url, GET_ALL_TRADES_BY_TOKEN_AND_TOKENID)

export const getAllNFTs = async (url) => request(url, GET_ALL_NFTS);

export const getAllNFTsByIds = async (url, ids) => request(url, GET_ALL_NFTS_BY_IDS, { ids });

export const getNFTById = async (id, url) => request(url, GET_NFT_BY_ID, { id });

export const getIsNFTListed = async (url, owner, token, tokenId) =>
  request(url, IS_NFT_LISTED, { owner, token, tokenId });

export const getSellingNfts = async (url) => request(url, GET_SELLING_NFTS);

export const getSecondaryOrderByContractAndTokenId = async (url, contract, tokenIds) =>
  request(url, GET_SECONDARY_ORDER_BY_CONTRACT_AND_TOKEN_ID, { contract, tokenIds });

export const getSecondaryOrderByContractTokenAndBuyorsell = async (
  url,
  contract,
  tokenIds,
  buyOrSell,
) =>
  request(url, GET_SECONDARY_ORDER_BY_CONTRACT_TOKEN_AND_BUY_OR_SELL, {
    contract,
    tokenIds,
    buyOrSell,
  });

export const getSecondaryOrders = async (url) => request(url, GET_SECONDARY_ORDERS);

export const getNFTByContractAndTokenId = async (url, contract, tokenId) =>
  request(url, GET_NFT_BY_CONTRACT_AND_TOKEN_ID, { contract, tokenId });

export const getSecondaryNftInfo = async (url, id) => request(url, GET_SECONDARY_NFT_INFO, { id });

export const getSecondaryOrderByOwner = async (url, owner) =>
  request(url, GET_SECODARY_ORDERS_BY_OWNER, { owner });

export const getTradesByOrderId = async (url, ids) => request(url, GET_TRADES_BY_ORDER_ID, { ids });

export const getAllDigitalaxCollectionGroupsByGarment = async (url, garment) =>
  request(url, GET_DIGITALAX_COLLECTION_GROUPS_BY_GARMENT, { garment });
