import { RouterProvider } from "react-router-dom";
import { AppRoutes } from "./utils/Routes";

function App() {
  return (
    <>
      <RouterProvider router={AppRoutes} />
    </>
  );
}

export default App;
