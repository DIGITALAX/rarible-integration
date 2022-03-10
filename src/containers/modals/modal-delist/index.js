import React from "react";
import { createPortal } from "react-dom";
import Modal from "@components/modal";
import { useDispatch, useSelector } from "react-redux";
import { closeDelistModal, setIsDelistSuccess } from "@actions/modals.actions";
import bidActions from "@actions/bid.actions";
import { getModalParams } from "@selectors/modal.selectors";
import styles from "./styles.module.scss";
import globalActions from "@actions/global.actions";

const Delist = ({}) => {
  const dispatch = useDispatch();
  const { orderId } = useSelector(getModalParams);
  const handleClose = () => {
    dispatch(closeDelistModal());
  };

  const handleDelist = () => {
    dispatch(globalActions.setIsLoading(true));
    dispatch(bidActions.cancelSecondaryItem(orderId))
      .then((res) => {
        dispatch(setIsDelistSuccess(true));
        dispatch(globalActions.setIsLoading(false));
        handleClose();
      })
      .catch((err) => {
        console.log(err);
        dispatch(setIsDelistSuccess(false));
        dispatch(globalActions.setIsLoading(false));
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
          <div className={styles.contentWraper}>
            <p className={styles.description}>
              Click Delist below to take your NFT off the marketplace for sale.
              You will be asked to sign a transaction to confirm the delisting.
              <br />
              <br />
              <b>Some fashion is just to special to let others wear 😆</b>{" "}
            </p>

            <button className={styles.button} onClick={handleDelist}>
              DELIST
            </button>
          </div>
        </Modal>,
        document.body
      )}
    </>
  );
};

export default Delist;
