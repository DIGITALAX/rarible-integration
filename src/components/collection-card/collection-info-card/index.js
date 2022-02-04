import React from "react";
import { useSelector } from "react-redux";
import Link from "next/link";

import InfoCard from "@components/info-card";
import PriceCard from "@components/price-card";

import { getExchangeRateETH, getMonaPerEth } from "@selectors/global.selectors";

import styles from "./styles.module.scss";

const CollectionInfoCard = ({ collection }) => {
  const monaPerEth = useSelector(getMonaPerEth);
  const exchangeRate = useSelector(getExchangeRateETH);

  const getPrice = () => {
    return (
      <>
        {parseFloat(collection.sold).toFixed(2)} $MONA
        <span className="font-normal">
          {` `}($
          {(parseFloat(monaPerEth) * exchangeRate * collection.sold).toFixed(2)}
          )
        </span>
      </>
    );
  };

  return (
    <div className={styles.wrapper}>
      <InfoCard>
        <div className={styles.cardBodyWrapper}>
          <Link href={`/marketplace/all/${collection.id}`}>
            <a className="flex items-center justify-center mb-8">
              <img
                src="/images/metaverse/gray_button2.png"
                className="w-48 lg:w-64"
              />
              <span className="absolute font-secondary italic font-bold text-lg lg:text-2xl text-center text-white uppercase">
                view collection
              </span>
            </a>
          </Link>
          <div className={styles.pricesWrapper}>
            <PriceCard mode={0} mainText={getPrice()} subText="total sold" />
          </div>
        </div>
      </InfoCard>
    </div>
  );
};

export default CollectionInfoCard;
