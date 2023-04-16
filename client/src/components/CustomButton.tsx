import React, { FC } from "react";
import styles from "../styles";
const CustomButton: FC<{
  tittle: string;
  handleClick: () => void;
  restStyles?: string;
}> = ({ tittle, restStyles="", handleClick }) => {
  return (
    <button
      className={`${styles.btn} ${restStyles}`}
      type="button"
      onClick={handleClick}
    >
      {tittle}
    </button>
  );
};

export default CustomButton;
