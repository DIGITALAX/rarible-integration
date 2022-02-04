import HeroSection from '@components/hero-section';
import SecondaryProduct from '@components/secondary-product';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { setIsDelistSuccess, setIsSecondaryProductUpdate } from '@actions/modals.actions';
import { getNFTById, getIsNFTListed } from '@services/api/apiService';
import { useSelector, useDispatch } from 'react-redux';
import { getChainId } from '@selectors/global.selectors';
import { getEnabledNetworkByChainId } from '@services/network.service';
import { getAccount } from '@selectors/user.selectors';
import config from '@utils/config';
import styles from './styles.module.scss';

const AddSecondaryProduct = () => {
  const route = useRouter();
  const dispatch = useDispatch();
  const { isDelistSuccess, isSecondaryProductUpdate } = useSelector((state) => state.modals.toJS());
  const [nft, setNft] = useState({});
  const chainId = useSelector(getChainId);
  const account = useSelector(getAccount);
  const [defaultPrice, setDefaultPrice] = useState(null);
  const [isListed, setIsListed] = useState(false);
  const { id } = route.query;

  const fetchNft = async () => {
    const network = getEnabledNetworkByChainId(chainId);
    const tokenInfo = id.split('_');
    const tokenAddress = tokenInfo[0];
    const tokenId = tokenInfo[1];
    const { token } = await getNFTById(id, config.EIP721_URL[network.alias]);
    const { orders } = await getIsNFTListed(config.NIX_URL[network.alias], account, tokenAddress, [
      tokenId,
    ]);

    if (orders.length) {
      setIsListed(true);
      setDefaultPrice(orders[orders.length - 1].price);
    } else {
      setIsListed(false);
      setDefaultPrice(0);
    }

    setNft(token);
  };

  useEffect(() => {
    if (id) {
      fetchNft();
    }
  }, [id]);

  useEffect(() => {
    if (isDelistSuccess) {
      setIsListed(false);
      setDefaultPrice(0);
    }
  }, [isDelistSuccess]);

  useEffect(() => {
    if (isSecondaryProductUpdate) {
      setIsListed(true);
    }
  }, [isSecondaryProductUpdate]);

  useEffect(() => {
    dispatch(setIsSecondaryProductUpdate(0));
    dispatch(setIsDelistSuccess(false));
  }, []);

  return (
    <div className={styles.wrapper}>
      <HeroSection title="Manage" subTitle="WEB3 FASHION INVENTORY" showHeroBar={false} />
      <Link href="/manage-inventory">
        <a className={styles.backBtn}>return to inventory</a>
      </Link>
      <div className={styles.description}>
        YOU can list your nft for sale on the marketplace. The DESIGNER WILL RECEIVE An automated
        10% ROYALTY ON THE SALE OF THE ITEM, PERPETUALLY. IN ADDITION, A 3% royalty from the final
        secondary sale price is also awarded to the digitalax treasury and 3% to the $mona, $mona lp
        + Genesis mona nft stakers issued through the ADDITIONAL TOKEN REWARDS contracts.
        <br />
        <br />
        ONCE YOU LIST YOUR ITEM ON THE SECONDARY MARKETPLACE COLLECTORS WILL BE ABLE TO PURCHASE
        YOUR ITEM AT THE INSTANT BUY LISTED PRICE. YOU CAN DELIST OR UPDATE YOUR LISTING PRICE
        ANYTIME. EVEN AFTER YOU DELIST YOUR ITEM WILL STILL BE SHOWN ON THE MARKETPLACE WHERE ANYONE
        CAN MAKE PASSIVE OFFERS FOR YOU TO ACCEPT OR NOT.
      </div>
      <SecondaryProduct
        product={nft}
        isListed={isListed}
        defaultPrice={defaultPrice ? defaultPrice / 1e18 : null}
      />
    </div>
  );
};

export default AddSecondaryProduct;
