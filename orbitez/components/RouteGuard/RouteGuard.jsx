import { useEffect } from "react";
import { useRouter } from "next/router";

const RouteGuard = ({ children, isAllowed, redirectUrl, isLoading }) => {
    const router = useRouter();

    useEffect(() => {
        if (isAllowed || isLoading) return;

        router.push(redirectUrl);
    }, [ isAllowed, isLoading ]);

    if (!isAllowed || isLoading) {
        return null;
    }

    return children;
};

export default RouteGuard;
