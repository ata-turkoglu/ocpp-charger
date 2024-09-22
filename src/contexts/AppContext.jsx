import {
    createContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [chargerConnected, setChargerConnected] = useState(false);
    const [authorized, setAuthorized] = useState(false);
    const [authorizedStatus, setAuthorizedStatus] = useState("");
    const [chargerStatus, setChargerStatus] = useState("");
    const [EVConnected, setEVConnected] = useState(false);
    const [chargerMeterValue, setChargerMeterValue] = useState(0);

    const sessionId = useRef();
    const sendInterval = useRef();

    useLayoutEffect(() => {
        setChargerMeterValue(
            Number(window.localStorage.getItem("chargerMeterValue")) || 0
        );
    }, []);
    return (
        <AppContext.Provider
            value={{
                chargerConnected,
                setChargerConnected,
                authorized,
                setAuthorized,
                authorizedStatus,
                setAuthorizedStatus,
                chargerStatus,
                setChargerStatus,
                EVConnected,
                setEVConnected,
                chargerMeterValue,
                setChargerMeterValue,
                sendInterval,
                sessionId,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
