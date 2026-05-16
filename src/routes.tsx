import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";
import { getAllTools } from "./tools/registry";

export function AppRoutes() {
  const tools = getAllTools();

  return (
    <Suspense
      fallback={
        <div style={{ padding: 48, textAlign: "center" }}>
          <Spin size="large" />
        </div>
      }
    >
      <Routes>
        {tools.map((tool) => (
          <Route key={tool.id} path={tool.path} element={<tool.component />} />
        ))}
        <Route
          path="*"
          element={<Navigate to={tools[0]?.path ?? "/"} replace />}
        />
      </Routes>
    </Suspense>
  );
}
