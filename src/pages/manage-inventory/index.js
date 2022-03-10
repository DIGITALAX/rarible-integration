import React, { useState, useEffect } from "react";
import SecondaryImageCard from "@components/secondary-image-card";
import PixelLoader from "@components/pixel-loader";
import HeroSection from "@components/hero-section";
import { useSelector } from "react-redux";
import { getAccount } from "@selectors/user.selectors";
import { getEnabledNetworkByChainId } from "@services/network.service";
import { getChainId } from "@selectors/global.selectors";
import digitalaxApi from "@services/api/espa/api.service";
import styles from "./styles.module.scss";
import SecondaryInfoCard from "@components/secondary-info-card";
import { filterOrders } from "@utils/helpers";
import {
  getAllItemsByOwner,
  getListedOrdersByOwner,
} from "@services/api/rarible.service";
import { getRaribleNftDataFromMeta } from "@utils/rarible";

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

      const nfts = await getAllItemsByOwner(account);

      const allUsers = await digitalaxApi.getAllUsersName();

      // const listedOrders = await getListedOrdersByOwner(account);

      const polygonNfts = nfts.items.filter(
        (nft) => nft.blockchain === "POLYGON"
      );
      const nftData = [];

      for (let i = 0; i < polygonNfts.length; i += 1) {
        const nft = polygonNfts[i];
        const designerAttribute = nft.meta.attributes.find(
          (attribute) => attribute.key === "Designer"
        );
        if (!designerAttribute) continue;
        const designerData =
          (await digitalaxApi.getDesignerById(
            designerAttribute.value === "Kodomodachi"
              ? "Mirth"
              : designerAttribute.value
          )) || [];
        // const order = listedOrders.find(order => order.)
        const seller = allUsers.find(
          (user) =>
            user?.wallet?.toLowerCase() ===
            nft?.creators[0].account.split(":")[1]
        );
        nftData.push({
          ...nft,
          nftData: getRaribleNftDataFromMeta(nft.meta),
          designer: {
            name: designerData[0]?.designerId,
            image: designerData[0]?.image_url,
          },
          seller,
        });
      }
      setProducts([...nftData]);
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
      // case "1":
      //   return products.filter((nft) => {
      //     return !!getPrice(nft);
      //   });
      // case "2":
      //   return !!products.filter((product) => {
      //     return !!offers.filter(
      //       (offer) => product.tokenID === offer.tokenIds[0]
      //     ).length;
      //   }).length;
      // case "3":
      //   const ownedOffers = offers.filter(
      //     (offer) => offer.maker === account.toLowerCase()
      //   );
      //   return nfts.filter((nft) => {
      //     return ownedOffers.find((offer) => offer.tokenIds[0] === nft.tokenId);
      //   });
      default:
        return products;
    }
  };

  const filterNfts = (filteredNfts) => {
    return filteredNfts.filter((nft) =>
      nft?.meta.name.toLowerCase().includes(filter.toLowerCase())
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
        secondFilter={secondFilter}
        secondFilterChange={(value) => {
          setSecondFilter(value);
        }}
      />
      <div className="container mx-auto">
        <div className={styles.productsWrapper}>
          {filteredProducts.map((product) => {
            if (secondFilter === "3") {
              return (
                <SecondaryInfoCard
                  key={product?.id}
                  product={product}
                  // offers={product.orders || []}
                  // user={product.seller || {}}
                  nftData={product.nftData}
                  // order={getOrderForNFT(product)}
                  // key={product.id}
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
