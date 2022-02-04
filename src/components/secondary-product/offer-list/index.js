import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './styles.module.scss';
import NewButton from '@components/buttons/newbutton';
import { useDispatch, useSelector } from 'react-redux';
import { openRejectOfferModal } from '@actions/modals.actions';
import { getSecondaryOrderByContractTokenAndBuyorsell } from '@services/api/apiService';
import apiService from '@services/api/espa/api.service';
import { getChainId } from '@selectors/global.selectors';
import { getEnabledNetworkByChainId } from '@services/network.service';
import config from '@utils/config';
import bidActions from '@actions/bid.actions';

const OfferList = ({ contract, tokenId }) => {
  const dispatch = useDispatch();
  const chainId = useSelector(getChainId);
  const [offers, setOffers] = useState([]);
  const [users, setUsers] = useState([]);

  // const onReject = () => {
  //   dispatch(openRejectOfferModal());
  // };

  useEffect(() => {
    const fetchOfferList = async () => {
      const network = getEnabledNetworkByChainId(chainId);
      const { orders } = await getSecondaryOrderByContractTokenAndBuyorsell(
        config.NIX_URL[network.alias],
        contract,
        [tokenId],
        'Buy',
      );
      const allUsers = await apiService.getAllUsersName();

      setOffers(orders);
      setUsers(allUsers);
    };

    if (contract && tokenId) {
      fetchOfferList();
    }
  }, [contract, tokenId]);

  const onAccept = (offer) => {
    dispatch(
      bidActions.secondaryBuyNow(
        tokenId,
        offer.id.split('-')[1],
        contract,
        offer.price / 1e18,
        true,
      ),
    )
      .then((res) => {
        console.log({ res });
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>Item Offers</div>

      <table className={styles.offerList}>
        <thead>
          <tr>
            <th style={{ width: '20%' }}> OFFER AMOUNT </th>
            <th style={{ width: '5%' }}> </th>
            <th style={{ width: '22.5%' }}> from </th>
            <th style={{ width: '22.5%' }}> tx </th>
            <th style={{ width: '20%' }}> date </th>
            <th style={{ width: '10%' }}> status </th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => {
            const user = users.find((user) => user.wallet?.toLowerCase() === offer.maker);
            return (
              <tr>
                <td> {(offer.price / 1e18).toFixed(2)} $MONA </td>
                <td>
                  {' '}
                  <img src={user && user?.avatar ? user.avatar : '/images/image 450.png'} />{' '}
                </td>
                <td>
                  {' '}
                  {user ? (
                    <Link href={`/user/${user.wallet}/`}>
                      <a>{offer.maker.slice(0, 10)}...</a>
                    </Link>
                  ) : (
                    <>{offer.maker.slice(0, 10)}...</>
                  )}{' '}
                </td>
                <td>
                  {' '}
                  <a href={`https://polygonscan.com/tx/${offer.createdTxHash}`} target="_blank">
                    {offer.createdTxHash.slice(0, 10)}...
                  </a>{' '}
                </td>
                <td> {new Date(parseInt(offer.timestamp) * 1000).toDateString()} </td>
                <td>
                  <div className={styles.btnWrapper}>
                    {offer.executedTokenIds?.includes(tokenId) ? (
                      'Accepted'
                    ) : (
                      <NewButton text="accept" onClick={() => onAccept(offer)} />
                    )}
                    {/* <NewButton text="reject" onClick={onReject} /> */}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OfferList;
