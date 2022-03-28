import React, { useEffect, useState } from "react";
import { Router } from "next/router";
import Head from "next/head";
import {
  getCollectionGroups,
  getDigitalaxMarketplaceV3Offers,
} from "@services/api/apiService";
import PixelLoader from "@components/pixel-loader";
import styles from "./styles.module.scss";
import { useSelector } from "react-redux";
import { getAllDesigners, getChainId } from "@selectors/global.selectors";
import Container from "@components/container";
import Link from "next/link";
import ProductInfoCard from "@components/product-info-card";
import InfiniteScroll from "react-infinite-scroll-component";
import Filters from "@components/filters";
import { filterProducts } from "@utils/helpers";
import digitalaxApi from "@services/api/espa/api.service";
import { getEnabledNetworkByChainId } from "@services/network.service";
import config from "@utils/config";
import SecondaryInfoCard from "@components/secondary-info-card";
import { getItemsByCollection } from "@services/api/rarible.service";
import { getRaribleNftDataFromMeta } from "@utils/rarible";

const LandingPage = () => {
  const chainId = useSelector(getChainId);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [marketplace, setMarketplace] = useState(0);
  const designers = useSelector(getAllDesigners).toJS();
  const [offset, setOffset] = useState("");

  useEffect(() => {
    import("react-facebook-pixel")
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init("485692459240447");
        ReactPixel.pageView();

        Router.events.on("routeChangeComplete", () => {
          ReactPixel.pageView();
        });
      });
  }, []);

  const shuffle = (array) => {
    var currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  };

  const getOwners = (garments, itemSold, users) => {
    if (!garments) return [];
    const owners = garments
      .slice(0, itemSold)
      .map((garment) => garment.owner.toLowerCase());
    const arranged = [...new Set(owners)];
    return arranged.map((garment) => {
      const user =
        users.find(
          (item) => item.wallet && item.wallet.toLowerCase() == garment
        ) || {};
      return {
        ...garment,
        ...user,
      };
    });
  };

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
    const network = getEnabledNetworkByChainId(chainId);
    if (marketplace === 0) {
      setLoading(true);
      const { digitalaxCollectionGroups } = await getCollectionGroups(chainId);
      const { digitalaxMarketplaceV3Offers } =
        await getDigitalaxMarketplaceV3Offers(chainId);
      const users = await digitalaxApi.getAllUsersName();
      const prods = [];

      digitalaxCollectionGroups.forEach((collectionGroup) => {
        if (
          collectionGroup.auctions.length > 1 ||
          (collectionGroup.auctions.length === 1 &&
            collectionGroup.auctions[0].id !== "0")
        ) {
          collectionGroup.auctions.forEach((auction) => {
            prods.push({
              id: auction.id,
              designer: auction.designer,
              reservePrice: auction.reservePrice,
              topBid: auction.topBid || 0,
              startTime: auction.startTime,
              endTime: auction.endTime,
              garment: auction.garment,
              sold: Date.now() > auction.endTime * 1000,
              rarity: "Exclusive",
              auction: true,
              version: 2,
            });
          });
        }

        if (
          collectionGroup.collections.length > 1 ||
          (collectionGroup.collections.length === 1 &&
            collectionGroup.collections[0].id !== "0")
        ) {
          collectionGroup.collections.forEach((collection) => {
            const offer = digitalaxMarketplaceV3Offers.find(
              (offer) => offer.id === collection.id
            );
            prods.push({
              id: collection.id,
              designer: collection.designer,
              rarity: collection.rarity,
              startTime: offer?.startTime,
              garment: collection.garments[0],
              owners: getOwners(
                offer?.garmentCollection.garments,
                offer?.amountSold,
                users
              ),
              primarySalePrice: offer ? offer.primarySalePrice : 0,
              sold: collection.garments.length === parseInt(offer?.amountSold),
              auction: false,
              version: 2,
            });
          });
        }
        if (
          collectionGroup.digiBundle.length > 1 ||
          (collectionGroup.digiBundle.length === 1 &&
            collectionGroup.digiBundle[0].id !== "0")
        ) {
          collectionGroup.digiBundle.forEach((collection) => {
            const offer = digitalaxMarketplaceV3Offers.find(
              (offer) => offer.id === collection.id
            );
            prods.push({
              id: collection.id,
              designer: collection.designer,
              startTime: offer?.startTime,
              primarySalePrice: offer ? offer.primarySalePrice : 0,
              sold: collection.garments.length === parseInt(offer.amountSold),
              rarity: collection.rarity,
              garment: collection.garments[0],
              owners: getOwners(
                offer?.garmentCollection.garments,
                offer?.amountSold,
                users
              ),
              auction: false,
              version: 2,
            });
          });
        }
      });
      setProducts(shuffle(prods));
      setLoading(false);
    } else {
      const { items, continuation } = await getItemsByCollection(
        config.MARKETPLACE_NFT_ADDRESS[network.alias],
        offset
      );
      const nftData = getNftData(items);
      setOffset(continuation);
      setProducts([...products, ...nftData]);
    }
  };

  useEffect(() => {
    setOffset("");
    fetchNfts();
  }, [marketplace]);

  const fetchMore = () => {
    if (filteredNfts.length === products.length) {
      fetchNfts();
    }
  };

  const sortProducts = (filteredNfts) => {
    if (marketplace === 0) {
      return filteredNfts.sort((a, b) => {
        if (a.sold && !b.sold) return 1;
        if (!a.sold && b.sold) return -1;
        return 0;
      });
    }
    return filteredNfts;
  };

  const structuredData = {
    "@context": "http://schema.org",
    "@type": "Skins Landing page",
    title: "Digitalax - Web3 Fashion Economy",
    description:
      "Take your digital fashion skins to the next level: directly into indie games & mods, where players from amateur to pro can start to earn a livelihood through play, without sacrificing our love of the game. ESPA is the first casual esports platform, with direct integration with DIGITALAX NFT skins on Matic Network. ",
  };

  const filteredNfts = filterProducts(products, filter, sortBy) || [];

  return (
    <div className={styles.wrapper}>
      <Head>
        <meta
          name="description"
          content="Take your digital fashion skins to the next level: directly into indie games & mods, where players from amateur to pro can start to earn a livelihood through play, without sacrificing our love of the game. ESPA is the first casual esports platform, with direct integration with DIGITALAX NFT skins on Matic Network. "
        />
        <meta property="og:title" content="Digitalax - Web3 Fashion Economy" />
        <meta
          property="og:description"
          content="Take your digital fashion skins to the next level: directly into indie games & mods, where players from amateur to pro can start to earn a livelihood through play, without sacrificing our love of the game. ESPA is the first casual esports platform, with direct integration with DIGITALAX NFT skins on Matic Network. "
        />
        <meta property="og:url" content="https://marketplace.digitalax.xyz" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@ESPA4play" />
        <meta name="twitter:title" content="Skins Landing page" />
        <meta
          name="twitter:description"
          content="Take your digital fashion skins to the next level: directly into indie games & mods, where players from amateur to pro can start to earn a livelihood through play, without sacrificing our love of the game. ESPA is the first casual esports platform, with direct integration with DIGITALAX NFT skins on Matic Network. "
        />
        <script src="https://cdn.rawgit.com/progers/pathseg/master/pathseg.js"></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <section className={styles.homeHeroSection}>
        <div className={styles.leftWrapper}>
          <div className={styles.title}>
            DIGITAL INDIE
            <br />
            WEB3 FASHION
          </div>
          <p>
            Powered by the{" "}
            <a href="https://designers.digitalax.xyz/" target="_blank">
              Global Designer Network
            </a>{" "}
            on Polygon Network
          </p>
        </div>

        <div className={styles.actionsWrapper}>
          <div className={styles.linkWrapper}>
            <Link href="/marketplace">
              <a
                className={styles.heroSectionLink}
              >{`Primary Marketplace >`}</a>
            </Link>
            <Link href="/marketplace/secondary">
              <a
                className={styles.heroSectionLink}
              >{`Secondary Marketplace >`}</a>
            </Link>
          </div>

          <div className={styles.filtersWrapper}>
            <Filters
              showType
              type={marketplace}
              setType={(value) => {
                setMarketplace(parseInt(value));
                setProducts([]);
              }}
              filter={filter}
              filterChange={setFilter}
              sortByChange={setSortBy}
            />
          </div>
        </div>
      </section>
      {loading ? (
        <div className={styles.wrapper}>
          <div className={styles.loadingWrapper}>
            <PixelLoader title={"loading..."} />
          </div>
        </div>
      ) : (
        <Container>
          {marketplace === 1 ? (
            <InfiniteScroll
              dataLength={products.length ?? 0}
              next={fetchMore}
              hasMore={
                marketplace === 0 || filteredNfts.length !== products.length
                  ? false
                  : offset
              }
              loader={
                <div className={styles.loadingWrapper}>
                  <PixelLoader title={"loading..."} />
                </div>
              }
            >
              <section className={styles.collectionsWrapper}>
                {filteredNfts.map((prod) => {
                  return (
                    <SecondaryInfoCard
                      product={prod}
                      nftData={prod.nftData}
                      key={prod.id}
                      showCollectionName
                    />
                  );
                })}
              </section>
            </InfiniteScroll>
          ) : (
            <section className={styles.collectionsWrapper}>
              {sortProducts(filteredNfts).map((prod) => {
                if (marketplace === 0 && !prod.rarity) return <></>;
                if (prod.rarity) {
                  return (
                    <>
                      <ProductInfoCard
                        product={prod}
                        price={
                          prod.auction ? prod.topBid : prod.primarySalePrice
                        }
                        sold={prod.sold}
                        showRarity
                        showCollectionName
                        isAuction={prod.auction}
                      />
                    </>
                  );
                }
              })}
            </section>
          )}
        </Container>
      )}
    </div>
  );
};

export default LandingPage;
