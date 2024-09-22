import { createContext, useContext, useEffect, useRef } from "react";
import { AppContext } from "./AppContext";
import { WsContext } from "./WsContext";

export const SessionContext = createContext();

const transactionEndedStatuses = [
    "Available",
    "SuspendedEV",
    "suspendedEVSE",
    "Finishing",
    "Unavailable",
    "Faulted",
];

export const SessionProvider = ({ children }) => {
    const {
        chargerStatus,
        chargerMeterValue,
        setChargerMeterValue,
        sendInterval,
    } = useContext(AppContext);

    const { MeterValue, StopTransaction } = useContext(WsContext);

    const interval = useRef();
    const lastStatus = useRef();

    const startMeter = () => {
        interval.current = setInterval(() => {
            setChargerMeterValue((val) => val + 1);
            MeterValue(chargerMeterValue + 1);
        }, sendInterval.current);
    };

    useEffect(() => {
        if (chargerStatus == "Charging") {
            startMeter();
        } else {
            clearInterval(interval.current);
        }

        if (
            lastStatus.current == "Charging" &&
            transactionEndedStatuses.includes(chargerStatus)
        ) {
            console.log("transactionEnded");
            StopTransaction();
        }

        lastStatus.current = chargerStatus;

        return () => clearInterval(interval.current);
    }, [chargerStatus]);

    useEffect(() => {
        return () => {
            clearInterval(interval.current);
        };
    }, []);

    return (
        <SessionContext.Provider value={{}}>{children}</SessionContext.Provider>
    );
};
