import {
    createContext,
    useLayoutEffect,
    useRef,
    useContext,
    useState,
} from "react";
import { AppContext } from "./AppContext";

export const WsContext = createContext();

export const WsProvider = ({ children }) => {
    const {
        setChargerConnected,
        setAuthorized,
        setAuthorizedStatus,
        setChargerStatus,
        chargerMeterValue,
        sendInterval,
        sessionId,
    } = useContext(AppContext);

    const [socketActive, setSocketActive] = useState(false);
    const chargerCode = useRef();
    const idTag = useRef();

    const lastAction = useRef([]);
    var socket = useRef();

    useLayoutEffect(() => {
        const randKey = Math.floor(Math.random() * 2 + 8);
        chargerCode.current = "newStation123" + randKey;
        idTag.current = "newIdTag123" + randKey;
        const ws = new WebSocket(
            "ws://localhost:3333/" + "charger=" + chargerCode.current,
            ["ocpp1.6"]
        );
        socket.current = ws;

        ws.onopen = function () {
            console.log("connected");
            setSocketActive(true);
        };

        ws.onclose = function () {
            setSocketActive(false);
        };

        ws.onmessage = function (message) {
            ReceivedMessageHandler(ws, chargerCode.current, message.data);
        };
    }, []);

    const BootNotification = () => {
        const reqData = {
            chargePointVendor: "AVT-Company",
            chargePointModel: "AVT-Express",
            chargePointSerialNumber: "avt.001.13.1",
            chargeBoxSerialNumber: "avt.001.13.1.01",
            firmwareVersion: "0.9.87",
            iccid: "",
            imsi: "",
            meterType: "AVT NQC-ACDC",
            meterSerialNumber: "avt.001.13.1.01",
        };
        SendMessageHandler("BootNotification", reqData);
        setChargerStatus("Available");
    };

    const Authorize = () => {
        const reqData = {
            idTag: idTag.current,
        };
        SendMessageHandler("Authorize", reqData);
    };

    const StatusNotification = (status) => {
        const reqData = {
            connectorId: 1,
            errorCode: "NoError",
            info: "info",
            status,
            timestamp: new Date(),
            vendorId: "newVendorId123",
            vendorErrorCode: "noErrorCode",
        };
        SendMessageHandler("StatusNotification", reqData);
    };

    const StartTransaction = () => {
        const reqData = {
            connectorId: 1,
            idTag: idTag.current,
            meterStart: chargerMeterValue,
            //reservationId:null,
            timestamp: new Date(),
        };

        SendMessageHandler("StartTransaction", reqData);
    };

    const MeterValue = (value) => {
        console.log("chargerMeterValue", value);
        window.localStorage.setItem("chargerMeterValue", chargerMeterValue);
        const reqData = {
            connectorId: 1,
            transactionId: sessionId.current,
            meterValue: {
                timestamp: new Date(),
                sampledValue: [
                    {
                        value: chargerMeterValue,
                        context: null,
                        format: null,
                        measurand: "Energy.Active.Import.Register",
                        phase: null,
                        location: null,
                        unit: "Wh",
                    },
                    {
                        value: 220,
                        context: null,
                        format: null,
                        measurand: "Voltage",
                        phase: null,
                        location: null,
                        unit: "V",
                    },
                    {
                        value: 1000,
                        context: null,
                        format: null,
                        measurand: "Power.Active.Import",
                        phase: null,
                        location: null,
                        unit: "W",
                    },
                ],
            },
        };

        SendMessageHandler("MeterValues", reqData);
    };

    const StopTransaction = () => {
        window.localStorage.setItem("chargerMeterValue", chargerMeterValue);
        const reqData = {
            meterStop: chargerMeterValue,
            timestamp: new Date(),
            transactionId: sessionId.current,
            reason: "Other",
            idTag: idTag.current,
            transactionData: {
                timestamp: new Date(),
                sampledValue: [
                    {
                        value: chargerMeterValue,
                        context: null,
                        format: null,
                        measurand: "Energy.Active.Import.Register",
                        phase: null,
                        location: null,
                        unit: "Wh",
                    },
                    {
                        value: 220,
                        context: null,
                        format: null,
                        measurand: "Voltage",
                        phase: null,
                        location: null,
                        unit: "V",
                    },
                    {
                        value: 1000,
                        context: null,
                        format: null,
                        measurand: "Power.Active.Import",
                        phase: null,
                        location: null,
                        unit: "W",
                    },
                ],
            },
        };

        SendMessageHandler("StopTransaction", reqData);
    };

    const SendMessageHandler = (action, data) => {
        const messageId = randomId();
        const message = [2, messageId, action, data];
        socket.current.ata = "ata";
        socket.current.send(JSON.stringify(message));
        lastAction.current.unshift({ messageId, action });
    };

    const ReceivedMessageHandler = (socket, charger, message) => {
        const [messageTypeId, uniqueId, payload] = JSON.parse(
            message.toString()
        );

        const authorizeResp = (socket, uniqueId, payload, charger) => {
            if (payload.status == "Accepted") setAuthorized(true);
            setAuthorizedStatus(payload.status);
        };

        const bootNotificationResp = (socket, uniqueId, payload, charger) => {
            const { currentTime, interval, status } = payload;
            if (status == "Accepted") {
                setChargerConnected(true);
                sendInterval.current = interval * 10;
            }
        };

        const statusNotificationResp = (
            socket,
            uniqueId,
            payload,
            charger
        ) => {};

        const startTransactionResp = (socket, uniqueId, payload, charger) => {
            const { idTagInfo, transactionId } = payload;
            if (idTagInfo.status == "Accepted") {
                sessionId.current = transactionId;
                setChargerStatus("Charging");
            }
        };

        const meterValuesResp = (socket, uniqueId, payload, charger) => {};

        const stopTransactionResp = (socket, uniqueId, payload, charger) => {};

        let action = lastAction.current
            .slice(0, 10)
            .find((itm) => itm.messageId == uniqueId).action;

        console.log(action, payload);

        switch (action) {
            case "Authorize":
                return authorizeResp(socket, uniqueId, payload, charger);
            case "BootNotification":
                return bootNotificationResp(socket, uniqueId, payload, charger);
            case "StartTransaction":
                return startTransactionResp(socket, uniqueId, payload, charger);
            case "StatusNotification":
                return statusNotificationResp(
                    socket,
                    uniqueId,
                    payload,
                    charger
                );
            case "MeterValues":
                return meterValuesResp(socket, uniqueId, payload, charger);
            case "StopTransaction":
                return stopTransactionResp(socket, uniqueId, payload, charger);
            case "Heartbeat":
                return heartbeatResp(socket, uniqueId, payload, charger);
            default:
                break;
        }
    };

    const randomId = () => {
        const possible =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let id = "";
        for (var i = 0; i < 36; i++) {
            id += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return id;
    };

    return (
        <WsContext.Provider
            value={{
                socketActive,
                BootNotification,
                Authorize,
                StatusNotification,
                StartTransaction,
                MeterValue,
                StopTransaction,
            }}
        >
            {children}
        </WsContext.Provider>
    );
};
