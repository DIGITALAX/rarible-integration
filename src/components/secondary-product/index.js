import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ImageCard from '@components/image-card';
import NewButton from '@components/buttons/newbutton';
import { useDispatch, useSelector } from 'react-redux';
import {
  openDelistModal,
  setIsDelistSuccess,
  setIsSecondaryProductUpdate,
} from '@actions/modals.actions';
import styles from './styles.module.scss';
import OfferList from './offer-list';
import Loader from '@components/loader';
import bidActions from '@actions/bid.actions';
import { getAccount } from '@selectors/user.selectors';
import { getEnabledNetworkByChainId } from '@services/network.service';
import { getChainId } from '@selectors/global.selectors';
import { getSecondaryOrderByContractAndTokenId } from '@services/api/apiService';
import config from '@utils/config';

const SecondaryProduct = ({ product, defaultPrice, isListed = false }) => {
  const route = useRouter();
  const { id } = route.query;
  const chainId = useSelector(getChainId);
  const { isDelistSuccess, isSecondaryProductUpdate } = useSelector((state) => state.modals.toJS());
  const [order, setOrder] = useState();
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  const account = useSelector(getAccount);
  const dispatch = useDispatch();
  const [monaPrice, setMonaPrice] = useState(0);

  const fetchApproved = async () => {
    dispatch(bidActions.getSecondaryNftApproved(id.split('_')[0], id.split('_')[1]))
      .then((res) => {
        console.log({ res });
        setApproved(res);
      })
      .catch((e) => {
        console.log({ e });
      });
  };

  const fetchOrder = async () => {
    const network = getEnabledNetworkByChainId(chainId);
    const { orders } = await getSecondaryOrderByContractAndTokenId(
      config.NIX_URL[network.alias],
      id.split('_')[0],
      [id.split('_')[1]],
    );

    setOrder(orders.find((order) => order.maker === account.toLowerCase()));
  };

  useEffect(() => {
    fetchOrder();
    fetchApproved();
  }, [isListed]);

  const onDelist = async () => {
    if (!order) {
      await fetchOrder();
    }
    dispatch(
      openDelistModal({
        tokenAddress: id.split('_')[0],
        orderId: order.id.split('-')[1],
      }),
    );
  };

  useEffect(() => {
    if (defaultPrice) {
      setMonaPrice(defaultPrice);
    }
  }, [defaultPrice]);

  const onList = async (monaPrice) => {
    const token = id.split('_');
    const tokenAddress = token[0];
    const tokenId = token[1];
    setLoading(true);
    if (!approved) {
      dispatch(bidActions.approveSecondaryNft(tokenAddress, tokenId))
        .then((res) => {
          setApproved(true);
          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
          console.log({ e });
        });
    } else {
      if (!defaultPrice) {
        dispatch(bidActions.addSecondaryMarketplaceProduct(tokenAddress, tokenId, monaPrice, 1))
          .then((res) => {
            dispatch(setIsDelistSuccess(false));
            setLoading(false);
            dispatch(setIsSecondaryProductUpdate(1));
          })
          .catch((e) => {
            dispatch(setIsSecondaryProductUpdate(0));
            setLoading(false);
            console.log({ e });
          });
      } else {
        dispatch(
          bidActions.updateSecondaryMarketplaceOrder(
            tokenAddress,
            order.id.split('-')[1],
            order.tokenIds,
            monaPrice,
          ),
        )
          .then((res) => {
            dispatch(setIsDelistSuccess(false));
            setLoading(false);
            dispatch(setIsSecondaryProductUpdate(2));
          })
          .catch((e) => {
            dispatch(setIsSecondaryProductUpdate(0));
            setLoading(false);
            console.log({ e });
          });
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      {loading && <Loader active />}
      <div className={styles.topSection}>
        <ImageCard showCollectionName data={product} showButton={false} />
      </div>
      <div className={styles.bottomSection}>
        {isListed && <NewButton text="delist" className={styles.delistBtn} onClick={onDelist} />}
        <div className={styles.title}>List NFT On Marketplace</div>
        <div className={styles.formGroup}>
          <div className={styles.formLabel}>what PRICE WOULD YOU LIKE TO LIST THE ITEM FOR?</div>
          <div className={styles.inputGroup}>
            <input type="text" value={monaPrice} onChange={(e) => setMonaPrice(e.target.value)} />
            <div className={styles.prefix}> $MONA </div>
          </div>
        </div>
        <button type="button" className={styles.listBtn} onClick={() => onList(monaPrice)}>
          {approved ? (isListed ? 'update listing' : 'list on marketplace') : 'Approve'}
        </button>

        {!!isSecondaryProductUpdate && (
          <>
            {isSecondaryProductUpdate === 1 ? (
              <div className={styles.details}>
                SUCCESS! YOUR ITEM IS NOW LIVE ON THE MARKETPLACE.
                <br />
                <a href={`/secondary-product/${id.replace('_', '-')}`}>VIEW YOUR ITEM LIVE HERE</a>
              </div>
            ) : (
              <div className={styles.details}>
                SUCCESS! YOU HAVE UPDATED YOUR LISTING PRICE.
                <br />
                <a href={`/secondary-product/${id.replace('_', '-')}`}>VIEW YOUR ITEM LIVE HERE</a>
              </div>
            )}
          </>
        )}
        {isDelistSuccess && (
          <div className={styles.details}>
            SUCCESS! YOUR ITEM was delisted from the
            <br /> marketplace. you can relist at any time.
          </div>
        )}
      </div>

      <OfferList contract={product?.contract?.id} tokenId={product?.tokenID} />
    </div>
  );
};

export default SecondaryProduct;
