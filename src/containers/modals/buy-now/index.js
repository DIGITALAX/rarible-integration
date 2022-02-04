import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BigNumber, utils as ethersUtils } from 'ethers';
import { getMonaPerEth, getChainId } from '@selectors/global.selectors';
import PropTypes from 'prop-types';
import Button from '@components/buttons/button';
import Modal from '@components/modal';
import {
  closeBuynowModal,
  openESPAReadyModal,
  openPurchaseSuccessModal,
} from '@actions/modals.actions';
import Loader from '@components/loader';
import bidActions from '@actions/bid.actions';
import { getModalParams } from '@selectors/modal.selectors';
import { removeZeros } from '@helpers/price.helpers';
import styles from './styles.module.scss';

const BuyNow = ({ className, title, buttonText1, buttonText2 }) => {
  const dispatch = useDispatch();
  const requests = useRef([]);

  const { id, priceEth, secondary, orderId, tokenAddress } = useSelector(getModalParams);
  const chainId = useSelector(getChainId);
  const isMatic = chainId === '0x13881' || chainId === '0x89';
  const [loading, setLoading] = useState(false);
  const monaPerEth = useSelector(getMonaPerEth);

  const [isDisabled, setIsDisabled] = useState(false);
  const [showError, setShowError] = useState(null);
  const [approved, setApproved] = useState(false);

  const handleClose = () => {
    dispatch(closeBuynowModal());
  };

  const handleSuccess = () => {
    handleClose();
    dispatch(openPurchaseSuccessModal());
    // dispatch(openESPAReadyModal());
  };

  const handleClick = (mode) => {
    setShowError(null);
    setIsDisabled(true);
    setLoading(true);
    if (!secondary) {
      dispatch(bidActions.buyNow(id, priceEth, mode === 0)).then((request) => {
        requests.current.push(request);
        request.promise
          .then(() => {
            if (mode === 0 && approved === false) {
              setApproved(true);
              setIsDisabled(false);
              setLoading(false);
            } else {
              handleSuccess();
            }
          })
          .catch((e) => {
            setShowError(e.message);
            setIsDisabled(false);
            setLoading(false);
          });
      });
    } else {
      dispatch(bidActions.secondaryBuyNow(id, orderId.split('-')[1], tokenAddress, priceEth))
        .then(() => {
          handleSuccess();
          setIsDisabled(false);
          setLoading(false);
        })
        .catch((e) => {
          setShowError(e.message);
          setIsDisabled(false);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    async function getMonaApproval() {
      if (!secondary) {
        dispatch(bidActions.getApprovedInMona()).then((val) => {
          setApproved(val);
        });
      } else {
        dispatch(bidActions.getSecondaryApprovedInMona()).then((val) => {
          setApproved(val);
        });
      }
    }

    getMonaApproval();

    return () => {
      requests.current.forEach((request) => request.unsubscribe());
      requests.current = [];
    };
  }, []);

  // if (loading) {
  //   return <Loader active />;
  // }

  console.log('priceEth:1 ', parseFloat(priceEth).toFixed(18))

  return (
    <>
      {createPortal(
        <Modal
          onClose={() => handleClose()}
          title={title}
          titleStyle={styles.textCenter}
          className={className}
        >
          {loading && <Loader active />}
          <div className={styles.footer}>
            <p className={styles.footerCaption}>
              <span>
                Need to top up $MONA? You can get it from{' '}
                <a href="https://uniswap.org/" target="_blank">
                  Uniswap
                </a>{' '}
                and bridge it to Polygon with our customer{' '}
                <a href="https://skins.digitalax.xyz/bridge/" target="_blank">
                  Multi-Token Bridge
                </a>
                . Or, purchase it directly from{' '}
                <a href="https://quickswap.exchange/" target="_blank">
                  Quickswap
                </a>
                .
              </span>
            </p>
            <div className={styles.selectWrapper}>
              <span>{removeZeros(`${parseFloat(priceEth).toFixed(4)}`)} $MONA</span>
              <Button
                isDisabled={isDisabled || !isMatic}
                onClick={() => handleClick(approved ? 1 : 0)}
                className={styles.button}
              >
                {approved ? buttonText1 : 'APPROVE $MONA'}
              </Button>
            </div>
            {showError && <p className={styles.error}>{showError}</p>}
          </div>
        </Modal>,
        document.body,
      )}
    </>
  );
};

BuyNow.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  buttonText1: PropTypes.string,
  buttonText2: PropTypes.string,
};

BuyNow.defaultProps = {
  className: '',
  title: 'BUY NOW',
  buttonText1: 'USE $MONA',
  buttonText2: 'USE ETH',
};

export default BuyNow;
