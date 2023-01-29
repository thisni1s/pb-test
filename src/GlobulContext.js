import { useContext, useState, createContext } from "react";
import { ThemeContext } from "@emotion/react";

const GlobulContext = createContext()
const UpdateGlobulContext = createContext()

export function useGlobulContext() {
    return useContext(GlobulContext)
}

export function useUpdateGlobulContext() {
    return useContext(UpdateGlobulContext)
}

export function GlobulContextProvider({ children }) {
    const [globulContext, setGlobulContext] = useState({})

    function updateContext(obj) {
        setGlobulContext(obj)
    }

    return (
        <GlobulContext.Provider value={globulContext, updateContext}>
            <UpdateGlobulContext.Provider value={updateContext}>
                {children}
            </UpdateGlobulContext.Provider>
        </GlobulContext.Provider>
    )
}