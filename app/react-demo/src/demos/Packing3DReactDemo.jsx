import {
  Card,
  Flex,
  Select,
  Slider,
  Switch,
  Tag,
  Typography,
} from 'antd';
import { useMemo, useState } from 'react';

import Packing3DScene from '@cardinal-odp/packing-3d-react';

import sampleData from './packing3dSampleData.json';

const { container, packedItems, unloadedItems, sampleMeta } = sampleData;

const itemOptions = [...packedItems, ...unloadedItems].map((item) => ({
  label: `${item.meta?.title ?? item.id} · ${item.groupKey}${item.id.startsWith('left-') ? ' · 未装箱' : ''}`,
  value: item.id,
}));

function previewItems(items, limit = 20) {
  return items.slice(0, limit);
}

export default function Packing3DReactDemo() {
  const [theme, setTheme] = useState('light');
  const [showUnloaded, setShowUnloaded] = useState(true);
  const [opacity, setOpacity] = useState(0.75);
  const [activeItemIds, setActiveItemIds] = useState([]);

  const highlightedIds = useMemo(() => new Set(activeItemIds), [activeItemIds]);

  return (
    <div className="package-demo">
      <div className="package-demo__hero">
        <div>
          <Typography.Title level={3}>packing-3d-react demo</Typography.Title>
          <Typography.Paragraph>
            直接映射自 {sampleMeta.sourceFile}，包含完整装箱结果、未装箱余量和字段映射后的 tooltip 信息。
          </Typography.Paragraph>
        </div>
        <div className="package-demo__tags">
          <Tag color="blue">{sampleMeta.cargoContainerType} Workbook</Tag>
          <Tag color="geekblue">{sampleMeta.packedCount} Packed</Tag>
          <Tag color="volcano">{sampleMeta.unloadedCount} Unloaded</Tag>
          <Tag color="green">{sampleMeta.totalVolumeM3.toFixed(2)} m³</Tag>
          <Tag color="gold">Vol {(sampleMeta.loadRateVolume * 100).toFixed(1)}%</Tag>
        </div>
      </div>

      <div className="package-demo__layout">
        <Card className="package-demo__panel" title="Scene Controls">
          <Flex vertical gap={20}>
            <div>
              <Typography.Text strong>Theme</Typography.Text>
              <div className="package-demo__control">
                <Switch
                  checked={theme === 'dark'}
                  checkedChildren="Dark"
                  unCheckedChildren="Light"
                  onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </div>

            <div>
              <Typography.Text strong>Show Unloaded Zone</Typography.Text>
              <div className="package-demo__control">
                <Switch checked={showUnloaded} onChange={setShowUnloaded} />
              </div>
            </div>

            <div>
              <Typography.Text strong>Highlight Items</Typography.Text>
              <div className="package-demo__control">
                <Select
                  allowClear
                  showSearch
                  style={{ width: '100%' }}
                  mode="multiple"
                  maxTagCount="responsive"
                  optionFilterProp="label"
                  placeholder="未选择时展示全部"
                  value={activeItemIds}
                  options={itemOptions}
                  onChange={setActiveItemIds}
                />
              </div>
            </div>

            <div>
              <Typography.Text strong>Unloaded Zone Opacity</Typography.Text>
              <div className="package-demo__control">
                <Slider
                  min={0.2}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onChange={setOpacity}
                />
              </div>
            </div>
          </Flex>
        </Card>

        <Card className="package-demo__stage" bodyStyle={{ padding: 12 }} title="3D Scene">
          <Packing3DScene
            container={container}
            items={packedItems}
            allItems={[...packedItems, ...unloadedItems]}
            unloadedItems={showUnloaded ? unloadedItems : []}
            highlightedIds={highlightedIds}
            opacity={opacity}
            theme={theme}
            height={720}
          />
        </Card>
      </div>

      <div className="package-demo__grid">
        <Card title="Workbook Meta">
          <pre>{JSON.stringify(sampleMeta, null, 2)}</pre>
        </Card>
        <Card title={`Packed Items Preview (${packedItems.length})`}>
          <pre>{JSON.stringify(previewItems(packedItems), null, 2)}</pre>
        </Card>
        <Card title={`Unloaded Items Preview (${showUnloaded ? unloadedItems.length : 0})`}>
          <pre>{JSON.stringify(showUnloaded ? previewItems(unloadedItems) : [], null, 2)}</pre>
        </Card>
      </div>
    </div>
  );
}
