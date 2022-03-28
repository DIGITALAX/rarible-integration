import React, { useState, useEffect } from "react";
import HeroSection from "@components/hero-section";
import PixelLoader from "@components/pixel-loader";
import SecondaryInfoCard from "@components/secondary-info-card";
import { useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import { getAllDesigners, getChainId } from "@selectors/global.selectors";
import { getEnabledNetworkByChainId } from "@services/network.service";
import config from "@utils/config";
import styles from "./styles.module.scss";
import { filterProducts } from "@utils/helpers";
import { getItemsByCollection } from "@services/api/rarible.service";
import { getRaribleNftDataFromMeta } from "@utils/rarible";
import Container from "@components/container";

const Secondary = () => {
  const [nfts, setNfts] = useState([]);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [offset, setOffset] = useState("");
  const chainId = useSelector(getChainId);
  const network = getEnabledNetworkByChainId(chainId);
  const designers = useSelector(getAllDesigners).toJS();

  const getNftData = (items) => {
    const nftData = [];
    for (let i = 0; i < items.length; i += 1) {
      const attributes = items[i].meta.attributes;
      const desId = attributes.find(
        (attribute) => attribute.key === "Designer"
      )?.value;

      const designerData = designers.find(
        (designer) =>
          designer.designerId === (desId === "Kodomodachi" ? "Mirth" : desId)
      );

      nftData.push({
        ...items[i],
        bidPrice: items[i].bestBidOrder?.takePrice
          ? parseFloat(items[i].bestBidOrder?.takePrice)
          : null,
        price: items[i].bestSellOrder?.makePrice
          ? parseFloat(items[i].bestSellOrder?.makePrice)
          : null,
        nftData: {
          ...getRaribleNftDataFromMeta(items[i].meta),
          designer: {
            name: designerData?.designerId,
            image: designerData?.image_url,
          },
        },
      });
    }

    return nftData;
  };

  const fetchNfts = async () => {
    try {
      const { items, continuation } = await getItemsByCollection(
        config.MARKETPLACE_NFT_ADDRESS[network.alias],
        offset
      );
      const nftData = getNftData(items);
      setOffset(continuation);
      setNfts([...nfts, ...nftData]);
    } catch (e) {
      console.log({ e });
    }
  };

  useEffect(() => {
    if (designers.length && offset === "") {
      fetchNfts();
    }
  }, [designers]);

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
      <Container>
        {filteredNfts.length ? (
          <InfiniteScroll
            dataLength={nfts.length ?? 0}
            next={fetchNfts}
            hasMore={nfts.length === filteredNfts.length ? false : offset}
            loader={
              <div className={styles.loadingWrapper}>
                <PixelLoader title={"loading..."} />
              </div>
            }
          >
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
          </InfiniteScroll>
        ) : (
          <h4>Nothing to show</h4>
        )}
      </Container>
      {/* )} */}
    </div>
  );
};

export default Secondary;
