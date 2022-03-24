import config from "@utils/config";

export const getListedOrdersByOwner = (owner) =>
  window.raribleSdk.apis.order.getSellOrdersByMaker({
    blockchains: ["POLYGON"],
    platform: "RARIBLE",
    maker: `ETHEREUM:${owner}`,
  });

export const getAllItemsByOwner = (owner) =>
  window.raribleSdk.apis.item.getItemsByOwner({
    blockchains: ["POLYGON"],
    owner: `ETHEREUM:${owner}`,
  });

export const getItemById = (id) =>
  window.raribleSdk.apis.item.getItemById({
    itemId: id,
  });

export const getItemByIds = (ids, network) =>
  fetch(`${config.RARIBLE_API_URL[network]}/nft/items/byIds`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ids,
    }),
  })
    .then((res) => res.json())
    .catch((error) => error);

export const getActivitiesByItem = (id, type) =>
  window.raribleSdk.apis.activity.getActivitiesByItem({
    type,
    itemId: `POLYGON:${id}`,
  });

export const getActivitiesByUser = (address, type) =>
  window.raribleSdk.apis.activity.getActivitiesByUser({
    type,
    user: `ETHEREUM:${address}`,
  });

export const getItemsByCollection = (address, continuation = null) =>
  window.raribleSdk.apis.item.getItemsByCollection({
    collection: `POLYGON:${address}`,
    continuation,
    size: 10,
  });

export const getOrderBidsByItem = (itemId) =>
  window.raribleSdk.apis.order.getOrderBidsByItem({
    itemId,
    status: "ACTIVE",
  });

export const getOrderBidsByMaker = (address, network) =>
  fetch(
    `${config.RARIBLE_API_URL[network]}/order/orders/bids/byMakerAndByStatus?maker=${address}&status=ACTIVE`
  )
    .then((res) => res.json())
    .catch((error) => error);

export const getSellOrders = (address, network) =>
  fetch(
    `${config.RARIBLE_API_URL[network]}/order/orders/sell/byCollectionAndByStatus?collection=${address}`
  )
    .then((res) => res.json())
    .catch((error) => error);
