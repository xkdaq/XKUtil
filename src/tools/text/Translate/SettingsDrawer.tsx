import { Drawer, Tabs, Form, Input, Button, message } from "antd";
import { useTranslateStore } from "../../../store/useTranslateStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ open, onClose }: Props) {
  const { providers, setProviderConfig } = useTranslateStore();

  const items = [
    {
      key: "baidu",
      label: "百度翻译",
      children: (
        <BaiduForm
          config={providers.baidu}
          onSave={(c) => {
            setProviderConfig("baidu", c);
            message.success("百度翻译配置已保存");
          }}
        />
      ),
    },
    {
      key: "youdao",
      label: "有道翻译",
      children: (
        <YoudaoForm
          config={providers.youdao}
          onSave={(c) => {
            setProviderConfig("youdao", c);
            message.success("有道翻译配置已保存");
          }}
        />
      ),
    },
    {
      key: "alibaba",
      label: "阿里翻译",
      children: (
        <AlibabaForm
          config={providers.alibaba}
          onSave={(c) => {
            setProviderConfig("alibaba", c);
            message.success("阿里翻译配置已保存");
          }}
        />
      ),
    },
    {
      key: "tencent",
      label: "腾讯翻译",
      children: (
        <TencentForm
          config={providers.tencent}
          onSave={(c) => {
            setProviderConfig("tencent", c);
            message.success("腾讯翻译配置已保存");
          }}
        />
      ),
    },
  ];

  return (
    <Drawer title="翻译服务配置" open={open} onClose={onClose} width={420}>
      <Tabs items={items} defaultActiveKey={useTranslateStore.getState().activeProvider} />
    </Drawer>
  );
}

function BaiduForm({
  config,
  onSave,
}: {
  config: { appId: string; secretKey: string };
  onSave: (c: { appId: string; secretKey: string }) => void;
}) {
  const [form] = Form.useForm();
  return (
    <Form form={form} layout="vertical" initialValues={config} onFinish={onSave}>
      <Form.Item label="AppID" name="appId" rules={[{ required: true }]}>
        <Input placeholder="百度翻译 AppID" />
      </Form.Item>
      <Form.Item label="密钥 (SecretKey)" name="secretKey" rules={[{ required: true }]}>
        <Input.Password placeholder="百度翻译密钥" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">保存</Button>
      </Form.Item>
    </Form>
  );
}

function YoudaoForm({
  config,
  onSave,
}: {
  config: { appKey: string; appSecret: string };
  onSave: (c: { appKey: string; appSecret: string }) => void;
}) {
  const [form] = Form.useForm();
  return (
    <Form form={form} layout="vertical" initialValues={config} onFinish={onSave}>
      <Form.Item label="应用ID (AppKey)" name="appKey" rules={[{ required: true }]}>
        <Input placeholder="有道翻译 AppKey" />
      </Form.Item>
      <Form.Item label="应用密钥 (AppSecret)" name="appSecret" rules={[{ required: true }]}>
        <Input.Password placeholder="有道翻译密钥" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">保存</Button>
      </Form.Item>
    </Form>
  );
}

function AlibabaForm({
  config,
  onSave,
}: {
  config: { accessKeyId: string; accessKeySecret: string };
  onSave: (c: { accessKeyId: string; accessKeySecret: string }) => void;
}) {
  const [form] = Form.useForm();
  return (
    <Form form={form} layout="vertical" initialValues={config} onFinish={onSave}>
      <Form.Item label="AccessKey ID" name="accessKeyId" rules={[{ required: true }]}>
        <Input placeholder="阿里云 AccessKey ID" />
      </Form.Item>
      <Form.Item label="AccessKey Secret" name="accessKeySecret" rules={[{ required: true }]}>
        <Input.Password placeholder="阿里云 AccessKey Secret" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">保存</Button>
      </Form.Item>
    </Form>
  );
}

function TencentForm({
  config,
  onSave,
}: {
  config: { secretId: string; secretKey: string };
  onSave: (c: { secretId: string; secretKey: string }) => void;
}) {
  const [form] = Form.useForm();
  return (
    <Form form={form} layout="vertical" initialValues={config} onFinish={onSave}>
      <Form.Item label="SecretId" name="secretId" rules={[{ required: true }]}>
        <Input placeholder="腾讯云 SecretId" />
      </Form.Item>
      <Form.Item label="SecretKey" name="secretKey" rules={[{ required: true }]}>
        <Input.Password placeholder="腾讯云 SecretKey" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">保存</Button>
      </Form.Item>
    </Form>
  );
}
