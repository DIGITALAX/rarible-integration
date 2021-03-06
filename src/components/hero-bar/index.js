import React from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';
import Filters from '@components/filters';

const HeroBar = ({ className, filter, setFilter, setSortBy, secondFilter, secondFilterChange }) => {
  const classes = classnames(styles.wrapper, className);
  return (
    <div className={classes}>
      <div className={styles.leftPane}>
        Can't Find What You're Looking For?
        <span>
          {' '}
          Get
          <br />
          <a href="https://designers.digitalax.xyz/getdressed/" target="_blank">
            {' '}
            Bespoke Dressed Here.
          </a>
        </span>
      </div>
      {setFilter || secondFilterChange ? (
        <div className={styles.filter}>
          <Filters
            secondFilter={secondFilter}
            secondFilterChange={secondFilterChange}
            filter={filter}
            filterChange={setFilter}
            sortByChange={setSortBy}
          />
        </div>
      ) : null}
    </div>
  );
};

export default HeroBar;
