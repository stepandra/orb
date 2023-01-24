import useLocalStorage from '@hooks/useLocalStorage';

const SERVER_NAME_KEY = 'ORBITEZ_SERVER_NAME';
const SERVER_URL_KEY = 'ORBITEZ_SERVER_URL';
const STATS_URL_KEY = 'ORBITEZ_STATS_URL';

const useServer = () => {
    const [serverName, setServerName] = useLocalStorage(SERVER_NAME_KEY, null);
    const [serverUrl, setServerUrl] = useLocalStorage(SERVER_URL_KEY, null);
    const [statsUrl, setStatsUrl] = useLocalStorage(STATS_URL_KEY, null);

    return {
        serverName,
        setServerName,
        serverUrl,
        setServerUrl,
        statsUrl,
        setStatsUrl
    }
};

export default useServer;
