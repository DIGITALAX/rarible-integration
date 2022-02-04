import CollectionCard from "@components/collection-card";
import React from "react";

const CollectionList = ({ items }) => {
  return (
    <>
      <div className="container mx-auto">
        <div className="grid p-8 grid-cols-1 lg:grid-cols-2 gap-16">
          {items.map((item, index) => (
            <CollectionCard collection={item} key={item.id} />
          ))}
        </div>
      </div>
    </>
  );
};

export default CollectionList;
