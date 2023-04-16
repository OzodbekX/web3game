import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { ethers, Contract } from "ethers";
import Web3Modal from "web3modal";
import { useNavigate } from "react-router-dom";
import { GetParams } from "../utils/onboard";
import { ABI, ADDRESS } from "../contract";
import { createEventListeners } from "./createEvemtListeners";
import styles from "../styles";
type TShowAlert = {
  status: boolean;
  type: keyof typeof styles;
  message: string;
};
type TGameData = {
  players?: any[];
  pendingBattles: any[];
  activeBattle: any;
};
const GlobalContext = createContext<{
  contract?: Contract;
  walletAddress?: string;
  battleGround?: string;
  battleName?: string;
  errorMessage?: any;
  player1Ref?: any;
  player2Ref?: any;
  showAlert?: TShowAlert;
  setShowAlert?: Dispatch<SetStateAction<TShowAlert>>;
  gameData?: TGameData;
  setBattleName?: (v: string) => void;
  updateCurrentWalletAddress?:() =>void;
  setErrorMessage?: (v: any) => void;
  setBattleGround?: (v: string) => void;
}>({});
export const GlobalContextProvider = ({ children }: any) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState<any>();
  const [contract, setContract] = useState<Contract>();
  const [battleName, setBattleName] = useState<string>();
  const [gameData, setGameData] = useState<TGameData>();
  const [updateGameData, setUpdateGameData] = useState<number>(0);
  const [battleGround, setBattleGround] = useState<string>("bg-astral");
  const [step, setStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<any>("");
  const [showAlert, setShowAlert] = useState<TShowAlert>({
    status: false,
    type: "info",
    message: "",
  });
  const navigate = useNavigate();
  const player1Ref = useRef();
  const player2Ref = useRef();

  useEffect(() => {
    const prevBattleground = localStorage?.getItem("battleground");
    if (prevBattleground) {
      setBattleGround(prevBattleground);
    } else {
      localStorage.setItem("battleground", battleGround);
    }
  }, []);

  //Reset acount params
  useEffect(() => {
    const resetParams = async () => {
      const currentStep = await GetParams();
      setStep(currentStep?.step);
    };
    resetParams();

    window?.ethereum?.on("chainChanged", () => resetParams());
    window?.ethereum?.on("accountsChanged", () => resetParams());
  }, []);

  //set wallet addres to state
  const updateCurrentWalletAddress = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    if (accounts) setWalletAddress(accounts[0]);
  };
  useEffect(() => {
    updateCurrentWalletAddress();
    window.ethereum?.on("accountsChanged", updateCurrentWalletAddress);
  }, []);

  //set smart contract and provider to state
  useEffect(() => {
    const setSmartContractAndProvider = async () => {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const newProvider = new ethers.providers.Web3Provider(connection);
      const signer = newProvider.getSigner();
      const newContract = new ethers.Contract(ADDRESS, ABI, signer);
      setProvider(newProvider);
      setContract(newContract);
    };
    const timer = setTimeout(() => setSmartContractAndProvider(), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (step !== -1 && contract) {
      createEventListeners({
        player1Ref,
        player2Ref,
        navigate,
        contract,
        provider,
        walletAddress,
        setShowAlert,
        setUpdateGameData,
      });
    }
  }, [contract, step]);

  useEffect(() => {
    if (showAlert?.status) {
      const timer = setTimeout(() => {
        setShowAlert({ status: false, type: "info", message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  //Handle error message

  useEffect(() => {
    if (errorMessage) {
      const parsedErrorMessage = errorMessage?.reason
        ?.slice("execution reverted: ".length)
        .slice(0, 1);
      if (parsedErrorMessage) {
        setShowAlert({
          status: true,
          type: "failure",
          message: parsedErrorMessage,
        });
      }
    }
  }, [errorMessage]);

  useEffect(() => {
    const fetchGameData = async () => {
      const fetchedBattles = await contract?.getAllBattles();
      const pendingBattles = fetchedBattles.filter(
        (battle: any) => battle.battleStatus === 0
      );
      let activeBattle = null;
      fetchedBattles.forEach((battle: any) => {
        if (
          battle.players.find(
            (player: any) =>
              player.toLowerCase() === walletAddress.toLocaleLowerCase()
          )
        ) {
          if (battle.winner.startsWith("0x00")) {
            activeBattle = battle;
          }
        }
      });
      debugger;
      setGameData({ pendingBattles: pendingBattles?.slice(1), activeBattle });
    };
    if (contract) fetchGameData();
  }, [contract, updateGameData]);

  return (
    <GlobalContext.Provider
      value={{
        contract,
        walletAddress,
        battleGround,
        setBattleGround,
        showAlert,
        setShowAlert,
        battleName,
        setBattleName,
        gameData,
        errorMessage,
        player1Ref,
        player2Ref,
        setErrorMessage,
        updateCurrentWalletAddress,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
export const useGlobalContext = () => useContext(GlobalContext);
