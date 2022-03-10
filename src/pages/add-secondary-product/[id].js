import HeroSection from "@components/hero-section";
import SecondaryProduct from "@components/secondary-product";
import Link from "next/link";
import React from "react";
import styles from "./styles.module.scss";

const AddSecondaryProduct = () => {
  return (
    <>
      <div className={styles.wrapper}>
        <HeroSection
          title="Manage"
          subTitle="WEB3 FASHION INVENTORY"
          showHeroBar={false}
        />
        <Link href="/manage-inventory">
          <a className={styles.backBtn}>return to inventory</a>
        </Link>
        <div className={styles.description}>
          YOU can list your nft for sale on the marketplace. The DESIGNER WILL
          RECEIVE An automated 10% ROYALTY ON THE SALE OF THE ITEM, PERPETUALLY.
          IN ADDITION, A 3% royalty from the final secondary sale price is also
          awarded to the digitalax treasury and 3% to the $mona, $mona lp +
          Genesis mona nft stakers issued through the ADDITIONAL TOKEN REWARDS
          contracts.
          <br />
          <br />
          ONCE YOU LIST YOUR ITEM ON THE SECONDARY MARKETPLACE COLLECTORS WILL
          BE ABLE TO PURCHASE YOUR ITEM AT THE INSTANT BUY LISTED PRICE. YOU CAN
          DELIST OR UPDATE YOUR LISTING PRICE ANYTIME. EVEN AFTER YOU DELIST
          YOUR ITEM WILL STILL BE SHOWN ON THE MARKETPLACE WHERE ANYONE CAN MAKE
          PASSIVE OFFERS FOR YOU TO ACCEPT OR NOT.
        </div>
        <SecondaryProduct />
      </div>
    </>
  );
};

export default AddSecondaryProduct;
