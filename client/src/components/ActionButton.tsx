import React, { FC } from "react";

import styles from "../styles";

const ActionButton: FC<{
  imgUrl: string;
  handleClick: any;
  restStyles: string;
}> = ({ imgUrl, handleClick, restStyles }) => (
  <div
    className={`${styles.gameMoveBox} ${styles.flexCenter} ${styles.glassEffect} ${restStyles} `}
    onClick={handleClick}
  >
    <img src={imgUrl} alt="action_img" className={styles.gameMoveIcon} />
  </div>
);

export default ActionButton;
