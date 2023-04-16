import React, { FC } from "react";
import { AlertIcon } from "../assets";
import styles from "../styles";

const Alert: FC<{ type: keyof typeof styles; message: string }> = ({
  type,
  message,
}) => (
  <div className={`${styles.alertContainer} ${styles.flexCenter}`}>
    <div className={`${styles.alertWrapper} ${styles[type]}`} role="alert">
      <AlertIcon type={type} /> {message}
    </div>
  </div>
);

export default Alert;
