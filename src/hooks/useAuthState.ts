import { useState, useEffect, useCallback, useRef } from "react";

export const useAuthState = () => {
  const [role, setRole] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");

  const isLoggedInRef = useRef(false);
  const roleRef = useRef("");
  const userNameRef = useRef("");

  const checkAuthState = useCallback(() => {
    const userString = localStorage.getItem("userLogin");
    const accessToken = localStorage.getItem("accessToken");

    if (userString && accessToken) {
      try {
        const user = JSON.parse(userString);
        setRole(user.roleName?.toUpperCase() || "");
        setIsLoggedIn(true);
        setUserName(user.name || "");

        roleRef.current = user.roleName?.toUpperCase() || "";
        isLoggedInRef.current = true;
        userNameRef.current = user.name || "";
      } catch (error) {
        console.error("Error parsing user data:", error);
        resetAuthState();
      }
    } else {
      resetAuthState();
    }
  }, []);

  const resetAuthState = () => {
    setIsLoggedIn(false);
    setRole("GUEST");
    setUserName("");

    isLoggedInRef.current = false;
    roleRef.current = "GUEST";
    userNameRef.current = "";
  };

  useEffect(() => {
    checkAuthState();
    window.addEventListener("storage", checkAuthState);
    return () => window.removeEventListener("storage", checkAuthState);
  }, [checkAuthState]);

  return {
    role,
    isLoggedIn,
    userName,
    checkAuthState,
    setIsLoggedIn,
    setRole,
    setUserName,
    isLoggedInRef,
    roleRef,
    userNameRef,
  };
};
