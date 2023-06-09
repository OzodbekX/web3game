import React, { useEffect, useState } from "react";
import { CustomButton, CustomInput, PageHOC } from "../components";
import { useGlobalContext } from "../context";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { contract, walletAddress, gameData, setShowAlert, setErrorMessage } =
    useGlobalContext();
  const [playerName, setPlayerName] = useState("");
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      const playerExist = await contract?.isPlayer(walletAddress);
      if (!playerExist) {
        await contract?.registerPlayer(playerName, playerName, {
          gasLimit: 200000,
        });
        setShowAlert &&
          setShowAlert({
            status: true,
            type: "info",
            message: `${playerName} is being summoned`,
          });
      }
    } catch (error) {
      setErrorMessage && setErrorMessage(error);
    }
  };

  useEffect(() => {
    const checkForPlayerToken = async () => {
      const playerExist = await contract?.isPlayer(walletAddress);
      const playerTokenExist = await contract?.isPlayerToken(walletAddress);
      if (playerExist && playerTokenExist) {
        navigate("/create-battle");
      }
    };
    if (contract) checkForPlayerToken();
  }, [contract, walletAddress]);

  useEffect(() => {
    if (gameData?.activeBattle)
      navigate(`/battle/${gameData?.activeBattle?.name}`);
  }, [gameData]);

  return (
    <div className="flex flex-col">
      <CustomInput
        label="Name"
        placeholder="Enter your player name"
        value={playerName}
        handleValueChange={setPlayerName}
      />
      <CustomButton
        tittle="Register"
        handleClick={handleClick}
        restStyles="mt-6"
      />
    </div>
  );
};

export default PageHOC(
  Home,
  <>
    Welcome to Avax <br />a Web3 NFT Card Game
  </>,
  <>
    Connect your wallet to start playing <br /> the ultimate Web3 Battle Card
    Game
  </>
);
