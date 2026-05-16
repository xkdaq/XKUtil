import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, theme, Modal, Timeline, Tag, Typography } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  BulbFilled,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useAppStore } from "../store/useAppStore";
import { getToolCategories } from "../tools/registry";
import { APP_VERSION, CHANGELOG } from "../constants/changelog";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, isDark, toggleCollapsed, toggleTheme } = useAppStore();
  const { token } = theme.useToken();
  const [changelogOpen, setChangelogOpen] = useState(false);

  const categories = getToolCategories();

  const menuItems: MenuProps["items"] = categories.map((category) => ({
    key: category.id,
    icon: category.icon,
    label: category.name,
    children: category.tools.map((tool) => ({
      key: tool.path,
      label: tool.name,
    })),
  }));

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    navigate(key);
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        trigger={null}
        width={220}
        style={{
          background: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
          position: "relative",
        }}
      >
        <div
          style={{
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            fontWeight: 600,
            fontSize: collapsed ? 14 : 16,
            color: token.colorPrimary,
          }}
        >
          {collapsed ? "XK" : "XKUtil"}
        </div>
        <div style={{ height: "calc(100% - 48px - 40px)", overflow: "auto" }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={categories.map((c) => c.id)}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ border: "none", marginTop: 4 }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: collapsed ? "8px 4px" : "8px 16px",
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            textAlign: "center",
            cursor: "pointer",
            background: token.colorBgContainer,
          }}
          onClick={() => setChangelogOpen(true)}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            {collapsed ? `v${APP_VERSION.split(".").slice(0, 2).join(".")}` : `v${APP_VERSION}`}
          </Text>
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: token.colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 48,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
          />
          <Button
            type="text"
            icon={isDark ? <BulbFilled /> : <BulbOutlined />}
            onClick={toggleTheme}
          />
        </Header>
        <Content
          style={{
            padding: 16,
            overflow: "auto",
            background: token.colorBgLayout,
          }}
        >
          {children}
        </Content>
      </Layout>

      <Modal
        title="更新日志"
        open={changelogOpen}
        onCancel={() => setChangelogOpen(false)}
        footer={null}
        width={500}
      >
        <Timeline
          items={CHANGELOG.map((entry) => ({
            children: (
              <div>
                <div style={{ marginBottom: 4 }}>
                  <Tag color="blue">v{entry.version}</Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {entry.date}
                  </Text>
                </div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {entry.changes.map((change, i) => (
                    <li key={i} style={{ fontSize: 13, lineHeight: 1.8 }}>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          }))}
        />
      </Modal>
    </Layout>
  );
}
