import React from 'react';
import { createPortal } from 'react-dom';
import Modal from '@components/modal';
import { useDispatch } from 'react-redux';
import { closeRejectOfferModal } from '@actions/modals.actions';
import styles from './styles.module.scss';

const RejectOffer = ({}) => {
  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(closeRejectOfferModal());
  };

  const handleReject = () => {};

  return (
    <>
      {createPortal(
        <Modal title="Reject Offer" titleStyle={styles.textCenter} onClose={handleClose}>
          <div className={styles.contentWraper}>
            <p className={styles.description}>Are you sure you want to reject this offer?</p>

            <button className={styles.button} onClick={handleReject}>
              REJECT OFFER
            </button>
          </div>
        </Modal>,
        document.body,
      )}
    </>
  );
};

export default RejectOffer;
