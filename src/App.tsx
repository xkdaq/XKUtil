import { HashRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { MainLayout } from "./layouts/MainLayout";
import { AppRoutes } from "./routes";
import { useAppStore } from "./store/useAppStore";
import { getThemeConfig } from "./styles/theme";

function App() {
  const isDark = useAppStore((s) => s.isDark);

  return (
    <ConfigProvider locale={zhCN} theme={getThemeConfig(isDark)}>
      <HashRouter>
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      </HashRouter>
    </ConfigProvider>
  );
}

export default App;
