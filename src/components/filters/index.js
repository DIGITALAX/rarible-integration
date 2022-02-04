import React, { useState } from 'react';
import styles from './styles.module.scss';

const Filters = ({
  secondFilter = null,
  secondFilterChange,
  filter,
  filterChange,
  sortByChange,
  showType = false,
  setType,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showTypeDown, setShowTypeDown] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState(0);
  const [currentSelectedType, setCurrentSelectedType] = useState(0);
  const [currentSelectedSecondary, setCurrentSelectedSecondary] = useState(0);

  const filterItems = [
    ' ',
    ' most recent ',
    ' highest price ',
    ' lowest price ',
    ' sold ',
    ' auction ',
    ' instant buy ',
    ' exclusive rarity ',
    ' semi-rare rarity ',
    ' common rarity ',
  ];

  const types = ['', 'Primary', 'Secondary'];

  const secondary = ['', 'Live Listings', 'Offers On Your Items', 'Offers You Have Made'];

  const onClickItem = (e) => {
    const value = e.getAttribute('data-value');
    setCurrentSelectedIndex(value);
    sortByChange(value);
    setShowFilters(false);
  };

  return (
    <>
      {!secondFilterChange ? (
        <div className={styles.actions}>
          {showType && (
            <div className={styles.typeWrapper}>
              <div className={styles.sortLabel}>type</div>
              <div
                className={styles.sortInput}
                onClick={() => {
                  setShowTypeDown(!showTypeDown);
                }}
              >
                <div className={styles.currentItem}>
                  <span>{types[currentSelectedType]}</span>
                  <img
                    className={styles.arrowBottomImg}
                    src="./images/icons/arrow-bottom.svg"
                    alt="arrow-bottom"
                  />
                </div>
                <ul className={showTypeDown ? styles.show : styles.hidden}>
                  {types.map((item, index) => {
                    return (
                      <li
                        key={index}
                        data-value={`${index}`}
                        onClick={(e) => {
                          const value = e.target.getAttribute('data-value');
                          setType(value);
                          setCurrentSelectedType(value);
                          setShowTypeDown(false);
                        }}
                      >
                        {item}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
          <div className={styles.filterWrapper}>
            <div className={styles.filterLabel}>
              filter
              <div className={styles.helper}>
                <span className={styles.questionMark}>?</span>
                <span className={styles.description}>
                  FILTER BY DESIGNER, OUTFIT NAME OR COLLECTOR ID
                </span>
              </div>
            </div>
            <div className={styles.filterInput}>
              <input
                className={styles.filter}
                value={filter}
                onChange={(e) => filterChange(e.target.value)}
              />
              <img src="/images/filter1.png" />
            </div>
          </div>
          <div className={styles.sortWrapper}>
            <div className={styles.sortLabel}>sort by</div>
            <div
              className={styles.sortInput}
              onClick={() => {
                setShowFilters(!showFilters);
              }}
            >
              <div className={styles.currentItem}>
                <span>{filterItems[currentSelectedIndex]}</span>
                <img
                  className={styles.arrowBottomImg}
                  src="./images/icons/arrow-bottom.svg"
                  alt="arrow-bottom"
                />
              </div>
              <ul className={showFilters ? styles.show : styles.hidden}>
                {filterItems.map((item, index) => {
                  return (
                    <li key={index} data-value={`${index}`} onClick={(e) => onClickItem(e.target)}>
                      {item}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.actions}>
          <div className={styles.filterWrapper}>
            <div className={styles.filterLabel}>
              filter
              <div className={styles.helper}>
                <span className={styles.questionMark}>?</span>
                <span className={styles.description}>
                  FILTER BY DESIGNER, OUTFIT NAME OR COLLECTOR ID
                </span>
              </div>
            </div>
            <div className={styles.filterInput}>
              <input
                className={styles.filter}
                value={filter}
                onChange={(e) => filterChange(e.target.value)}
              />
              <img src="/images/filter1.png" />
            </div>
          </div>
          <div className={styles.secondaryWrapper}>
            <div className={styles.sortLabel}>Sort By</div>
            <div
              className={styles.sortInput}
              onClick={() => {
                setShowSecondary(!showSecondary);
              }}
            >
              <div className={styles.currentItem}>
                <span>{secondary[currentSelectedSecondary]}</span>
                <img
                  className={styles.arrowBottomImg}
                  src="./images/icons/arrow-bottom.svg"
                  alt="arrow-bottom"
                />
              </div>
              <ul className={showSecondary ? styles.show : styles.hidden}>
                {secondary.map((item, index) => {
                  return (
                    <li
                      key={index}
                      data-value={`${index}`}
                      onClick={(e) => {
                        const value = e.target.getAttribute('data-value');
                        secondFilterChange(value);
                        setCurrentSelectedSecondary(value);
                        setShowSecondary(false);
                      }}
                    >
                      {item}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Filters;
