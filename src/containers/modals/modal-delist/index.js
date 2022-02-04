import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Modal from '@components/modal';
import { useDispatch, useSelector } from 'react-redux';
import {
  closeDelistModal,
  setIsDelistSuccess,
  setIsSecondaryProductUpdate,
} from '@actions/modals.actions';
import Loader from '@components/loader';
import bidActions from '@actions/bid.actions';
import { getModalParams } from '@selectors/modal.selectors';
import styles from './styles.module.scss';

const Delist = ({}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { tokenAddress, orderId } = useSelector(getModalParams);
  const handleClose = () => {
    dispatch(closeDelistModal());
  };

  const handleDelist = () => {
    setLoading(true);
    dispatch(bidActions.delistSecondaryNft(tokenAddress, orderId))
      .then((res) => {
        dispatch(setIsDelistSuccess(true));
        dispatch(setIsSecondaryProductUpdate(0));
        setLoading(false);
        handleClose();
      })
      .catch((err) => {
        console.log(err);
        dispatch(setIsDelistSuccess(false));
        setLoading(false);
        handleClose();
        throw err;
      });
  };

  return (
    <>
      {createPortal(
        <Modal
          title="Are you sure you want to delist your NFT?"
          titleStyle={styles.textCenter}
          onClose={handleClose}
        >
          {loading && <Loader active />}
          <div className={styles.contentWraper}>
            <p className={styles.description}>
              Click Delist below to take your NFT off the marketplace for sale. You will be asked to
              sign a transaction to confirm the delisting.
              <br />
              <br />
              <b>Some fashion is just to special to let others wear 😆</b>{' '}
            </p>

            <button className={styles.button} onClick={handleDelist}>
              DELIST
            </button>
          </div>
        </Modal>,
        document.body,
      )}
    </>
  );
};

export default Delist;
