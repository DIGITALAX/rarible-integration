import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";
import styles from "./styles.module.scss";

import ImageCard from "@components/image-card";
import InfoCard from "@components/info-card";
import UserList from "@components/user-list";
import BannerBar from "@components/banner-bar";
import PriceCard from "@components/price-card";
import ProductPageLoader from "@components/product-page-loader";

import {
  getAllDigitalaxCollectionGroupsByGarment,
  getDigitalaxNFTStakersByGarments,
  getGuildWhitelistedNFTStakersByGarments,
  getNFTByContractAndTokenId,
  getSecondaryNftInfo,
  getSecondaryOrderByContractAndTokenId,
} from "@services/api/apiService";

import digitalaxApi from "@services/api/espa/api.service";

import {
  getChainId,
  getExchangeRateETH,
  getMonaPerEth,
} from "@selectors/global.selectors";
import { getAccount } from "@selectors/user.selectors";
import { getUser } from "@helpers/user.helpers";
import { reviseUrl } from "@utils/helpers";
import config from "@utils/config";
import {
  openBespokeModal,
  openCurrentWearersModal,
  openBuynowModal,
  openMakeOfferModal,
  openSecondaryPurchaseHistory,
} from "@actions/modals.actions";

import globalActions from "@actions/global.actions";

import secondDesignerData from "src/data/second-designers.json";
import { getEnabledNetworkByChainId } from "@services/network.service";
import NewButton from "@components/buttons/newbutton";
import { filterOrders } from "@utils/helpers";
import { getItemById } from "@services/api/rarible.service";
import Container from "@components/container";
import { getRaribleNftDataFromMeta } from "@utils/rarible";

const POLYGON_CHAINID = 0x89;

const getAllResultsFromQuery = async (query, resultKey, chainId, owner) => {
  let lastID = "";
  let isContinue = true;
  const fetchCountPerOnce = 1000;

  const resultArray = [];
  while (isContinue) {
    const result = await query(chainId, owner, fetchCountPerOnce, lastID);
    if (!result[resultKey] || result[resultKey].length <= 0) isContinue = false;
    else {
      resultArray.push(...result[resultKey]);
      if (result[resultKey].length < fetchCountPerOnce) {
        isContinue = false;
      } else {
        lastID = result[resultKey][fetchCountPerOnce - 1]["id"];
      }
    }
  }

  return resultArray;
};

const Product = ({ pageTitle }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;
  const chainId = useSelector(getChainId);
  const [product, setProduct] = useState({});
  // const [order, setOrder] = useState();
  const [tokenIds, setTokenIds] = useState([]);
  const [secondDesigners, setSecondDesigners] = useState([]);
  const monaPerEth = useSelector(getMonaPerEth);
  const exchangeRate = useSelector(getExchangeRateETH);
  const [loveCount, setLoveCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [nftInfo, setNftInfo] = useState({});
  const [owners, setOwners] = useState([]);
  const [sourceType, setSourceType] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const [isFetchedProduct, setIsFetchedProduct] = useState(false);
  const [isFetchedViewCount, setIsFetchedViewCount] = useState(false);
  const [isFetchedSecondDesigners, setIsFetchedSecondDesigners] =
    useState(false);

  const sourceTypeDescription = {
    AR: "You can wear and view this fashion in AR",
    "DIGITAL DRESSING": "Get digitally dressed in this fashion",
    "IN-GAME": "You can take this fashion in-game",
    "PHYSICAL COUNTERPART": "This fashion includes the physical counterpart",
    "FBX SOURCE FILE": "type of source file included",
  };

  const account = useSelector(getAccount);
  const user = getUser();
  const secretKey = user ? user.randomString : null;

  const getOwners = async (garments, itemSold, users) => {
    if (!garments) return [];
    const soldGarments = garments
      .slice(0, itemSold)
      .map((garment) => garment.id);
    // get digitalax NFTs on Mainnet
    const digitalaxAllNFTStakersByGarments = await getAllResultsFromQuery(
      getDigitalaxNFTStakersByGarments,
      "digitalaxNFTStakers",
      POLYGON_CHAINID,
      soldGarments
    );

    const guildAllNFTStakersByGarments = await getAllResultsFromQuery(
      getGuildWhitelistedNFTStakersByGarments,
      "guildWhitelistedNFTStakers",
      POLYGON_CHAINID,
      soldGarments.map(
        (item) => config.DTX_ADDRESSES["matic"].toLowerCase() + "-" + item
      )
    );

    const digitalaxStakedGarments = {};
    digitalaxAllNFTStakersByGarments
      .filter((item) => item.garments && item.garments.length > 0)
      .map((staker) => {
        staker.garments.forEach((garment) => {
          digitalaxStakedGarments[garment.id] = staker.id;
        });
      });

    guildAllNFTStakersByGarments
      .filter((item) => item.garments && item.garments.length > 0)
      .map((staker) => {
        staker.garments.forEach((garment) => {
          digitalaxStakedGarments[garment.id.split("-")[1]] = staker.id;
        });
      });

    const owners = garments.slice(0, itemSold).map((garment) => {
      const owner = garment.owner.toLowerCase();
      return digitalaxStakedGarments && digitalaxStakedGarments[garment.id]
        ? digitalaxStakedGarments[garment.id]
        : owner;
    });
    const arranged = owners.filter((item, pos) => {
      return owners.indexOf(item) == pos;
    });
    return arranged.map((garment) => {
      const user =
        users.find(
          (item) => item.wallet && item.wallet.toLowerCase() == garment
        ) || {};
      return {
        ...user,
      };
    });
  };

  useEffect(() => {
    const fetchGarmentV2ByID = async () => {
      const contract = id.split(":")[0];
      const tokenId = id.split(":")[1];
      const network = getEnabledNetworkByChainId(chainId);
      const res = await getItemById(`POLYGON:${id}`);

      const { digitalaxCollectionGroups } =
        await getAllDigitalaxCollectionGroupsByGarment(
          config.API_URLS[network.alias],
          [tokenId]
        );
      const { orders } = await getSecondaryOrderByContractAndTokenId(
        config.NIX_URL[network.alias],
        contract,
        [tokenId]
      );
      const { nft } = await getSecondaryNftInfo(
        config.NIX_URL[network.alias],
        id
      );
      // const { tokens } = await getNFTByContractAndTokenId(
      //   config.EIP721_URL[network.alias],
      //   contract,
      //   tokenId
      // );

      const designer = res.meta.attributes.find(
        (attribute) => attribute.key === "Designer"
      )?.value;
      const designerData = await digitalaxApi.getDesignerById(designer);

      // const filteredOrders = filterOrders(
      //   orders.filter((order) => order?.buyOrSell === "Sell")
      // );

      const collectionGroup = digitalaxCollectionGroups.find(
        (collectionGroup) => collectionGroup.collections.length
      );

      if (collectionGroup) {
        setTotalAmount(collectionGroup.collections[0].garments.length);
      }
      setProduct({
        ...res,
        price: res.bestSellOrder?.makePrice
          ? parseFloat(res.bestSellOrder?.makePrice)
          : null,
        ...getRaribleNftDataFromMeta(res.meta),
        designer: designerData[0],
      });

      // setOrder(filteredOrders[filteredOrders.length - 1]);
      const users = await digitalaxApi.getAllUsersName();
      dispatch(globalActions.setAllUsers(users));
      setNftInfo(nft);
      setIsFetchedProduct(true);
    };

    fetchGarmentV2ByID();

    const secondDesigner = secondDesignerData.find((item) => {
      return item.id === id;
    });

    if (
      secondDesigner &&
      secondDesigner.designer &&
      secondDesigner.designer.length > 0
    ) {
      const secondDesignersRes = [];
      secondDesigner.designer.map((designerItem) => {
        fetch(designerItem)
          .then((response) => response.json())
          .then((designerData) => {
            secondDesignersRes.push({
              name: designerData["Designer ID"],
              description: designerData["description"],
              image: designerData["image_url"],
            });
            setSecondDesigners(secondDesignersRes);
            setIsFetchedSecondDesigners(true);
          });
      });
    } else {
      setSecondDesigners([]);
      setIsFetchedSecondDesigners(true);
    }

    const fetchViews = async () => {
      const viewData = await digitalaxApi.getViews("product", id);
      setLoveCount(
        viewData && viewData[0] && viewData[0].loves
          ? viewData[0].loves.length
          : 0
      );
      setViewCount(
        viewData && viewData[0] && viewData[0].viewCount
          ? viewData[0].viewCount
          : 0
      );
      setIsFetchedViewCount(true);
    };

    const addViewCount = async () => {
      const data = await digitalaxApi.addView("product", id);
      if (data) {
        setViewCount(data.viewCount);
      }
    };

    fetchViews();
    addViewCount();
  }, []);

  useEffect(() => {
    if (product?.name) {
      const fetchSourceType = async () => {
        const data = await digitalaxApi.getSourceType(product.name);
        if (data?.sourceType) setSourceType(data.sourceType);
      };

      fetchSourceType();
    }
  }, [product]);

  const onHistory = (type) => {
    dispatch(
      openSecondaryPurchaseHistory({
        itemId: id.replace("-", ":"),
        type: type === 1 ? "SELL" : "BID",
      })
    );
  };

  const onBespokeBtn = () => {
    dispatch(openBespokeModal());
  };

  const onBuy = () => {
    dispatch(
      openBuynowModal({
        orderId: product.bestSellOrder.id,
        priceEth: product.price,
        secondary: true,
      })
    );
  };

  const onMakeOffer = () => {
    dispatch(
      openMakeOfferModal({
        contract: product.contract,
        id: product.tokenId,
      })
    );
  };

  const addLove = async () => {
    const data = await digitalaxApi.addLove(account, secretKey, "product", id);
    if (data && data["success"]) {
      setLoveCount(loveCount + 1);
    }
  };

  const onClickLove = () => {
    addLove();
  };

  const onClickSeeAllWearers = () => {
    dispatch(
      openCurrentWearersModal({
        tokenIds,
        v1: id.includes("v1"),
      })
    );
  };

  const getPriceElement = () => {
    if (product.price) {
      return (
        <>
          {parseFloat(product.price).toFixed(2)}
          {" MONA "}
          <span>
            ($
            {(
              parseFloat(product.price) *
              parseFloat(monaPerEth) *
              exchangeRate
            ).toFixed(2)}
            )
          </span>
        </>
      );
    } else {
      return `0.00 MONA ($0.00)`;
    }
  };

  if (!isFetchedProduct || !isFetchedSecondDesigners || !isFetchedViewCount) {
    return <ProductPageLoader />;
  }

  return (
    <>
      <Head></Head>

      <div className={styles.wrapper}>
        <section className={styles.mainSection}>
          <Container>
            <div className={styles.body}>
              <div className={styles.productName}> {product?.name} </div>
              <div className={styles.mainBody}>
                <div className={styles.imageCardWrapper}>
                  <ImageCard
                    data={product}
                    // price={(product.price / 10 ** 18).toFixed(2)}
                    showButton={false}
                  />

                  {!!product?.children?.length && (
                    <>
                      <div className={styles.childrenDescription}>
                        Open Source{" "}
                        <a
                          href="https://designers.digitalax.xyz/fractional/"
                          target="_blank"
                        >
                          Fractional Garment Ownership
                        </a>
                      </div>
                      <div className={styles.childrenWrapper}>
                        {product.children.map((child) => {
                          return (
                            <a
                              href={`https://opensea.io/assets/matic/0x567c7b3364ba2903a80ecbad6c54ba8c0e1a069e/${child.id}`}
                              target="_blank"
                            >
                              {child.image_url ? (
                                <img src={reviseUrl(child.image_url)} />
                              ) : child.animation_url ? (
                                <video muted autoPlay loop>
                                  <source
                                    src={reviseUrl(child.animation_url)}
                                  />
                                </video>
                              ) : null}
                            </a>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
                <div className={styles.infoWrapper}>
                  <div className={styles.leftSection}>
                    {/* <div className={styles.amount}>
                      {nftInfo?.trades.length} of {totalAmount}
                      <div className={styles.helper}>
                        <span className={styles.questionMark}>?</span>
                        <span className={styles.description}>
                          You can also stake this NFT for yield + get the
                          original source file.
                        </span>
                      </div>
                    </div> */}

                    <div className={styles.lovesWrapper}>
                      <button
                        type="button"
                        className={styles.loveButton}
                        onClick={onClickLove}
                      >
                        <img src="/images/like_icon.png" />
                      </button>

                      <div className={styles.likeCount}>
                        {loveCount}
                        <span>LOVES</span>
                      </div>
                      <img src="/images/view_icon.png" />
                      <div className={styles.viewCount}>
                        {viewCount}
                        <span>VIEWS</span>
                      </div>
                    </div>

                    <InfoCard
                      borderColor="white"
                      boxShadow2="inset 0px 0px 10px 10px rgba(255, 255, 255, 0.47)"
                      mainColor="rgba(95, 95, 95, 0.47)"
                    >
                      <div className={styles.infoCard}>
                        <div className={styles.skinName}>
                          {/* <div className={styles.text}> {getRarity(parseInt(rarity))} </div> */}
                        </div>
                        <div className={styles.description}>
                          {product?.description}
                        </div>
                      </div>
                    </InfoCard>
                    {!!sourceType.length && (
                      <div className={styles.mobileRightSection}>
                        {sourceType.map((st) => (
                          <div className={styles.item}>
                            <label className={styles.checkContainer}>
                              <input
                                type="checkbox"
                                className={styles.check}
                                checked
                              />
                              <span className={styles.checkmark} />
                            </label>
                            <div className={styles.label}> {st} </div>
                            <span className={styles.tooltip}>
                              {" "}
                              {sourceTypeDescription[st]}{" "}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={styles.actions}>
                      <div className={styles.buttonWrapper}>
                        <PriceCard
                          mode={1}
                          mainText={getPriceElement()}
                          subText="list price"
                        />
                      </div>
                      <div className={styles.buyWrapper}>
                        {product?.bestSellOrder && (
                          <NewButton text="instant buy" onClick={onBuy} />
                        )}
                        <NewButton text="make offer" onClick={onMakeOffer} />
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.viewBidHistory}
                      onClick={() => onHistory(1)}
                    >
                      view purchase history
                    </button>
                    <button
                      type="button"
                      className={styles.viewBidHistory}
                      onClick={() => onHistory(2)}
                    >
                      view offer history
                    </button>
                    <button
                      type="button"
                      className={styles.bespokeBtn}
                      onClick={onBespokeBtn}
                    >
                      Want something more Bespoke?
                    </button>
                    <a href="https://staking.digitalax.xyz/" target="_blank">
                      <button type="button" className={styles.stakeBtn}>
                        STAKE YOUR FASHION FOR $MONA YIELD
                      </button>
                    </a>
                  </div>
                  {!!sourceType.length && (
                    <div className={styles.rightSection}>
                      {sourceType.map((st) => (
                        <div className={styles.item}>
                          <label className={styles.checkContainer}>
                            <input
                              type="checkbox"
                              className={styles.check}
                              checked
                            />
                            <span className={styles.checkmark} />
                          </label>
                          <div className={styles.label}> {st} </div>
                          <span className={styles.tooltip}>
                            {" "}
                            {sourceTypeDescription[st]}{" "}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Container>
        </section>
        <BannerBar className={styles.homeHeroBar} type={2} />
        {product?.designer ? (
          <>
            <section className={styles.designerSection}>
              <video autoPlay loop muted className={styles.video}>
                <source
                  src="./images/metaverse/designer-bg.mp4"
                  type="video/mp4"
                />
              </video>
              <Container>
                <div className={styles.designerBody}>
                  <div className={styles.title}> designer </div>
                  <div className={styles.data}>
                    <a
                      href={`https://designers.digitalax.xyz/designers/${product?.designer?.designerId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ImageCard
                        showButton={false}
                        imgUrl={product?.designer?.image_url}
                        borderType="pink"
                      />
                    </a>
                    <div className={styles.infoWrapper}>
                      {owners.length ? (
                        <div className={styles.wearersLabel}>
                          current wearer/S
                        </div>
                      ) : (
                        <></>
                      )}
                      {owners.length ? (
                        <UserList
                          className={styles.userList}
                          userLimit={7}
                          users={owners}
                          onClickSeeAll={onClickSeeAllWearers}
                        />
                      ) : (
                        <></>
                      )}
                      <InfoCard
                        libon="./images/metaverse/party_glasses.png"
                        borderColor="#c52081"
                        boxShadow="rgba(197, 32, 129, 0.5)"
                        mainColor="rgba(189, 61, 169, 0.47)"
                      >
                        <a
                          href={`https://designers.digitalax.xyz/designers/${product?.designer?.designerId}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className={styles.name}>
                            {" "}
                            {product?.designer?.designerId}{" "}
                          </div>
                        </a>
                        <div className={styles.description}>
                          {product?.designer?.description}
                        </div>
                        <a
                          href={`https://designers.digitalax.xyz/designers/${product?.designer?.designerId}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <button
                            type="button"
                            className={styles.profileButton}
                          >
                            View Full Profile
                          </button>
                        </a>
                      </InfoCard>
                      <a
                        href="https://designers.digitalax.xyz/getdressed"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <button
                          type="button"
                          className={styles.getDressedButton}
                        >
                          GET BESPOKE DRESSED BY THIS DESIGNER!
                        </button>
                      </a>
                    </div>
                  </div>
                </div>
              </Container>
            </section>

            {secondDesigners &&
              secondDesigners.length > 0 &&
              secondDesigners.map((item) => {
                return (
                  <section
                    className={[styles.designerSection, styles.margin50].join(
                      " "
                    )}
                    key={item.name}
                  >
                    <video autoPlay loop muted className={styles.video}>
                      <source
                        src="./images/metaverse/designer-bg.mp4"
                        type="video/mp4"
                      />
                    </video>
                    <Container>
                      <div className={styles.designerBody}>
                        <div className={styles.title}> designer </div>
                        <div className={styles.data}>
                          <a
                            href={`https://designers.digitalax.xyz/designers/${item.name}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ImageCard
                              showButton={false}
                              imgUrl={item.image}
                              borderType="pink"
                            />
                          </a>
                          <div className={styles.infoWrapper}>
                            {owners.length ? (
                              <div className={styles.wearersLabel}>
                                current wearer/S
                              </div>
                            ) : (
                              <></>
                            )}
                            {owners.length ? (
                              <UserList
                                className={styles.userList}
                                users={owners}
                                userLimit={7}
                                onClickSeeAll={onClickSeeAllWearers}
                              />
                            ) : (
                              <></>
                            )}
                            <InfoCard
                              libon="./images/metaverse/party_glasses.png"
                              borderColor="#c52081"
                              boxShadow="rgba(197, 32, 129, 0.5)"
                              mainColor="rgba(189, 61, 169, 0.47)"
                            >
                              <a
                                href={`https://designers.digitalax.xyz/designers/${item.name}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <div className={styles.name}> {item.name} </div>
                              </a>
                              <div className={styles.description}>
                                {item.description}
                              </div>
                              <a
                                href={`https://designers.digitalax.xyz/designers/${item.name}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <button
                                  type="button"
                                  className={styles.profileButton}
                                >
                                  View Full Profile
                                </button>
                              </a>
                            </InfoCard>
                            <a
                              href="https://designers.digitalax.xyz/getdressed"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <button
                                type="button"
                                className={styles.getDressedButton}
                              >
                                GET BESPOKE DRESSED BY THIS DESIGNER!
                              </button>
                            </a>
                          </div>
                        </div>
                      </div>
                    </Container>
                  </section>
                );
              })}
          </>
        ) : null}
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  return {
    props: {
      pageTitle: "Hello",
    }, // will be passed to the page component as props
  };
}

export default Product;
