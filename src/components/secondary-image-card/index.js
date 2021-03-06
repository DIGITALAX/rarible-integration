import React, { useEffect, useState } from "react";
import Link from "next/link";
import InfoCard from "@components/info-card";
import ImageCard from "@components/image-card";
import PriceCard from "@components/price-card";
import { useSelector } from "react-redux";
import {
  getChainId,
  getExchangeRateETH,
  getMonaPerEth,
} from "@selectors/global.selectors";
import { useRouter } from "next/router";
import styles from "./styles.module.scss";

const SecondaryImageCard = ({
  product,
  showCollectionName = false,
  showRarity = false,
  isAuction = false,
  sold,
}) => {
  const router = useRouter();
  const chainId = useSelector(getChainId);
  const [offers, setOffers] = useState([]);
  const monaPerEth = useSelector(getMonaPerEth);
  const exchangeRate = useSelector(getExchangeRateETH);

  const getPrice = () => {
    return (
      <>
        {`${product?.price} $MONA`}
        <span>
          {` ($${(
            parseFloat(monaPerEth) *
            exchangeRate *
            product?.price
          ).toFixed(2)})
        `}
        </span>
      </>
    );
  };

  const getHighestPrice = () => {
    let maxBid = 0;
    offers.forEach((offer) => {
      if (maxBid < offer.price) maxBid = offer.price;
    });

    return (
      <>
        {`${(maxBid / 10 ** 18).toFixed(2)} $MONA`}
        <span>
          {` ($${(
            (parseFloat(monaPerEth) * exchangeRate * maxBid) /
            10 ** 18
          ).toFixed(2)})
        `}
        </span>
      </>
    );
  };

  const generateUrl = (id) => {
    const items = id.split(":");
    return `/add-secondary-product/${items[1]}:${items[2]}`;
  };

  return (
    <div className={styles.productInfoCardwrapper}>
      <div className={styles.imageWrapper}>
        <ImageCard
          data={product.nftData}
          showDesigner
          // offerCount={offers.length}
          offerCount={0}
          showCollectionName={showCollectionName}
          showRarity={showRarity}
          showButton={false}
          isAuction={isAuction}
          imgLink={generateUrl(product?.id)}
          withLink
        />
      </div>
      <div className={styles.infoCardWrapper}>
        <InfoCard bodyClass={styles.noHorizontalPadding}>
          <div className={styles.infoWrapper}>
            <Link href={generateUrl(product?.id)}>
              <a className={styles.link}>
                <img src="/images/metaverse/gray_button2.png" />
                <span>MANAGE ITEM</span>
              </a>
            </Link>
            {product?.bestSellOrder ? (
              <PriceCard mainText={getPrice()} subText="LIST PRICE" />
            ) : null}
            {/* // ) : offers.length ? (
            //   <PriceCard mainText={getHighestPrice()} subText="HIGHEST BID" />
            // ) : null} */}
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default SecondaryImageCard;
