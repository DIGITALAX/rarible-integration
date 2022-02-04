import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import Modal from '@components/modal';
import {
  closeMakeOfferModal,
  closeOfferSucceeded,
  openSecondaryPurchaseHistory,
} from '@actions/modals.actions';
import bidActions from '@actions/bid.actions';
import { getModalParams } from '@selectors/modal.selectors';
import styles from './styles.module.scss';

const OfferSucceeded = () => {
  const { id, contract } = useSelector(getModalParams);
  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(closeOfferSucceeded());
  };

  return (
    <>
      {createPortal(
        <Modal title="OFFER SUBMITTED!" titleStyle={styles.textCenter} onClose={handleClose}>
          <div className={styles.contentWraper}>
            <p className={styles.description}>
              Congratulations! Your offer was submitted. You can check all offers in{' '}
              <a href="/manage-inventory">Manage Inventory </a> and view previous offers on this
              item{' '}
              <text
                onClick={() => {
                  dispatch(closeOfferSucceeded());
                  dispatch(
                    openSecondaryPurchaseHistory({
                      tokenIds: id,
                      contract,
                      type: 2,
                    }),
                  );
                }}
              >
                here
              </text>
              .
            </p>
            <button className={styles.button} onClick={handleClose}>
              OKAY!
            </button>
          </div>
        </Modal>,
        document.body,
      )}
    </>
  );
};

export default OfferSucceeded;
