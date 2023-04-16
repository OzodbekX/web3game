import { ethers, Contract, providers } from "ethers";
import { ABI } from "../contract";
import { defenseSound } from "../assets";
import { playAudio, sparcle } from "../utils/animation.js";
const emptyAccount = "0x0000000000000000000000000000000000000000";

const AddNewEvent = (eventFilter: any, provider: any, cb: any) => {
  provider.removeListener(eventFilter);
  provider.on(eventFilter, (Logs: any) => {
    const parsedLog = new ethers.utils.Interface(ABI).parseLog(Logs);
    cb(parsedLog);
  });
};
export const createEventListeners = ({
  navigate,
  contract,
  provider,
  walletAddress,
  setShowAlert,
  setUpdateGameData,
  player1Ref,
  player2Ref,
}: {
  navigate: any;
  contract: Contract;
  provider: any;
  player1Ref: any;
  player2Ref: any;
  walletAddress: any;
  setShowAlert: any;
  setUpdateGameData: any;
}) => {
  const NewPlayerEventFilter = contract.filters.NewPlayer();
  AddNewEvent(NewPlayerEventFilter, provider, (args: any) => {
    console.log("New player created", args);
    if (walletAddress.toLowerCase() === args.owner.toLowerCase()) {
      setShowAlert({
        status: true,
        type: "success",
        message: "Player hasben successfully registered.",
      });
    }
  });

  const NewGameTokenEventFilter = contract.filters.NewGameToken();
  AddNewEvent(NewGameTokenEventFilter, provider, (args: any) => {
    console.log("New game token created", args);
    if (walletAddress.toLowerCase() === args.owner.toLowerCase()) {
      setShowAlert({
        status: true,
        type: "success",
        message: "Player game token has been succesfully created.",
      });
      navigate(`/create-battle`);

    }
  });
  const NewBattleEventFilter = contract.filters.NewBattle();
  AddNewEvent(NewBattleEventFilter, provider, ({ args }) => {
    console.log("New battle started!", args, walletAddress);

    if (
      walletAddress.toLowerCase() === args.player1.toLowerCase() ||
      walletAddress.toLowerCase() === args.player2.toLowerCase()
    ) {
      navigate(`/battle/${args.battleName}`);
    }

    setUpdateGameData((prevUpdateGameData: number) => prevUpdateGameData + 1);
  });
  const BattleMoveEventFilter = contract.filters.BattleMove();
  AddNewEvent(BattleMoveEventFilter, provider, ({ args }) => {
    console.log("Battle move initiated!", args);
  });

  const RoundEndedEventFilter = contract.filters.RoundEnded;
  //* Get battle card coordinates
  const getCoords = (cardRef: any) => {
    const { left, top, width, height } =
      cardRef.current.getBoundingClientRect();

    return {
      pageX: left + width / 2,
      pageY: top + height / 2.25,
    };
  };
  AddNewEvent(RoundEndedEventFilter, provider, ({ args }) => {
    console.log("Round ended!", args, walletAddress);

    for (let i = 0; i < args.damagedPlayers.length; i += 1) {
      if (args.damagedPlayers[i] !== emptyAccount) {
        if (args.damagedPlayers[i] == walletAddress) {
          sparcle(getCoords(player1Ref));
        } else if (args.damagedPlayers[i] == walletAddress) {
          sparcle(getCoords(player2Ref));
        }
      } else {
        playAudio(defenseSound);
      }
    }
    setUpdateGameData((prevUpdateGameData: number) => prevUpdateGameData + 1);

  });
  const BattleEndedEventFilter = contract.filters.BattleEnded();
  AddNewEvent(BattleEndedEventFilter, provider, ({ args }) => {
    if (walletAddress.toLowerCase() === args.winner.toLowerCase()) {
      setShowAlert({ status: true, type: 'success', message: 'You won!' });
    } else if (walletAddress.toLowerCase() === args.loser.toLowerCase()) {
      setShowAlert({ status: true, type: 'failure', message: 'You lost!' });
    }

    navigate('/create-battle');
  });
};
