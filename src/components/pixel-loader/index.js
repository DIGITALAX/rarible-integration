import React from 'react';
import styles from './styles.module.scss';

const PixelLoader = (props) => {
  const { title } = props;
  return (
    <div className={styles.pixelLoaderWrapper}>
      <h2> {title} </h2>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default PixelLoader;
