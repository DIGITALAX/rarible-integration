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
