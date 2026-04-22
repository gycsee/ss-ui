import { Button, Space, Tag, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import AlgoParamsReactDemo from './demos/AlgoParamsReactDemo.jsx';
import Packing3DReactDemo from './demos/Packing3DReactDemo.jsx';

const DEMOS = [
  {
    key: 'packing-3d-react',
    title: '@cardinal-odp/packing-3d-react',
    description: '3D 装箱场景展示，覆盖主题、未装箱区和高亮交互。',
    component: Packing3DReactDemo,
  },
  {
    key: 'algo-params-react',
    title: '@cardinal-odp/algo-params-react',
    description: 'React 表单 schema 渲染示例，覆盖编辑、预览、校验和提交。',
    component: AlgoParamsReactDemo,
  },
];

const DEMO_MAP = new Map(DEMOS.map((demo) => [demo.key, demo]));
const DEFAULT_ROUTE = 'packing-3d-react';

function normalizeRoute(hash) {
  const value = hash.replace(/^#\/?/, '').trim();

  if (DEMO_MAP.has(value)) {
    return value;
  }

  return DEFAULT_ROUTE;
}

function updateHash(route, replace = false) {
  const nextHash = `#/${route}`;

  if (replace) {
    window.history.replaceState(null, '', nextHash);
    return;
  }

  window.location.hash = nextHash;
}

export default function App() {
  const [route, setRoute] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_ROUTE;
    }

    return normalizeRoute(window.location.hash);
  });

  useEffect(() => {
    const nextRoute = normalizeRoute(window.location.hash);
    if (nextRoute !== window.location.hash.replace(/^#\/?/, '').trim()) {
      updateHash(nextRoute, true);
    }
    setRoute(nextRoute);

    const handleHashChange = () => {
      setRoute(normalizeRoute(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const activeDemo = useMemo(() => DEMO_MAP.get(route) ?? DEMO_MAP.get(DEFAULT_ROUTE), [route]);
  const ActiveComponent = activeDemo.component;

  return (
    <div className="demo-shell">
      <div className="demo-shell__hero">
        <div className="demo-shell__copy">
          <Typography.Title level={2}>React Package Demos</Typography.Title>
          <Typography.Paragraph>
            `react-demo` 统一承载多个 workspace 包的可交互示例。当前通过 hash
            路由切换页面，不额外引入路由依赖。
          </Typography.Paragraph>
        </div>
        <Tag color="blue">{activeDemo.key}</Tag>
      </div>

      <div className="demo-shell__nav">
        <Space wrap size={[12, 12]}>
          {DEMOS.map((demo) => (
            <Button
              key={demo.key}
              type={demo.key === route ? 'primary' : 'default'}
              onClick={() => updateHash(demo.key)}
            >
              {demo.title}
            </Button>
          ))}
        </Space>
        <Typography.Paragraph className="demo-shell__nav-copy" type="secondary">
          {activeDemo.description}
        </Typography.Paragraph>
      </div>

      <ActiveComponent />
    </div>
  );
}
