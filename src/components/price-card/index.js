import React from "react";
import styles from "./styles.module.scss";

const PriceCard = ({ mode = 0, mainText, subText }) => {
  const images = [
    "",
    "./images/metaverse/gray_button3.png",
    "./images/metaverse/yellow_price_card.png",
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.mainWrapper}>
        {images[mode] !== "" && (
          <img src={images[mode]} className={styles.backImage} />
        )}
        <div className="w-full h-full absolute top-0 flex align-items-center justify-center flex-wrap-reverse">
          <p className="font-primary lg:text-3xl md:text-2xl text-xl text-white font-bold">
            {" "}
            {mainText}{" "}
          </p>
        </div>
      </div>
      {subText ? (
        <p className="font-primary font-xs text-center font-normal uppercase text-white text-white">
          {" "}
          {subText}{" "}
        </p>
      ) : null}
    </div>
  );
};

export default PriceCard;
