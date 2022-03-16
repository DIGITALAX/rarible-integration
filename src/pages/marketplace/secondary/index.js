import React, { useState, useEffect } from "react";
import HeroSection from "@components/hero-section";
import PixelLoader from "@components/pixel-loader";
import SecondaryInfoCard from "@components/secondary-info-card";
import {
  getSellingNfts,
  getAllNFTs,
  getSecondaryOrders,
  getNFTById,
  getSecondaryOrderByContractTokenAndBuyorsell,
} from "@services/api/apiService";
import { useSelector } from "react-redux";
import { getChainId } from "@selectors/global.selectors";
import { getEnabledNetworkByChainId } from "@services/network.service";
import config from "@utils/config";
import digitalaxApi from "@services/api/espa/api.service";
import styles from "./styles.module.scss";
import { getAccount } from "@selectors/user.selectors";
import { filterProducts, filterOrders } from "@utils/helpers";
import {
  getItemByIds,
  getItemsByCollection,
  getSellOrders,
} from "@services/api/rarible.service";
import { getRaribleNftDataFromMeta } from "@utils/rarible";

const Secondary = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [secondFilter, setSecondFilter] = useState();
  const [listedOrders, setListedOrders] = useState([]);
  const chainId = useSelector(getChainId);

  useEffect(() => {
    const fetchNfts = async () => {
      setLoading(true);
      const network = getEnabledNetworkByChainId(chainId);
      let nftData = [];
      try {
        const { orders } = await getSellOrders(
          config.MARKETPLACE_NFT_ADDRESS[network.alias],
          network.alias
        );
        const items = await getItemByIds(
          orders.map(
            (order) =>
              `${order.make.assetType.contract}:${order.make.assetType.tokenId}`
          ),
          network.alias
        );
        const designers = await digitalaxApi.getAllDesigners();
        const allUsers = await digitalaxApi.getAllUsersName();
        for (let i = 0; i < items.length; i += 1) {
          const attributes = items[i].meta.attributes;
          const desId = attributes.find(
            (attribute) => attribute.key === "Designer"
          )?.value;

          const designerData = designers.data.find(
            (designer) =>
              designer.designerId ===
              (desId === "Kodomodachi" ? "Mirth" : desId)
          );
          const order = orders.find(
            (o) =>
              o.make.assetType.contract === items[i].contract &&
              o.make.assetType.tokenId === items[i].tokenId
          );
          const seller = allUsers.find(
            (user) => user.wallet?.toLowerCase() === order.maker
          );

          nftData.push({
            ...items[i],
            price: order.makePrice,
            nftData: {
              ...getRaribleNftDataFromMeta(items[i].meta),
              designer: {
                name: designerData?.designerId,
                image: designerData?.image_url,
              },
            },
            seller,
          });
        }
      } catch (e) {
        console.log({ e });
      }
      setNfts(nftData);
      setLoading(false);
    };

    fetchNfts();
  }, []);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loadingWrapper}>
          <PixelLoader title={"loading..."} />
        </div>
      </div>
    );
  }

  const getOrderForNFT = (nft) => {
    const order = listedOrders?.find((order) => {
      return (
        order.token.id === nft.token.id && order.tokenIds[0] === nft.tokenId
      );
    });

    return order;
  };

  const filteredNfts = filterProducts(nfts, filter, sortBy) || [];

  return (
    <div className={styles.wrapper}>
      <HeroSection
        title="SECONDARY"
        subTitle="MARKETPLACE"
        filter={filter}
        setFilter={(v) => setFilter(v)}
        setSortBy={(v) => setSortBy(v)}
      />
      <div className="container mx-auto">
        <div className={styles.productsWrapper}>
          {filteredNfts?.map((nft) => {
            return (
              <SecondaryInfoCard
                product={nft}
                nftData={nft.nftData}
                key={nft.id}
                showCollectionName
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Secondary;
