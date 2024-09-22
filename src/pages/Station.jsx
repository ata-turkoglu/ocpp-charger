import { useContext, useEffect, useRef, useState } from "react";
import { WsContext } from "../contexts/WsContext";
import { AppContext } from "../contexts/AppContext";

export default function Station() {
    const {
        chargerConnected,
        authorized,
        authorizedStatus,
        chargerStatus,
        setChargerStatus,
        EVConnected,
        chargerMeterValue,
    } = useContext(AppContext);
    const {
        socketActive,
        BootNotification,
        Authorize,
        StatusNotification,
        StartTransaction,
    } = useContext(WsContext);
    const [plugged, setPlugged] = useState(false);
    const slided = useRef(false);

    const insertCard = () => {
        const simcard = document.getElementById("sim");
        simcard?.classList.add("insertCard");
        BootNotification();
    };

    const slideCard = () => {
        const card = document.getElementById("card");
        card?.classList.toggle("slideCard");
        slided.current = true;
        Authorize();
    };

    const plugCable = () => {
        setPlugged(!plugged);
    };

    useEffect(() => {
        const card = document.getElementById("card");
        setTimeout(() => {
            card?.classList.remove("slideCard");
        }, 1000);

        if (authorizedStatus == "Accepted") {
            console.log("start charging");
            setTimeout(() => {
                StartTransaction();
            }, 2000);
        }
    }, [authorizedStatus]);

    useEffect(() => {
        console.log(
            "Charger Status Changed To ",
            chargerStatus,
            chargerConnected
        );
        if (chargerConnected && chargerStatus) {
            StatusNotification(chargerStatus);
        }
    }, [chargerConnected, chargerStatus]);

    useEffect(() => {
        if (plugged) {
            setChargerStatus("Preparing");
        } else {
            chargerConnected && setChargerStatus("Available");
        }
    }, [plugged]);

    return (
        <div className="w-full h-screen bg-slate-200 p-6">
            {socketActive && (
                <span className="my-14 mx-3">WebSocket Connected</span>
            )}
            <div className="gradient flex w-full h-1/2 p-6">
                <div
                    className="relative h-1/4 cursor-pointer duration-200 z-20"
                    onClick={() => plugged && slideCard()}
                >
                    <img
                        id="card"
                        className="w-full h-full rounded-md transition-all ease-linear duration-200"
                        src="/assets/rfid-card.png"
                        style={{
                            boxShadow: plugged ? "0 0 15px -2px grey" : "none",
                        }}
                    />
                    {slided.current && (
                        <span className="absolute right-1 bottom-1">
                            {authorizedStatus}
                        </span>
                    )}
                </div>
                <div className="relative">
                    <div className="h-full z-10">
                        <img
                            className="w-full h-full z-10"
                            src="/assets/charger.png"
                            style={{
                                filter: chargerConnected
                                    ? "drop-shadow(0 0 10px grey)"
                                    : "none",
                            }}
                        />
                    </div>
                    <img
                        id="sim"
                        className="z-0 w-auto h-[100px] cursor-pointer absolute bottom-[-100px] left-0 right-0 mx-auto transition-all ease-linear duration-200"
                        src="/assets/simcard.png"
                        onClick={() => insertCard()}
                    />
                    <button
                        className="bg-orange-800 rounded-md mt-10 text-white shadow-lg hover:shadow-none py-1 w-60 disabled:bg-slate-600 disabled:shadow-inner"
                        onClick={() => setChargerStatus("Finishing")}
                        disabled={chargerStatus != "Charging"}
                    >
                        Stop
                    </button>
                </div>
                <div
                    id="plug"
                    className="flex justify-center flex-col cursor-pointer transition-all ease-linear duration-700"
                    onClick={() => plugCable()}
                >
                    {plugged ? (
                        <img
                            className="w-full h-[150px]"
                            src="/assets/plugged.png"
                        />
                    ) : (
                        <img
                            className="w-full h-[150px]"
                            src="/assets/connector.png"
                            style={{
                                boxShadow: chargerConnected
                                    ? "0 0 15px -2px grey"
                                    : "none",
                            }}
                        />
                    )}
                    {chargerStatus == "Charging" && (
                        <img
                            className="w-full h-[150px]"
                            src="/assets/charging.gif"
                        />
                    )}
                    <span className="mt-10 justify-self-center self-center">
                        {chargerMeterValue}
                    </span>
                </div>
                <div>
                    <img
                        className={
                            "w-full h-full " + (plugged ? "cursor-pointer" : "")
                        }
                        src="/assets/truck.png"
                        style={{
                            filter: plugged
                                ? "drop-shadow(0 0 10px grey)"
                                : "none",
                        }}
                        onClick={() =>
                            plugged && setChargerStatus("SuspendedEV")
                        }
                    />
                </div>
            </div>
        </div>
    );
}
