import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import Modal from "@components/modal";
import styles from "./styles.module.scss";
import { closeSecondaryPurchaseHistory } from "@actions/modals.actions";
import { getModalParams } from "@selectors/modal.selectors";
import Loader from "@components/loader";
import { getActivitiesByItem } from "@services/api/rarible.service";

const SecondaryHistory = ({ className, title }) => {
  const dispatch = useDispatch();
  const { itemId, type } = useSelector(getModalParams);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleClose = () => {
    dispatch(closeSecondaryPurchaseHistory());
  };

  useEffect(() => {
    if (itemId) {
      const fetchHistories = async () => {
        const { activities } = await getActivitiesByItem(itemId, type);
        setHistory(activities);
        setLoading(false);
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

  const removeBlockchainFromBuyer = (buyer) => {
    return buyer.split(":")[1];
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
              title={`${type === "BID" ? "Bid" : "Purchase"} ${title}`}
              titleStyle={styles.textCenter}
              className={className}
            >
              <div className={styles.tableWrapper}>
                <table className={styles.historyTable}>
                  <thead>
                    <th> {type === "BID" ? "BID" : "PURCHASE"} </th>
                    <th> FROM </th>
                    <th> TX </th>
                    <th> DATE </th>
                  </thead>
                  <tbody>
                    {sortHistory(history).map((tx) => (
                      <tr>
                        <td> {parseFloat(tx.price)} $MONA </td>
                        <td>
                          {" "}
                          {removeBlockchainFromBuyer(
                            tx.buyer || tx.maker
                          ).slice(0, 8)}
                          ...{" "}
                        </td>
                        <td>
                          {" "}
                          <a
                            href={`https://polygonscan.com/tx/${
                              tx.blockchainInfo?.transactionHash ?? tx.hash
                            }`}
                            target="_blank"
                          >
                            {" "}
                            {(
                              tx.blockchainInfo?.transactionHash ?? tx.hash
                            ).slice(0, 8)}
                            ...{" "}
                          </a>{" "}
                        </td>
                        <td> {new Date(tx.date).toDateString()} </td>
                      </tr>
                    ))}
                    {!history.length && (
                      <tr>
                        {" "}
                        <td colSpan="4">No History</td>{" "}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Modal>,
            document.body
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
  className: "",
  title: "History",
};

export default SecondaryHistory;
