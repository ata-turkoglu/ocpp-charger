import "./App.css";
import Station from "./pages/Station";
import { WsProvider } from "./contexts/WsContext.jsx";
import { AppProvider } from "./contexts/AppContext.jsx";
import { SessionProvider } from "./contexts/SessionContext.jsx";

function App() {
    return (
        <AppProvider>
            <WsProvider>
                <SessionProvider>
                    <div>
                        <Station />
                    </div>
                </SessionProvider>
            </WsProvider>
        </AppProvider>
    );
}

export default App;
