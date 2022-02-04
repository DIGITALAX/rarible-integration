import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import InfoCard from '@components/info-card';
import ImageCard from '@components/image-card';
import PriceCard from '@components/price-card';
import NewButton from '@components/buttons/newbutton';
import { useSelector } from 'react-redux';
import { getExchangeRateETH, getMonaPerEth, getChainId } from '@selectors/global.selectors';
import { useRouter } from 'next/router';
import { getNFTById, getSecondaryOrderByContractTokenAndBuyorsell } from '@services/api/apiService';
import { getEnabledNetworkByChainId } from '@services/network.service';
import config from '@utils/config';
import apiService from '@services/api/espa/api.service';
import styles from './styles.module.scss';

const SecondaryInfoCard = ({
  product,
  order,
  offers,
  user,
  nftData,
  showCollectionName = false,
  showRarity = false,
}) => {
  const monaPerEth = useSelector(getMonaPerEth);
  const exchangeRate = useSelector(getExchangeRateETH);

  if (!product) {
    return <></>;
  }

  const getPrice = () => {
    if (order) {
      return (
        <>
          {`${(order?.price / 10 ** 18).toFixed(2)} $MONA`}
          <span>
            {` ($${((parseFloat(monaPerEth) * exchangeRate * order?.price) / 10 ** 18).toFixed(2)})
            `}
          </span>
        </>
      );
    } else {
      const acceptedOffers = offers.filter((offer) =>
        offer.executedTokenIds?.includes(product?.tokenId),
      );
      acceptedOffers.sort((offer1, offer2) => {
        if (offer1.price < offer2.price) return 1;
        if (offer1.price === offer2.price) return 0;
        return -1;
      });
      if (acceptedOffers.length) {
        return (
          <>
            {`${(acceptedOffers[0].price / 10 ** 18).toFixed(2)} $MONA`}
            <span>
              {` ($${(
                (parseFloat(monaPerEth) * exchangeRate * acceptedOffers[0].price) /
                10 ** 18
              ).toFixed(2)})
            `}
            </span>
          </>
        );
      }
      return (
        <>
          0.00 $MONA
          <span>($0.00)</span>
        </>
      );
    }
  };

  return (
    <div className={styles.productInfoCardwrapper}>
      <div className={styles.imageWrapper}>
        <ImageCard
          data={nftData}
          showDesigner
          offerCount={offers.length}
          showCollectionName={showCollectionName}
          showRarity={showRarity}
          showButton={false}
          imgLink={`/secondary-product/${product?.id.replace('_', '-')}`}
          withLink
        />
      </div>
      <div className={styles.infoCardWrapper}>
        <InfoCard bodyClass={styles.noHorizontalPadding}>
          <div className={styles.infoWrapper}>
            <PriceCard
              mainText={getPrice()}
              subText={
                order
                  ? !order?.executedTokenIds
                    ? 'LIST PRICE'
                    : 'LAST SALE PRICE'
                  : 'HIGHEST BID'
              }
            />
            <div className={styles.linkWrapper}>
              {order?.buyOrSell === 'Sell' && !order?.executedTokenIds && (
                <Link href={`/secondary-product/${product?.id.replace('_', '-')}`}>
                  <a>
                    <NewButton text="Instant Buy" />
                  </a>
                </Link>
              )}
              <Link href={`/secondary-product/${product?.id.replace('_', '-')}`}>
                <a>
                  <NewButton text="Make Offer" />
                </a>
              </Link>
            </div>
            {!!user && (
              <div className={styles.sellerInfo}>
                <div className={styles.description}>seller</div>
                <div className={styles.seller}>
                  <Link href={`/user/${user.wallet}`}>
                    <a target="_blank">
                      <img src={user && user?.avatar ? user?.avatar : '/images/image 450.png'} />
                    </a>
                  </Link>
                  <div className={styles.name}>{user?.username}</div>
                </div>
              </div>
            )}
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default SecondaryInfoCard;
