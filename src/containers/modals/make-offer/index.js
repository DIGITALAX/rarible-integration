import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import Modal from '@components/modal';
import { closeMakeOfferModal, openOfferSucceeded } from '@actions/modals.actions';
import bidActions from '@actions/bid.actions';
import Loader from '@components/loader';
import { getModalParams } from '@selectors/modal.selectors';
import styles from './styles.module.scss';

const MakeOffer = () => {
  const [mona, setMona] = useState(0);
  const { id, orderId, tokenAddress } = useSelector(getModalParams);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const handleClose = () => {
    setMona(0);
    dispatch(closeMakeOfferModal());
  };

  const handleSuccess = () => {
    setMona(0);
    dispatch(closeMakeOfferModal());
    dispatch(
      openOfferSucceeded({
        id: orderId,
        contract: tokenAddress,
      }),
    );
  };

  const handleMakeOffer = () => {
    setLoading(true);
    dispatch(bidActions.addSecondaryMarketplaceProduct(tokenAddress, id, parseFloat(mona), 0))
      .then((res) => {
        setLoading(false);
        handleSuccess();
      })
      .catch((e) => {
        console.log({ e });
        setLoading(false);
        handleClose();
        throw e;
      });
  };

  return (
    <>
      {createPortal(
        <Modal title="Make Offer" titleStyle={styles.textCenter} onClose={handleClose}>
          {loading && <Loader active />}
          <div className={styles.contentWraper}>
            <p className={styles.description}>
              Make an offer on this item. If you want to own the item immediately, it’s best to buy
              instantly at the listed price. For all secondary sales there are allocations from the
              sale price of 3% to the DIGITALAX Treasury, 3% to DIGITALAX Token Stakers & 10% to the
              Original Designer.
            </p>
            <div className={styles.inputWrapper}>
              <input
                value={mona}
                type="number"
                onChange={(e) => {
                  setMona(e.target.value);
                }}
              />
              <span> $MONA </span>
            </div>
            <button className={styles.button} onClick={handleMakeOffer}>
              MAKE OFFER
            </button>
          </div>
        </Modal>,
        document.body,
      )}
    </>
  );
};

export default MakeOffer;
