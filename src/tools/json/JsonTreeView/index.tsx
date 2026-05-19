import { useState, useCallback, useMemo } from "react";
import {
  Input,
  Tree,
  Card,
  Button,
  Space,
  Alert,
  Typography,
  Tag,
  message,
  Splitter,
} from "antd";
import {
  ExpandOutlined,
  ShrinkOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import type { TreeDataNode } from "antd";
import { parseJson } from "../../../utils/json";

const { TextArea } = Input;
const { Text } = Typography;

const SAMPLE_JSON = `{
  "name": "XKUtil",
  "version": "0.1.0",
  "features": ["JSON格式化", "编解码", "文本处理"],
  "config": {
    "theme": "light",
    "autoSave": true,
    "maxRecent": 10
  }
}`;

function getTypeTag(value: unknown) {
  if (value === null) return <Tag color="default">null</Tag>;
  if (Array.isArray(value))
    return <Tag color="blue">Array[{value.length}]</Tag>;
  switch (typeof value) {
    case "string":
      return <Tag color="green">string</Tag>;
    case "number":
      return <Tag color="orange">number</Tag>;
    case "boolean":
      return <Tag color="purple">{String(value)}</Tag>;
    case "object":
      return <Tag color="cyan">Object{`{${Object.keys(value).length}}`}</Tag>;
    default:
      return <Tag>{typeof value}</Tag>;
  }
}

function jsonToTreeData(
  value: unknown,
  key: string,
  path: string,
  valueMap: Map<string, unknown>
): TreeDataNode {
  valueMap.set(path, value);

  if (value === null || typeof value !== "object") {
    const displayValue =
      typeof value === "string" ? `"${value}"` : String(value);
    return {
      key: path,
      title: (
        <span>
          <Text strong>{key}</Text>
          <Text type="secondary">: </Text>
          <Text code>{displayValue}</Text> {getTypeTag(value)}
        </span>
      ),
      isLeaf: true,
    };
  }

  if (Array.isArray(value)) {
    return {
      key: path,
      title: (
        <span>
          <Text strong>{key}</Text> {getTypeTag(value)}
        </span>
      ),
      children: value.map((item, index) =>
        jsonToTreeData(item, `[${index}]`, `${path}.[${index}]`, valueMap)
      ),
    };
  }

  const obj = value as Record<string, unknown>;
  return {
    key: path,
    title: (
      <span>
        <Text strong>{key}</Text> {getTypeTag(value)}
      </span>
    ),
    children: Object.entries(obj).map(([k, v]) =>
      jsonToTreeData(v, k, `${path}.${k}`, valueMap)
    ),
  };
}

function getAllKeys(nodes: TreeDataNode[]): string[] {
  const keys: string[] = [];
  function walk(list: TreeDataNode[]) {
    for (const node of list) {
      if (node.children && node.children.length > 0) {
        keys.push(node.key as string);
        walk(node.children);
      }
    }
  }
  walk(nodes);
  return keys;
}

export default function JsonTreeView() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [error, setError] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const { treeData, valueMap } = useMemo(() => {
    if (!input.trim()) return { treeData: [], valueMap: new Map<string, unknown>() };
    const result = parseJson(input);
    if (!result.success) {
      setError(result.message);
      return { treeData: [], valueMap: new Map<string, unknown>() };
    }
    setError(null);
    const map = new Map<string, unknown>();
    const nodes = [jsonToTreeData(result.data, "root", "root", map)];
    return { treeData: nodes, valueMap: map };
  }, [input]);

  const allKeys = useMemo(() => getAllKeys(treeData), [treeData]);

  const handleExpandAll = useCallback(() => {
    setExpandedKeys(allKeys);
  }, [allKeys]);

  const handleCollapseAll = useCallback(() => {
    setExpandedKeys([]);
  }, []);

  const handleCopyValue = useCallback(
    (key: string) => {
      const value = valueMap.get(key);
      const text =
        typeof value === "string"
          ? value
          : JSON.stringify(value, null, 2);
      navigator.clipboard.writeText(text).then(() => {
        message.success("已复制");
      });
    },
    [valueMap]
  );

  // Auto-expand root on first valid parse
  useState(() => {
    if (treeData.length > 0 && expandedKeys.length === 0) {
      setExpandedKeys(["root"]);
    }
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: 12 }}>
        <Space>
          <Button icon={<ExpandOutlined />} onClick={handleExpandAll}>
            全部展开
          </Button>
          <Button icon={<ShrinkOutlined />} onClick={handleCollapseAll}>
            全部折叠
          </Button>
        </Space>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 8 }}
        />
      )}

      <div style={{ flex: 1, minHeight: 0 }}>
        <Splitter>
          <Splitter.Panel defaultSize="40%" min="25%">
            <Card
              size="small"
              title="输入 JSON"
              style={{ height: "100%", display: "flex", flexDirection: "column" }}
              styles={{ body: { flex: 1, padding: 0, overflow: "hidden" } }}
            >
              <TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{
                  height: "100%",
                  resize: "none",
                  border: "none",
                  borderRadius: 0,
                  fontFamily: "monospace",
                  fontSize: 13,
                }}
                placeholder="在此粘贴 JSON..."
              />
            </Card>
          </Splitter.Panel>
          <Splitter.Panel min="40%">
            <Card
              size="small"
              title="树形结构"
              style={{ height: "100%", display: "flex", flexDirection: "column" }}
              styles={{ body: { flex: 1, padding: 8, overflow: "auto" } }}
            >
              {treeData.length > 0 ? (
                <Tree
                  treeData={treeData}
                  expandedKeys={expandedKeys}
                  onExpand={(keys) => setExpandedKeys(keys as string[])}
                  titleRender={(node) => (
                    <span
                      style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      {node.title as React.ReactNode}
                      <CopyOutlined
                        style={{ fontSize: 11, color: "#999", cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyValue(node.key as string);
                        }}
                      />
                    </span>
                  )}
                  showLine
                  defaultExpandAll={false}
                />
              ) : (
                <Text type="secondary">请在左侧输入有效的 JSON 数据</Text>
              )}
            </Card>
          </Splitter.Panel>
        </Splitter>
      </div>
    </div>
  );
}
