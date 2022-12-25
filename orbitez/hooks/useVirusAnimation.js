import { useEffect } from "react";
import VirusAnimation from "../services/virusAnimation/VirusAnimation";

const useVirusAnimation = () => {

    // Dirty way to pass VirusAnimation to /public/assets/js/main_out.js file
    useEffect(() => {
        window.VirusAnimation = VirusAnimation;
      }, []);

};

export default useVirusAnimation;
