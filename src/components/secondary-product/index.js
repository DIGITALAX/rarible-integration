import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ImageCard from "@components/image-card";
import NewButton from "@components/buttons/newbutton";
import { useDispatch, useSelector } from "react-redux";
import {
  openDelistModal,
  setIsDelistSuccess,
  setIsSecondaryProductUpdate,
} from "@actions/modals.actions";
import styles from "./styles.module.scss";
import OfferList from "./offer-list";
import Loader from "@components/loader";
import bidActions from "@actions/bid.actions";
import globalActions from "@actions/global.actions";
import { getRaribleNftDataFromMeta } from "@utils/rarible";
import { getItemById } from "@services/api/rarible.service";

const SecondaryProduct = () => {
  const dispatch = useDispatch();
  const route = useRouter();
  const { id } = route.query;
  const { isDelistSuccess, isSecondaryProductUpdate } = useSelector((state) =>
    state.modals.toJS()
  );
  const [product, setProduct] = useState();
  const [monaPrice, setMonaPrice] = useState(0);
  const [updateError, setUpdateError] = useState(false);

  const fetchProduct = async () => {
    dispatch(globalActions.setIsLoading(true));
    const token = await getItemById(`POLYGON:${id}`);
    if (token.bestSellOrder?.makePrice) {
      setMonaPrice(token.bestSellOrder.makePrice);
    } else {
      setMonaPrice(0);
    }
    setProduct({
      ...token,
      nftData: getRaribleNftDataFromMeta(token.meta),
    });
    dispatch(globalActions.setIsLoading(false));
  };

  useEffect(() => {
    if (isDelistSuccess || isSecondaryProductUpdate || updateError) {
      setTimeout(() => {
        dispatch(setIsDelistSuccess(false));
        dispatch(setIsSecondaryProductUpdate(0));
        setUpdateError(false);
      }, 4000);
    }
  }, [isDelistSuccess, isSecondaryProductUpdate, updateError]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    if (isDelistSuccess || isSecondaryProductUpdate) {
      fetchProduct();
    }
  }, [isDelistSuccess, isSecondaryProductUpdate]);

  const onDelist = async () => {
    if (product.bestSellOrder.id) {
      dispatch(
        openDelistModal({
          orderId: product.bestSellOrder.id,
        })
      );
    }
  };

  const onList = async (monaPrice) => {
    if (!product?.bestSellOrder) {
      dispatch(globalActions.setIsLoading(true));
      dispatch(bidActions.addSecondaryMarketplaceProduct(id, monaPrice))
        .then((res) => {
          dispatch(globalActions.setIsLoading(false));
          dispatch(setIsSecondaryProductUpdate(1));
        })
        .catch((e) => {
          dispatch(setIsSecondaryProductUpdate(0));
          dispatch(globalActions.setIsLoading(false));
          console.log({ e });
        });
    } else {
      if (monaPrice > product.bestSellOrder.makePrice) {
        setUpdateError(true);
      } else {
        dispatch(globalActions.setIsLoading(true));
        dispatch(
          bidActions.updateSecondaryMarketplaceOrder(
            product?.bestSellOrder.id,
            monaPrice
          )
        )
          .then((res) => {
            dispatch(globalActions.setIsLoading(false));
            dispatch(setIsSecondaryProductUpdate(2));
          })
          .catch((e) => {
            dispatch(setIsSecondaryProductUpdate(0));
            dispatch(globalActions.setIsLoading(false));
            console.log({ e });
          });
      }
    }
  };

  if (!product) {
    return <Loader active />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.topSection}>
        <ImageCard
          showCollectionName
          data={product.nftData}
          showButton={false}
        />
      </div>
      <div className={styles.bottomSection}>
        {product?.bestSellOrder && (
          <NewButton
            text="delist"
            className={styles.delistBtn}
            onClick={onDelist}
          />
        )}
        <div className={styles.title}>List NFT On Marketplace</div>
        <div className={styles.formGroup}>
          <div className={styles.formLabel}>
            what PRICE WOULD YOU LIKE TO LIST THE ITEM FOR?
          </div>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={monaPrice}
              onChange={(e) => setMonaPrice(e.target.value)}
            />
            <div className={styles.prefix}> $MONA </div>
          </div>
        </div>
        <button
          type="button"
          className={styles.listBtn}
          onClick={() => onList(monaPrice)}
        >
          {product.bestSellOrder ? "update listing" : "list on marketplace"}
        </button>

        {!!isSecondaryProductUpdate && (
          <>
            {isSecondaryProductUpdate === 1 ? (
              <div className={styles.details}>
                SUCCESS! YOUR ITEM IS NOW LIVE ON THE MARKETPLACE.
                <br />
                <a href={`/secondary-product/${id.replace("_", "-")}`}>
                  VIEW YOUR ITEM LIVE HERE
                </a>
              </div>
            ) : (
              <div className={styles.details}>
                SUCCESS! YOU HAVE UPDATED YOUR LISTING PRICE.
                <br />
                <a href={`/secondary-product/${id.replace("_", "-")}`}>
                  VIEW YOUR ITEM LIVE HERE
                </a>
              </div>
            )}
          </>
        )}
        {isDelistSuccess && (
          <div className={styles.details}>
            SUCCESS! YOUR ITEM was delisted from the
            <br /> marketplace. you can relist at any time.
          </div>
        )}
        {updateError && (
          <div className={styles.details}>
            Error! Update price is greator than current price. <br />
            Please delist and list again.
          </div>
        )}
      </div>

      <OfferList
        itemId={`${product.bestSellOrder?.make.type.contract.split(":")[1]}:${
          product.bestSellOrder?.make.type.tokenId
        }`}
        orderId={product?.bestSellOrder?.id}
      />
    </div>
  );
};

export default SecondaryProduct;
