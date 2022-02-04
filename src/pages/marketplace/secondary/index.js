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

const Secondary = () => {
  const [nfts, setNfts] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [secondFilter, setSecondFilter] = useState();
  const [listedOrders, setListedOrders] = useState([]);
  const account = useSelector(getAccount);
  const chainId = useSelector(getChainId);

  useEffect(() => {
    const fetchNfts = async () => {
      setLoading(true);
      const network = getEnabledNetworkByChainId(chainId);
      const { nfts } = await getAllNFTs(config.NIX_URL[network.alias]);
      const { orders: offs } = await getSecondaryOrders(
        config.NIX_URL[network.alias]
      );
      const { orders } = await getSellingNfts(config.NIX_URL[network.alias]);

      const nftData = [];
      const allUsers = await digitalaxApi.getAllUsersName();

      for (let i = 0; i < nfts.length; i += 1) {
        const nft = nfts[i];
        const { token } = await getNFTById(
          `${nft?.token?.id}_${nft?.tokenId}`,
          config.EIP721_URL[network.alias]
        );
        const { orders } = await getSecondaryOrderByContractTokenAndBuyorsell(
          config.NIX_URL[network.alias],
          nft?.token?.id,
          [nft?.tokenId],
          "Buy"
        );
        const attributes = (JSON.parse(token?.metadata) || {}).attributes;
        const designer = attributes.find(
          (attribute) => attribute.trait_type === "Designer"
        )?.value;
        const designerData =
          (await digitalaxApi.getDesignerById(
            designer === "Kodomodachi" ? "Mirth" : designer
          )) || [];
        const seller = allUsers.find(
          (user) => user.wallet?.toLowerCase() === token?.owner.id
        );

        nftData.push({
          ...nft,
          nftData: {
            ...token,
            designer: {
              name: designerData[0]?.designerId,
              image: designerData[0]?.image_url,
            },
          },
          user: seller ?? {},
          orders: filterOrders(orders),
        });
      }

      setNfts(nftData);
      setOffers(filterOrders(offs));
      setListedOrders(filterOrders(orders));
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
                offers={nft.orders}
                user={nft.user}
                nftData={nft.nftData}
                order={getOrderForNFT(nft)}
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
