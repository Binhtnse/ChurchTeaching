import { RouterProvider } from "react-router-dom";
import { AppRoutes } from "./utils/Routes";
import { PageTitleProvider } from './hooks/PageTitleContext';

function App() {
  return (
    <PageTitleProvider>
      <RouterProvider router={AppRoutes} />
    </PageTitleProvider>
  );
}

export default App;
