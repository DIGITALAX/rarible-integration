import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./styles.module.scss";
import NewButton from "@components/buttons/newbutton";
import { useDispatch } from "react-redux";
import apiService from "@services/api/espa/api.service";
import bidActions from "@actions/bid.actions";
import {
  getActivitiesByItem,
  getOrderBidsByItem,
} from "@services/api/rarible.service";
import globalActions from "@actions/global.actions";
import { useRouter } from "next/router";

const OfferList = ({ itemId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchOfferList = async () => {
      const { orders } = await getOrderBidsByItem(`POLYGON:${itemId}`);
      const { activities } = await getActivitiesByItem(itemId, "BID");
      const allUsers = await apiService.getAllUsersName();
      setOffers([
        ...orders.map((order) => {
          return {
            ...order,
            hash: activities.find(
              (activity) => activity.date === order.createdAt
            ).hash,
          };
        }),
      ]);
      setUsers(allUsers);
    };

    if (itemId) {
      fetchOfferList();
    }
  }, [itemId]);

  const onAccept = (offer) => {
    dispatch(globalActions.setIsLoading(true));
    dispatch(bidActions.secondaryAcceptBid(offer.id))
      .then((res) => {
        dispatch(globalActions.setIsLoading(false));
        router.push("/inventories");
        console.log({ res });
      })
      .catch((err) => {
        dispatch(globalActions.setIsLoading(false));
        console.log({ err });
      });
  };

  // const onReject = () => {
  //   dispatch(openRejectOfferModal());
  // };

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>Item Offers</div>

      <table className={styles.offerList}>
        <thead>
          <tr>
            <th style={{ width: "20%" }}> OFFER AMOUNT </th>
            <th style={{ width: "5%" }}> </th>
            <th style={{ width: "22.5%" }}> from </th>
            <th style={{ width: "22.5%" }}> tx </th>
            <th style={{ width: "20%" }}> date </th>
            <th style={{ width: "10%" }}> status </th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => {
            const user = users.find(
              (user) => user.wallet?.toLowerCase() === offer.maker.split(":")[1]
            );
            return (
              <tr>
                <td> {parseFloat(offer.takePrice).toFixed(2)} $MONA </td>
                <td>
                  {" "}
                  <img
                    src={
                      user && user?.avatar
                        ? user.avatar
                        : "/images/image 450.png"
                    }
                  />{" "}
                </td>
                <td>
                  {" "}
                  {user ? (
                    <Link href={`/user/${user.wallet}/`}>
                      <a>{user.wallet.slice(0, 10)}...</a>
                    </Link>
                  ) : (
                    <>{offer.maker.split(":")[1].slice(0, 10)}...</>
                  )}{" "}
                </td>
                <td>
                  {" "}
                  <a
                    href={`https://polygonscan.com/tx/${offer.hash}`}
                    target="_blank"
                  >
                    {offer.hash.slice(0, 10)}...
                  </a>{" "}
                </td>
                <td> {new Date(offer.createdAt).toDateString()} </td>
                <td>
                  <div className={styles.btnWrapper}>
                    {offer.executedTokenIds?.includes(tokenId) ? (
                      "Accepted"
                    ) : (
                      <NewButton
                        text="accept"
                        onClick={() => onAccept(offer)}
                      />
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
