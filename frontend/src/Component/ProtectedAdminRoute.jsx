import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_ADDRESS } from "../adminConfig";

const ProtectedAdminRoute = ({ walletAddress, children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    
    // Si pas d'adresse OU pas d'authentification OU pas l'adresse admin
    if (!walletAddress || !token || walletAddress.toLowerCase() !== ADMIN_ADDRESS) {
      navigate("/unauthorized");
    }
  }, [walletAddress]);

  const token = localStorage.getItem("jwtToken");
  const isAdminAuthenticated = walletAddress?.toLowerCase() === ADMIN_ADDRESS && token;

  return isAdminAuthenticated ? children : null;
};

export default ProtectedAdminRoute;
