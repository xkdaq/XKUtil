import { useState } from "react";
import {
  Drawer,
  Table,
  Button,
  Space,
  Popconfirm,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
} from "antd";
import { EditOutlined, DeleteOutlined, ImportOutlined } from "@ant-design/icons";
import { useKeyStore, type SavedKeyPair } from "../../../store/useKeyStore";

const { Text } = Typography;

interface KeystoreDrawerProps {
  open: boolean;
  onClose: () => void;
  onLoadKey: (pair: SavedKeyPair) => void;
}

export function KeystoreDrawer({ open, onClose, onLoadKey }: KeystoreDrawerProps) {
  const { keys, updateKey, deleteKey } = useKeyStore();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<SavedKeyPair | null>(null);
  const [form] = Form.useForm();

  const handleEdit = (record: SavedKeyPair) => {
    setEditingKey(record);
    form.setFieldsValue({
      label: record.label,
      key: record.key,
      iv: record.iv,
      keySize: record.keySize,
    });
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    form.validateFields().then((values) => {
      if (editingKey) {
        updateKey(editingKey.id, values);
        message.success("密钥已更新");
        setEditModalOpen(false);
        setEditingKey(null);
      }
    });
  };

  const columns = [
    {
      title: "标签",
      dataIndex: "label",
      key: "label",
      width: 120,
      ellipsis: true,
    },
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      width: 140,
      render: (text: string) => (
        <Text code style={{ fontSize: 11 }}>
          {text.substring(0, 12)}...
        </Text>
      ),
    },
    {
      title: "长度",
      dataIndex: "keySize",
      key: "keySize",
      width: 60,
      render: (size: number) => `${size}`,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 100,
      render: (ts: number) => new Date(ts).toLocaleDateString("zh-CN"),
    },
    {
      title: "操作",
      key: "action",
      width: 140,
      render: (_: unknown, record: SavedKeyPair) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<ImportOutlined />}
            onClick={() => {
              onLoadKey(record);
              onClose();
            }}
          >
            加载
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定删除此密钥对?"
            onConfirm={() => {
              deleteKey(record.id);
              message.success("已删除");
            }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Drawer
        title="AES 密钥库"
        open={open}
        onClose={onClose}
        width={600}
      >
        <Table
          dataSource={keys}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={false}
          locale={{ emptyText: "密钥库为空，保存密钥对后将显示在此处" }}
        />
      </Drawer>

      <Modal
        title="编辑密钥对"
        open={editModalOpen}
        onOk={handleEditSave}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingKey(null);
        }}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="label"
            label="标签"
            rules={[{ required: true, message: "请输入标签" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="key"
            label="密钥 (Hex)"
            rules={[{ required: true, message: "请输入密钥" }]}
          >
            <Input style={{ fontFamily: "monospace" }} />
          </Form.Item>
          <Form.Item name="iv" label="IV (Hex)">
            <Input style={{ fontFamily: "monospace" }} />
          </Form.Item>
          <Form.Item name="keySize" label="密钥长度">
            <Select
              options={[
                { value: 128, label: "128 位" },
                { value: 192, label: "192 位" },
                { value: 256, label: "256 位" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
