import React, { FC } from "react";
import styles from "../styles";
const regex = /^[A-Za-z0-9]+$/;
const CustomInput: FC<{
  label: string;
  value?: string;
  handleValueChange?: (v: string) => void;
  placeholder: string;
}> = ({ label, placeholder, value, handleValueChange }) => {
  return (
    <>
      <label htmlFor="name" className={styles.label}>
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        className={styles.input}
        onChange={(e) => {
          if (e.target.value === "" || regex.test(e.target.value)) {
            handleValueChange && handleValueChange(e.target.value);
          }
        }}
      />
    </>
  );
};

export default CustomInput;
