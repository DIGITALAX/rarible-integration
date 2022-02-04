import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@components/modal';
import styles from './styles.module.scss';
import { closeSecondaryPurchaseHistory } from '@actions/modals.actions';
import { getModalParams } from '@selectors/modal.selectors';
import {
  getDigitalaxMarketplaceV2PurchaseHistories,
  getSecondaryOrderByContractTokenAndBuyorsell,
  getTradesByOrderId,
} from '@services/api/apiService';
import { getChainId } from '@selectors/global.selectors';
import Loader from '@components/loader';
import { getEnabledNetworkByChainId } from '@services/network.service';
import config from '@utils/config';
import { removeZeros } from '@helpers/price.helpers';

const SecondaryHistory = ({ className, title }) => {
  const dispatch = useDispatch();
  const { tokenIds, contract, type, nftIds } = useSelector(getModalParams);
  const chainId = useSelector(getChainId);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleClose = () => {
    dispatch(closeSecondaryPurchaseHistory());
  };

  useEffect(() => {
    if (tokenIds.length) {
      const fetchHistories = async () => {
        const network = getEnabledNetworkByChainId(chainId);
        if (type === 1) {
          const { trades } = await getTradesByOrderId(config.NIX_URL[network.alias], tokenIds);
          const { digitalaxMarketplaceV2PurchaseHistories } =
              await getDigitalaxMarketplaceV2PurchaseHistories(chainId, nftIds);
          setHistory([...trades, ...digitalaxMarketplaceV2PurchaseHistories]);
          setLoading(false);
        } else {
          const { orders } = await getSecondaryOrderByContractTokenAndBuyorsell(
            config.NIX_URL[network.alias],
            contract,
            tokenIds,
            'Buy',
          );

          setHistory(orders);
          setLoading(false);
        }
      };

      fetchHistories();
    }
  }, []);

  const sortHistory = (data) => {
    return data.sort((a, b) => {
      if (parseInt(a.timestamp) > parseInt(b.timestamp)) return 1;
      if (parseInt(a.timestamp) == parseInt(b.timestamp)) return 0;
      return -1;
    });
  };

  return (
    <>
      {loading ? (
        <Loader active={loading} />
      ) : (
        <>
          {createPortal(
            <Modal
              onClose={() => handleClose()}
              title={`${type === 2 ? 'Bid' : 'Purchase'} ${title}`}
              titleStyle={styles.textCenter}
              className={className}
            >
              <div className={styles.tableWrapper}>
                <table className={styles.historyTable}>
                  <thead>
                    <th> {type === 2 ? 'BID' : 'PURCHASE'} </th>
                    <th> FROM </th>
                    <th> TX </th>
                    <th> DATE </th>
                  </thead>
                  <tbody>
                    {sortHistory(history).map((tx) => (
                      <tr>
                        <td>
                          {' '}
                          {removeZeros(
                            (type === 1
                              ? tx.orders 
                                ? Number(tx.orders[0].price / 10 ** 18)
                                : Number(tx.value / 10 ** 18)
                              : Number(tx.price / 10 ** 18)
                            ).toFixed(18),
                          )}{' '}
                          $MONA{' '}
                        </td>
                        <td> {type === 2 ? tx.maker.slice(0, 8) : tx.taker ? tx.taker?.slice(0, 8) : tx.buyer?.slice(0, 8)}... </td>
                        <td>
                          {' '}
                          <a
                            href={`https://polygonscan.com/tx/${
                              type === 1 ? tx.executedTxHash || tx.transactionHash : tx.createdTxHash
                            }`}
                            target="_blank"
                          >
                            {' '}
                            {(type === 1 ? tx.executedTxHash || tx.transactionHash : tx.createdTxHash).slice(
                              0,
                              8,
                            )}...{' '}
                          </a>{' '}
                        </td>
                        <td> {new Date(parseInt(tx.timestamp) * 1000).toDateString()} </td>
                      </tr>
                    ))}
                    {!history.length && (
                      <tr>
                        {' '}
                        <td colSpan="4">No History</td>{' '}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Modal>,
            document.body,
          )}
        </>
      )}
    </>
  );
};

SecondaryHistory.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
};

SecondaryHistory.defaultProps = {
  className: '',
  title: 'History',
};

export default SecondaryHistory;
