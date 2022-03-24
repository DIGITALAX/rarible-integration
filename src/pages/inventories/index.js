import React, { useState, useEffect } from "react";
import SecondaryImageCard from "@components/secondary-image-card";
import PixelLoader from "@components/pixel-loader";
import HeroSection from "@components/hero-section";
import { useSelector } from "react-redux";
import { getAccount } from "@selectors/user.selectors";
import digitalaxApi from "@services/api/espa/api.service";
import styles from "./styles.module.scss";
import SecondaryInfoCard from "@components/secondary-info-card";
import {
  getActivitiesByUser,
  getAllItemsByOwner,
  getItemByIds,
  getOrderBidsByMaker,
} from "@services/api/rarible.service";
import { getRaribleNftDataFromMeta } from "@utils/rarible";
import Container from "@components/container";
import { getChainId } from "@selectors/global.selectors";
import { getEnabledNetworkByChainId } from "@services/network.service";

const ManageInventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filter, setFilter] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [allDesigners, setAllDesigners] = useState([]);
  const [secondFilter, setSecondFilter] = useState();
  const [loading, setLoading] = useState(true);
  const account = useSelector(getAccount);
  const chainId = useSelector(getChainId);
  const network = getEnabledNetworkByChainId(chainId);

  const getNftData = (products) => {
    const nftData = [];
    for (let i = 0; i < products.length; i += 1) {
      const nft = products[i];
      const designerAttribute = nft.meta.attributes.find(
        (attribute) => attribute.key === "Designer"
      );
      if (!designerAttribute) continue;
      const designerData = allDesigners.find(
        (designer) =>
          designer.designerId ===
          (designerAttribute.value === "Kodomodachi"
            ? "Mirth"
            : designerAttribute.value)
      );
      const seller = allUsers.find(
        (user) => user?.wallet?.toLowerCase() === nft?.creators[0].account
      );
      nftData.push({
        ...nft,
        price: nft.bestSellOrder?.makePrice,
        nftData: {
          ...getRaribleNftDataFromMeta(nft.meta),
          designer: {
            name: designerData?.designerId,
            image: designerData?.image_url,
          },
        },
        seller,
      });
    }

    return nftData;
  };

  const fetchPreData = async () => {
    setLoading(true);
    const allUsers = await digitalaxApi.getAllUsersName();
    const designers = await digitalaxApi.getAllDesigners();
    setAllDesigners(designers.data);
    setAllUsers(allUsers);
  };

  const fetchNfts = async () => {
    const nfts = await getAllItemsByOwner(account);
    console.log({ nfts });
    const polygonNfts = nfts.items.filter(
      (nft) => nft.blockchain === "POLYGON"
    );
    const nftData = getNftData(polygonNfts);
    setProducts(nftData);
    setFilteredProducts(nftData);
    setLoading(false);
  };

  const fetchGetBids = async () => {
    setLoading(true);
    const { activities } = await getActivitiesByUser(account, "GET_BID");
    setFilteredProducts(
      products.filter((product) =>
        activities.find(
          (activity) =>
            activity.take.type.contract === product.contract &&
            activity.take.type.tokenId === product.tokenId
        )
      )
    );
    setLoading(false);
  };

  const fetchMakeBids = async () => {
    setLoading(true);
    const { activities } = await getActivitiesByUser(account, "MAKE_BID");
    const items = await getItemByIds(
      activities.map(
        (activity) =>
          `${activity.take.type.contract.split(":")[1]}:${
            activity.take.type.tokenId
          }`
      ),
      network.alias
    );
    const nftData = getNftData(items);
    setFilteredProducts(nftData);
    setLoading(false);
  };

  useEffect(() => {
    fetchPreData();
  }, []);

  useEffect(() => {
    if (allUsers.length && allDesigners.length) fetchNfts();
  }, [allUsers, allDesigners]);

  useEffect(() => {
    if (secondFilter === "1") {
      setFilteredProducts(products.filter((nft) => !!nft.price));
    } else if (secondFilter === "2") {
      fetchGetBids();
    } else if (secondFilter === "3") {
      fetchMakeBids();
    } else {
      setFilteredProducts(products);
    }
  }, [secondFilter]);

  const filterNfts = (filteredNfts) => {
    return filteredNfts.filter(
      (nft) =>
        nft?.nftData.name.toLowerCase().includes(filter.toLowerCase()) ||
        nft?.nftData.designer.name.toLowerCase().includes(filter.toLowerCase())
    );
  };

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
      {loading ? (
        <div className={styles.loadingWrapper}>
          <PixelLoader title={"loading..."} />
        </div>
      ) : (
        <Container>
          <div className={styles.productsWrapper}>
            {filterNfts(filteredProducts).map((product) => {
              if (secondFilter === "3") {
                return (
                  <SecondaryInfoCard
                    key={product?.id}
                    product={product}
                    nftData={product.nftData}
                    showCollectionName
                  />
                );
              } else {
                return (
                  <SecondaryImageCard
                    key={product.id}
                    product={product}
                    showCollectionName
                  />
                );
              }
            })}
          </div>
        </Container>
      )}
    </div>
  );
};

export default ManageInventory;
