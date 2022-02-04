import NewButton from "@components/buttons/newbutton";
import cn from "classnames";
import Link from "next/link";
import React from "react";
import CollectionInfoCard from "./collection-info-card";
import styles from "./styles.module.scss";

const CollectionCard = ({ collection }) => {
  const collectionNames = [
    "Among Us",
    "MineCraft",
    "",
    "GDN DAO Endowment Auction",
    "Haute Couture",
    "Crazy Shoes",
    "DeFi Fashion",
    "Wild Web3",
    "Web3 Digi Models",
    "Jewelry and Accessories",
    "International",
    "Fashion x Art",
    "Seasonal Styles",
    "Fantastical Chic",
    "Trash Fashion",
    "Fashion Hackathon",
    "Meta Spree",
    "Whimsical Stitches",
    "Elegant Threads",
    "Alien Collection",
    "Interspace Weaving",
    "Miami NFT Basel",
    "",
    "",
    "Miami Fashion Heist Auction",
    "Textile Virtuality",
    "",
    "Raw Apparel",
    "Fabric Factions",
  ];

  return (
    <>
      <div className={cn("xl:w-128 md:w-100 sm:w-96 w-96", styles.wrapper)}>
        <div className="font-primary py-8 xl:text-5xl lg:text-4xl md:text-3xl text-3xl text-white font-extrabold">
          {collectionNames[parseInt(collection?.id)]}
        </div>
        <div
          className={cn("xl:h-128 md:h-100 sm:h-96 h-96", styles.imageWrapper)}
        >
          {collection?.id !== "15" &&
          collection.endTime &&
          parseInt(collection.endTime) < Date.now() / 1000 ? (
            <NewButton
              className={styles.soldOut}
              text="Sold out"
              disable
              backgroundType={1}
            />
          ) : null}
          <Link href={`/marketplace/all/${collection.id}`}>
            <a className={styles.image}>
              {collection?.animation ? (
                <video autoPlay muted loop>
                  <source src={collection?.animation} type="video/mp4" />
                </video>
              ) : (
                <img src={collection?.image} className={styles.innerImage} />
              )}
            </a>
          </Link>
        </div>
        <CollectionInfoCard collection={collection} />
      </div>
    </>
  );
};

export default CollectionCard;
