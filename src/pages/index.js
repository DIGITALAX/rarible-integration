import React, { useEffect, useState } from "react";
import { Router } from "next/router";
import Head from "next/head";
import {
  getAllNFTs,
  getCollectionGroups,
  getDigitalaxMarketplaceV2Offers,
  getNFTById,
  getSecondaryOrderByContractTokenAndBuyorsell,
  getSellingNfts,
} from "@services/api/apiService";
import PixelLoader from "@components/pixel-loader";
import styles from "./styles.module.scss";
import { useSelector } from "react-redux";
import { getChainId } from "@selectors/global.selectors";
import Link from "next/link";
import ProductInfoCard from "@components/product-info-card";
import Filters from "@components/filters";
import { filterOrders, filterProducts } from "@utils/helpers";
import digitalaxApi from "@services/api/espa/api.service";
import { getEnabledNetworkByChainId } from "@services/network.service";
import config from "@utils/config";
import SecondaryInfoCard from "@components/secondary-info-card";

const LandingPage = () => {
  const chainId = useSelector(getChainId);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("");
  const [secondaryOrders, setSecondaryOrders] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [marketplace, setMarketplace] = useState(1);
  const [lookIds, setLookIds] = useState([]);

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

  useEffect(() => {
    const fetchCollectionGroups = async () => {
      setLoading(true);
      const { digitalaxCollectionGroups } = await getCollectionGroups(chainId);
      const { digitalaxMarketplaceV2Offers } =
        await getDigitalaxMarketplaceV2Offers(chainId);
      const users = await digitalaxApi.getAllUsersName();
      const network = getEnabledNetworkByChainId(chainId);
      const { nfts } = await getAllNFTs(config.NIX_URL[network.alias]);
      const { orders: ords } = await getSellingNfts(
        config.NIX_URL[network.alias]
      );

      setSecondaryOrders(filterOrders(ords));
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
            const offer = digitalaxMarketplaceV2Offers.find(
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
            const offer = digitalaxMarketplaceV2Offers.find(
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

      const nftData = [];

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
        const seller = users.find(
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
          user: seller ? seller : {},
          orders: filterOrders(orders),
        });
      }

      setProducts(shuffle([...prods, ...nftData]));
      setLoading(false);
    };
    fetchCollectionGroups();
  }, []);

  const structuredData = {
    "@context": "http://schema.org",
    "@type": "Skins Landing page",
    title: "Digitalax - Web3 Fashion Economy",
    description:
      "Take your digital fashion skins to the next level: directly into indie games & mods, where players from amateur to pro can start to earn a livelihood through play, without sacrificing our love of the game. ESPA is the first casual esports platform, with direct integration with DIGITALAX NFT skins on Matic Network. ",
  };

  const getOrderForNFT = (nft) => {
    return secondaryOrders?.find((order) => {
      return (
        order.token.id === nft.token.id && order.tokenIds[0] === nft.tokenId
      );
    });
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loadingWrapper}>
          <PixelLoader title={"loading..."} />
        </div>
      </div>
    );
  }

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
              setType={(value) => {
                setMarketplace(parseInt(value));
              }}
              filter={filter}
              filterChange={setFilter}
              sortByChange={setSortBy}
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto">
        <section className={styles.collectionsWrapper}>
          {filterProducts(products, filter, sortBy)
            .sort((a, b) => {
              if (a.sold && !b.sold) return 1;
              if (!a.sold && b.sold) return -1;
              return 0;
            })
            .map((prod) => {
              if (marketplace === 2 && prod.rarity) return <></>;
              if (marketplace === 1 && !prod.rarity) return <></>;
              if (marketplace === 2) {
                return (
                  <SecondaryInfoCard
                    product={prod}
                    offers={prod.orders}
                    user={prod.user}
                    nftData={prod.nftData}
                    order={getOrderForNFT(prod)}
                    key={prod.id}
                    showCollectionName
                  />
                );
              }
              if (prod.rarity) {
                return (
                  <>
                    <ProductInfoCard
                      product={prod}
                      price={prod.auction ? prod.topBid : prod.primarySalePrice}
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
      </div>
    </div>
  );
};

export default LandingPage;
