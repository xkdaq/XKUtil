import { theme, ThemeConfig } from "antd";

export function getThemeConfig(isDark: boolean): ThemeConfig {
  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#1677ff",
      borderRadius: 6,
    },
  };
}
