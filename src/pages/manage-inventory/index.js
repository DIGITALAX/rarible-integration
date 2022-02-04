import React, { useState, useEffect } from "react";
import SecondaryImageCard from "@components/secondary-image-card";
import PixelLoader from "@components/pixel-loader";
import HeroSection from "@components/hero-section";
import {
  getAllNFTs,
  getAllNFTsByOwner,
  getDigitalaxMarketplaceV2Offers,
  getSecondaryOrderByContractTokenAndBuyorsell,
  getSecondaryOrderByOwner,
  getSecondaryOrders,
  getSellingNfts,
  getNFTById,
} from "@services/api/apiService";
import { useSelector } from "react-redux";
import { getAccount } from "@selectors/user.selectors";
import { getEnabledNetworkByChainId } from "@services/network.service";
import { getChainId } from "@selectors/global.selectors";
import config from "@utils/config";
import digitalaxApi from "@services/api/espa/api.service";
import styles from "./styles.module.scss";
import SecondaryInfoCard from "@components/secondary-info-card";
import { filterOrders } from "@utils/helpers";

const ManageInventory = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("");
  const [offers, setOffers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [nfts, setNfts] = useState([]);
  const [secondFilter, setSecondFilter] = useState();
  const chainId = useSelector(getChainId);
  const [ownedOrders, setOwnedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const account = useSelector(getAccount);

  useEffect(() => {
    const fetchNfts = async () => {
      setLoading(true);
      const network = getEnabledNetworkByChainId(chainId);
      const { tokens } = await getAllNFTsByOwner(
        account,
        config.EIP721_URL[network.alias]
      );
      const { orders } = await getSecondaryOrderByOwner(
        config.NIX_URL[network.alias],
        account
      );
      const { orders: offs } = await getSecondaryOrders(
        config.NIX_URL[network.alias]
      );
      const { nfts: all } = await getAllNFTs(config.NIX_URL[network.alias]);
      const { orders: allOrds } = await getSellingNfts(
        config.NIX_URL[network.alias]
      );
      const { digitalaxMarketplaceV2Offers } =
        await getDigitalaxMarketplaceV2Offers(chainId);
      const allUsers = await digitalaxApi.getAllUsersName();

      const nftData = [];

      for (let i = 0; i < all.length; i += 1) {
        const nft = all[i];
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
          (user) => user?.wallet?.toLowerCase() === token?.owner.id
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
          user: seller ? seller : {},
          orders: filterOrders(orders),
        });
      }
      const ownedOffers = offs.filter(
        (offer) => offer.maker === account.toLowerCase()
      );

      setProducts([
        ...tokens.filter((token) =>
          digitalaxMarketplaceV2Offers.find((offer) =>
            offer.garmentCollection?.garments?.find(
              (garment) =>
                garment.owner === token.owner.id && garment.id === token.tokenID
            )
          )
        ),
        // ...tokens,
        ...nftData.filter((nft) => {
          return ownedOffers.find((offer) => offer.tokenIds[0] === nft.tokenId);
        }),
      ]);
      setOffers(filterOrders(offs));
      setNfts(nftData);
      setOwnedOrders(filterOrders(orders));
      setAllOrders(filterOrders(allOrds));
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

  const getPrice = (product) => {
    const info = product.id.split("_");
    const currentOrder = ownedOrders.find((order) => {
      return order?.token.id === info[0] && order?.tokenIds.includes(info[1]);
    });

    return currentOrder?.price || null;
  };

  const getOrderForNFT = (nft) => {
    const order = allOrders?.find((order) => {
      return (
        order.token.id === nft.token.id && order.tokenIds[0] === nft.tokenId
      );
    });

    return order;
  };

  const sortNfts = () => {
    switch (secondFilter) {
      case "1":
        return products.filter((nft) => {
          return !!getPrice(nft);
        });
      case "2":
        return !!products.filter((product) => {
          return !!offers.filter(
            (offer) => product.tokenID === offer.tokenIds[0]
          ).length;
        }).length;
      case "3":
        const ownedOffers = offers.filter(
          (offer) => offer.maker === account.toLowerCase()
        );
        return nfts.filter((nft) => {
          return ownedOffers.find((offer) => offer.tokenIds[0] === nft.tokenId);
        });
      default:
        return products;
    }
  };

  const filterNfts = (filteredNfts) => {
    return filteredNfts.filter((nft) =>
      nft?.name.toLowerCase().includes(filter.toLowerCase())
    );
  };

  const sortedNfts = sortNfts() || [];
  const filteredProducts = filterNfts(sortedNfts);

  return (
    <div className={styles.wrapper}>
      <HeroSection
        title="Manage"
        subTitle="WEB3 FASHION INVENTORY"
        filter={filter}
        setFilter={(v) => setFilter(v)}
        // setSortBy={(v) => setSortBy(v)}
        secondFilter={secondFilter}
        secondFilterChange={(value) => {
          setSecondFilter(value);
        }}
      />
      <div className="container mx-auto">
        <div className={styles.productsWrapper}>
          {filteredProducts.map((product) => {
            if (secondFilter === "3" || product.nftData) {
              return (
                <SecondaryInfoCard
                  product={product}
                  offers={product.orders || []}
                  user={product.user || {}}
                  nftData={product.nftData}
                  order={getOrderForNFT(product)}
                  key={product.id}
                  showCollectionName
                />
              );
            } else {
              return (
                <SecondaryImageCard
                  key={product.id}
                  product={product}
                  price={getPrice(product)}
                  showCollectionName
                />
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default ManageInventory;
