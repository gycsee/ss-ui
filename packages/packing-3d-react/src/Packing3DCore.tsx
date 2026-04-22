import { memo, type CSSProperties, type ReactNode, useCallback, useMemo, useState } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

import { getDefaultGroupColor, resolveScenePalette } from "./colors";
import { resolveSceneTooltipTokens } from "./tooltip";
import type { Packing3DCoreProps, SceneContainer, SceneItem, ScenePalette, SceneTooltipTokens } from "./types";

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

const EMPTY_HIGHLIGHTED_IDS = new Set<string>();

function DefaultTooltip({
  item,
  unloaded = false,
  tokens,
  markerColor,
}: {
  item: SceneItem;
  unloaded?: boolean;
  tokens: SceneTooltipTokens;
  markerColor: string;
}) {
  const containerStyle: CSSProperties = {
    backgroundColor: tokens.backgroundColor,
    color: tokens.textColor,
    border: `1px solid ${tokens.borderColor}`,
    borderRadius: tokens.borderRadius,
    boxShadow: tokens.shadow,
    padding: `${tokens.paddingY}px ${tokens.paddingX}px`,
    fontSize: tokens.fontSize,
    lineHeight: tokens.lineHeight,
    minWidth: tokens.minWidth,
    whiteSpace: "nowrap",
  };
  const titleStyle: CSSProperties = {
    fontWeight: tokens.titleFontWeight,
    marginBottom: tokens.titleSpacing,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };
  const markerStyle: CSSProperties = {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: markerColor,
    boxShadow: `0 0 0 1px ${tokens.borderColor}`,
    flexShrink: 0,
  };
  const mutedLineStyle: CSSProperties = {
    color: tokens.mutedTextColor,
  };
  const separatorStyle: CSSProperties = {
    marginTop: tokens.sectionSpacing,
    marginBottom: tokens.sectionSpacing,
    borderTop: `1px solid ${tokens.separatorColor}`,
  };

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>
        <span style={markerStyle} />
        <span>
          {item.meta?.title ?? item.groupKey}
          {unloaded ? " (未装箱)" : ""}
        </span>
      </div>
      <div style={mutedLineStyle}>序号: {item.seq}</div>
      <div>尺寸: {item.xLength}×{item.yLength}×{item.zLength} cm</div>
      {item.posX || item.posY || item.posZ ? <div style={mutedLineStyle}>位置: ({item.posX}, {item.posY}, {item.posZ})</div> : null}
      {item.meta?.lines?.length ? (
        <>
          <div style={separatorStyle} />
          {item.meta.lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </>
      ) : null}
    </div>
  );
}

const ContainerBox = memo(function ContainerBox({ container, palette }: { container: SceneContainer; palette: ScenePalette }) {
  const { innerLength: l, innerWidth: w, innerHeight: h } = container;

  return (
    <group position={[l / 2, h / 2, w / 2]}>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(l, h, w)]} />
        <lineBasicMaterial color={palette.containerEdge} linewidth={2} />
      </lineSegments>
      <mesh>
        <boxGeometry args={[l, h, w]} />
        <meshBasicMaterial color={palette.containerFill} transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
});

const CargoBox = memo(function CargoBox({
  item,
  color,
  opacity,
  isHovered,
  isSelected,
  dimmed,
  hoverEnabled,
  palette,
  onHoverId,
  onUnhover,
  renderTooltip,
}: {
  item: SceneItem;
  color: string;
  opacity: number;
  isHovered: boolean;
  isSelected: boolean;
  dimmed: boolean;
  hoverEnabled: boolean;
  palette: ScenePalette;
  onHoverId: (id: string) => void;
  onUnhover: () => void;
  renderTooltip: (item: SceneItem, unloaded: boolean) => ReactNode;
}) {
  const x = item.posX / 100;
  const y = item.posZ / 100;
  const z = item.posY / 100;
  const xl = item.xLength / 100;
  const yl = item.zLength / 100;
  const zl = item.yLength / 100;
  const materialOpacity = dimmed ? opacity : 1;
  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!hoverEnabled) return;
      e.stopPropagation();
      onHoverId(item.id);
    },
    [hoverEnabled, item.id, onHoverId]
  );
  const handlePointerOut = useCallback(() => {
    if (!hoverEnabled) return;
    onUnhover();
  }, [hoverEnabled, onUnhover]);

  return (
    <group position={[x + xl / 2, y + yl / 2, z + zl / 2]}>
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <boxGeometry args={[xl, yl, zl]} />
        <meshStandardMaterial
          color={color}
          transparent={dimmed}
          opacity={materialOpacity}
          emissive={isSelected || isHovered ? color : "#000"}
          emissiveIntensity={isSelected ? 0.3 : isHovered ? 0.15 : 0}
          depthWrite
          polygonOffset
          polygonOffsetFactor={1}
          polygonOffsetUnits={1}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(xl, yl, zl)]} />
        <lineBasicMaterial color={dimmed ? palette.cargoDimEdge : palette.cargoEdge} transparent={dimmed} opacity={dimmed ? 0.3 : 1} />
      </lineSegments>
      {isHovered || isSelected ? <Html distanceFactor={8} style={{ pointerEvents: "none" }}>{renderTooltip(item, false)}</Html> : null}
    </group>
  );
});

const UnloadedCargoBox = memo(function UnloadedCargoBox({
  item,
  position,
  color,
  opacity,
  isHovered,
  isSelected,
  isDimmed,
  hoverEnabled,
  palette,
  onHoverId,
  onUnhover,
  renderTooltip,
}: {
  item: SceneItem;
  position: [number, number, number];
  color: string;
  opacity: number;
  isHovered: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  hoverEnabled: boolean;
  palette: ScenePalette;
  onHoverId: (id: string) => void;
  onUnhover: () => void;
  renderTooltip: (item: SceneItem, unloaded: boolean) => ReactNode;
}) {
  const xl = item.xLength / 100;
  const yl = item.zLength / 100;
  const zl = item.yLength / 100;
  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!hoverEnabled) return;
      e.stopPropagation();
      onHoverId(item.id);
    },
    [hoverEnabled, item.id, onHoverId]
  );
  const handlePointerOut = useCallback(() => {
    if (!hoverEnabled) return;
    onUnhover();
  }, [hoverEnabled, onUnhover]);

  return (
    <group position={position}>
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <boxGeometry args={[xl, yl, zl]} />
        <meshBasicMaterial color={color} transparent={isDimmed} opacity={isDimmed ? opacity : 1} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(xl, yl, zl)]} />
        <lineBasicMaterial color={isDimmed ? palette.cargoDimEdge : palette.cargoEdge} transparent={isDimmed} opacity={isDimmed ? 0.3 : 1} />
      </lineSegments>
      {isHovered || isSelected ? <Html distanceFactor={8} style={{ pointerEvents: "none" }}>{renderTooltip(item, true)}</Html> : null}
    </group>
  );
});

const UnloadedZone = memo(function UnloadedZone({
  unloadedItems,
  groupKeys,
  opacity,
  hasSelection,
  hoveredId,
  hoverEnabled,
  setHoveredId,
  theme,
  palette,
  getItemColor,
  renderTooltip,
}: {
  unloadedItems: SceneItem[];
  groupKeys: string[];
  opacity: number;
  hasSelection: boolean;
  hoveredId: string | null;
  hoverEnabled: boolean;
  setHoveredId: (id: string | null) => void;
  theme: "light" | "dark";
  palette: ScenePalette;
  getItemColor: (item: SceneItem, groupKeys: string[], theme: "light" | "dark") => string;
  renderTooltip: (item: SceneItem, unloaded: boolean) => ReactNode;
}) {
  if (unloadedItems.length === 0) return null;
  const handleUnhover = useCallback(() => setHoveredId(null), [setHoveredId]);

  const { layoutItems, zoneWidth, zoneDepth } = useMemo(() => {
    const gap = 0.1;
    const cols = 5;
    const baseItems = unloadedItems.map((item, idx) => {
      const xl = item.xLength / 100;
      const yl = item.zLength / 100;
      const zl = item.yLength / 100;
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      return { item, xl, yl, zl, col, row };
    });

    const maxXPerCol = new Array(cols).fill(0);
    const maxZPerRow = new Map<number, number>();
    baseItems.forEach(({ xl, zl, col, row }) => {
      maxXPerCol[col] = Math.max(maxXPerCol[col], xl);
      maxZPerRow.set(row, Math.max(maxZPerRow.get(row) || 0, zl));
    });

    const colOffsets = maxXPerCol.map((_, i) => maxXPerCol.slice(0, i).reduce((sum, value) => sum + value + gap, 0));
    const totalRows = Math.ceil(unloadedItems.length / cols);
    const rowOffsets: number[] = [];
    let accZ = 0;
    for (let row = 0; row < totalRows; row += 1) {
      rowOffsets.push(accZ);
      accZ += (maxZPerRow.get(row) || 0.5) + gap;
    }

    return {
      layoutItems: baseItems.map(({ item, xl, yl, zl, col, row }) => ({
        item,
        color: getItemColor(item, groupKeys, theme),
        position: [colOffsets[col] + xl / 2, yl / 2, rowOffsets[row] + zl / 2] as [number, number, number],
      })),
      zoneWidth: colOffsets[cols - 1] + maxXPerCol[cols - 1] + gap,
      zoneDepth: accZ,
    };
  }, [getItemColor, groupKeys, theme, unloadedItems]);

  const zoneStartZ = -0.5;

  return (
    <group position={[0, 0, zoneStartZ - zoneDepth]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[zoneWidth / 2, 0.001, zoneDepth / 2]}>
        <planeGeometry args={[zoneWidth + 0.2, zoneDepth + 0.2]} />
        <meshBasicMaterial color={palette.unloadedZoneFill} transparent opacity={Math.max(0.08, opacity * 0.18)} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments rotation={[-Math.PI / 2, 0, 0]} position={[zoneWidth / 2, 0.002, zoneDepth / 2]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(zoneWidth + 0.2, zoneDepth + 0.2)]} />
        <lineBasicMaterial color={palette.unloadedZoneLine} linewidth={2} />
      </lineSegments>
      <Text position={[zoneWidth / 2, 0.5, -0.15]} fontSize={0.15} color={palette.unloadedZoneText}>
        未装箱区 ({unloadedItems.length}件)
      </Text>

      {layoutItems.map(({ item, color, position }) => {
        const isHovered = hoveredId === item.id;

        return (
          <UnloadedCargoBox
            key={item.id}
            item={item}
            position={position}
            color={color}
            opacity={opacity}
            isHovered={isHovered}
            isSelected={hasSelection}
            isDimmed={false}
            hoverEnabled={hoverEnabled}
            palette={palette}
            onHoverId={setHoveredId}
            onUnhover={handleUnhover}
            renderTooltip={renderTooltip}
          />
        );
      })}
    </group>
  );
});

export default function Packing3DCore({
  container,
  items,
  allItems,
  unloadedItems = [],
  opacity = 0.75,
  highlightedIds = EMPTY_HIGHLIGHTED_IDS,
  theme = "light",
  paletteTokens,
  tooltipTokens,
  className,
  style,
  width = "100%",
  height = "100%",
  minHeight = 500,
  renderTooltip,
  getItemColor = getDefaultGroupColor,
}: Packing3DCoreProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const handleUnhover = useCallback(() => setHoveredId(null), []);
  const handleControlStart = useCallback(() => {
    setIsInteracting(true);
    setHoveredId(null);
  }, []);
  const handleControlEnd = useCallback(() => setIsInteracting(false), []);

  const stableItems = allItems ?? items;
  const groupKeys = useMemo(() => {
    const seen = new Set<string>();
    return [...stableItems, ...unloadedItems].reduce<string[]>((acc, item) => {
      if (!seen.has(item.groupKey)) {
        seen.add(item.groupKey);
        acc.push(item.groupKey);
      }
      return acc;
    }, []);
  }, [stableItems, unloadedItems]);

  const maxDim = Math.max(container.innerLength, container.innerWidth, container.innerHeight);
  const cameraDistance = maxDim * 1.8;
  const hasSelection = highlightedIds.size > 0;
  const visibleItems = hasSelection ? items.filter((item) => highlightedIds.has(item.id)) : items;
  const visibleUnloadedItems = hasSelection ? unloadedItems.filter((item) => highlightedIds.has(item.id)) : unloadedItems;
  const hoverEnabled = !isInteracting;
  const isDark = theme === "dark";
  const resolvedPalette = useMemo(() => resolveScenePalette(theme, paletteTokens), [theme, paletteTokens]);
  const resolvedTooltipTokens = useMemo(() => resolveSceneTooltipTokens(theme, tooltipTokens), [theme, tooltipTokens]);
  const tooltipRenderer = useMemo(
    () =>
      renderTooltip ??
      ((item: SceneItem, unloaded: boolean) => (
        <DefaultTooltip
          item={item}
          unloaded={unloaded}
          tokens={resolvedTooltipTokens}
          markerColor={getItemColor(item, groupKeys, theme)}
        />
      )),
    [getItemColor, groupKeys, renderTooltip, resolvedTooltipTokens, theme]
  );
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      width,
      height,
      minHeight,
      backgroundColor: resolvedPalette.backgroundFrom,
      backgroundImage: `linear-gradient(to bottom, ${resolvedPalette.backgroundFrom}, ${resolvedPalette.backgroundVia}, ${resolvedPalette.backgroundTo})`,
      ...style,
    }),
    [height, minHeight, resolvedPalette, style, width]
  );

  return (
    <div className={joinClassNames(className)} style={containerStyle}>
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{ alpha: true }}
        camera={{
          position: [cameraDistance, cameraDistance * 0.7, cameraDistance],
          fov: 50,
          near: 0.01,
          far: 1000,
        }}
      >
        <ambientLight intensity={isDark ? 0.9 : 0.65} />
        <directionalLight position={[10, 10, 5]} intensity={isDark ? 1.05 : 0.8} />
        <directionalLight position={[-5, 5, -5]} intensity={isDark ? 0.45 : 0.3} />

        <ContainerBox container={container} palette={resolvedPalette} />

        {visibleItems.map((item) => {
          const isSelected = hasSelection;
          const isHovered = hoveredId === item.id;

          return (
            <CargoBox
              key={item.id}
              item={item}
              color={getItemColor(item, groupKeys, theme)}
              opacity={opacity}
              isHovered={isHovered}
              isSelected={isSelected}
              dimmed={false}
              hoverEnabled={hoverEnabled}
              palette={resolvedPalette}
              onHoverId={setHoveredId}
              onUnhover={handleUnhover}
              renderTooltip={tooltipRenderer}
            />
          );
        })}

        <UnloadedZone
          unloadedItems={visibleUnloadedItems}
          groupKeys={groupKeys}
          opacity={opacity}
          hasSelection={hasSelection}
          hoveredId={hoveredId}
          hoverEnabled={hoverEnabled}
          setHoveredId={setHoveredId}
          theme={theme}
          palette={resolvedPalette}
          getItemColor={(item, keys) => getItemColor(item, keys, theme)}
          renderTooltip={tooltipRenderer}
        />

        <Text position={[container.innerLength / 2, -0.3, -0.3]} fontSize={0.2} color={resolvedPalette.axisText}>
          长 {container.innerLength}m
        </Text>
        <Text position={[-0.3, -0.3, container.innerWidth / 2]} fontSize={0.2} color={resolvedPalette.axisText} rotation={[0, Math.PI / 2, 0]}>
          宽 {container.innerWidth}m
        </Text>
        <Text position={[-0.3, container.innerHeight / 2, -0.3]} fontSize={0.2} color={resolvedPalette.axisText} rotation={[0, 0, Math.PI / 2]}>
          高 {container.innerHeight}m
        </Text>

        <gridHelper args={[maxDim * 2, 20, resolvedPalette.gridPrimary, resolvedPalette.gridSecondary]} position={[container.innerLength / 2, 0, container.innerWidth / 2]} />
        <OrbitControls makeDefault onStart={handleControlStart} onEnd={handleControlEnd} />
      </Canvas>
    </div>
  );
}
