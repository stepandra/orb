import React, { useState, useEffect } from "react";

export function LoadingButton({ label }) {
    const [dotCount, setDotCount] = useState(1);

    useEffect(() => {
        const updateDotCount = () => {
            setDotCount((currentDotCount) => {
                if (currentDotCount === 3) {
                    return 1;
                } else {
                    return currentDotCount + 1;
                }
            });
        };
        const dotsUpdateInterval = setInterval(updateDotCount, 500);

        return () => clearInterval(dotsUpdateInterval);
    }, []);

    const animatedLabel = label + ".".repeat(dotCount);

    return (
        <button
            className="planet__btn btn btn--center serverDeploymentSettings__deploy-button serverDeploymentSettings__deploy-button--progress"
            disabled
        >
            {animatedLabel}
        </button>
    );
}
