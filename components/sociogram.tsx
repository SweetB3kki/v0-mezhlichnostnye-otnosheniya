"use client";

import { useMemo } from "react";
import type { SocialStatus, SociometryEdge } from "@/lib/sociometry";

type SociogramStudent = {
  id: string;
  firstName: string;
  lastName: string;
  status: SocialStatus;
  inDegree: number;
  outDegree: number;
  mutualChoices: number;
};

type SociogramProps = {
  students: SociogramStudent[];
  edges: SociometryEdge[];
};

type Point = { x: number; y: number };
type NodeVisual = Point & {
  id: string;
  fullName: string;
  status: SocialStatus;
  radius: number;
  fill: string;
  stroke: string;
  inDegree: number;
  outDegree: number;
  mutualChoices: number;
};

type LabelVisual = {
  id: string;
  text: string;
  x: number;
  y: number;
  anchor: "start" | "end";
  nodeX: number;
  nodeY: number;
};

const zoneConfig: Array<{
  status: SocialStatus;
  label: string;
  radius: number;
  nodeRadius: number;
  fill: string;
  stroke: string;
}> = [
  { status: "STAR", label: "I - Звезды", radius: 84, nodeRadius: 14, fill: "#c8b6ff", stroke: "#7c3aed" },
  { status: "PREFERRED", label: "II - Предпочитаемые", radius: 162, nodeRadius: 12, fill: "#ffd6e8", stroke: "#db2777" },
  { status: "NEGLECTED", label: "III - Пренебрегаемые", radius: 240, nodeRadius: 10, fill: "#eef2ff", stroke: "#7c3aed" },
  { status: "ISOLATED", label: "IV - Изолированные", radius: 318, nodeRadius: 8, fill: "#f3f4f6", stroke: "#9ca3af" },
];

const svgSize = 920;
const center = svgSize / 2;
const outerRadius = 340;

function pointsOnCircle(count: number, radius: number): Point[] {
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, index) => {
    const angle = (2 * Math.PI * index) / count - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });
}

function curveSign(fromId: string, toId: string): number {
  return fromId < toId ? 1 : -1;
}

function buildEdgePath(fromNode: NodeVisual, toNode: NodeVisual, edge: SociometryEdge): string {
  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return "";

  const ux = dx / distance;
  const uy = dy / distance;
  const nx = -uy;
  const ny = ux;

  const startPadding = fromNode.radius + 2;
  const endPadding = toNode.radius + 9;
  const sx = fromNode.x + ux * startPadding;
  const sy = fromNode.y + uy * startPadding;
  const ex = toNode.x - ux * endPadding;
  const ey = toNode.y - uy * endPadding;

  const midX = (sx + ex) / 2;
  const midY = (sy + ey) / 2;

  const curve = edge.mutual ? 24 * curveSign(edge.from, edge.to) : 8 * curveSign(edge.from, edge.to);
  const cx = midX + nx * curve;
  const cy = midY + ny * curve;

  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
}

export function Sociogram({ students, edges }: SociogramProps) {
  const studentsSorted = useMemo(() => {
    return [...students].sort((a, b) => {
      const byLast = a.lastName.localeCompare(b.lastName, "ru");
      if (byLast !== 0) return byLast;
      return a.firstName.localeCompare(b.firstName, "ru");
    });
  }, [students]);

  const nodesById = useMemo(() => {
    const map = new Map<string, NodeVisual>();

    for (const zone of zoneConfig) {
      const inZone = studentsSorted.filter((student) => student.status === zone.status);

      const points =
        zone.status === "STAR" && inZone.length === 1
          ? [{ x: center, y: center }]
          : pointsOnCircle(inZone.length, zone.radius);

      inZone.forEach((student, index) => {
        const point = points[index];
        map.set(student.id, {
          id: student.id,
          fullName: `${student.lastName} ${student.firstName}`,
          status: student.status,
          x: point.x,
          y: point.y,
          radius: zone.nodeRadius,
          fill: zone.fill,
          stroke: zone.stroke,
          inDegree: student.inDegree,
          outDegree: student.outDegree,
          mutualChoices: student.mutualChoices,
        });
      });
    }

    return map;
  }, [studentsSorted]);

  const labelVisuals = useMemo(() => {
    const raw: Array<LabelVisual & { side: "left" | "right" }> = Array.from(nodesById.values()).map((node) => {
      const dx = node.x - center;
      const dy = node.y - center;
      const length = Math.hypot(dx, dy) || 1;
      const ux = dx / length;
      const uy = dy / length;

      const labelDistance = node.radius + 22;
      const baseX = node.x + ux * labelDistance;
      const baseY = node.y + uy * labelDistance;
      const side: "left" | "right" = baseX >= center ? "right" : "left";

      return {
        id: node.id,
        text: node.fullName,
        x: baseX,
        y: baseY,
        anchor: side === "right" ? "start" : "end",
        side,
        nodeX: node.x,
        nodeY: node.y,
      };
    });

    const minGap = 16;
    const topLimit = 32;
    const bottomLimit = svgSize - 24;

    for (const side of ["left", "right"] as const) {
      const sideLabels = raw
        .filter((label) => label.side === side)
        .sort((a, b) => a.y - b.y);

      for (let i = 1; i < sideLabels.length; i += 1) {
        const prev = sideLabels[i - 1];
        const current = sideLabels[i];
        if (current.y - prev.y < minGap) {
          current.y = prev.y + minGap;
        }
      }

      if (sideLabels.length > 0 && sideLabels[sideLabels.length - 1].y > bottomLimit) {
        sideLabels[sideLabels.length - 1].y = bottomLimit;
        for (let i = sideLabels.length - 2; i >= 0; i -= 1) {
          const next = sideLabels[i + 1];
          if (next.y - sideLabels[i].y < minGap) {
            sideLabels[i].y = next.y - minGap;
          }
        }
      }

      for (const label of sideLabels) {
        if (label.y < topLimit) label.y = topLimit;
      }
    }

    return raw.map((label) => ({
      id: label.id,
      text: label.text,
      x: label.x,
      y: label.y,
      anchor: label.anchor,
      nodeX: label.nodeX,
      nodeY: label.nodeY,
    }));
  }, [nodesById]);

  const graphEdges = useMemo(() => {
    return edges
      .filter((edge) => nodesById.has(edge.from) && nodesById.has(edge.to) && edge.from !== edge.to)
      .map((edge) => {
        const fromNode = nodesById.get(edge.from)!;
        const toNode = nodesById.get(edge.to)!;
        return {
          edge,
          fromNode,
          toNode,
          path: buildEdgePath(fromNode, toNode, edge),
        };
      })
      .filter((item) => item.path.length > 0);
  }, [edges, nodesById]);

  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 text-[var(--ink-secondary)]">
        Нет данных для построения социограммы.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-[var(--ink-secondary)]">
        <span className="px-2 py-1 rounded-md bg-[#ede9fe] border border-[#d8b4fe] text-[var(--ink)]">I: Звезды</span>
        <span className="px-2 py-1 rounded-md bg-[#fce7f3] border border-[#f9a8d4] text-[var(--ink)]">II: Предпочитаемые</span>
        <span className="px-2 py-1 rounded-md bg-[#eef2ff] border border-[#c4b5fd] text-[var(--ink-secondary)]">III: Пренебрегаемые</span>
        <span className="px-2 py-1 rounded-md bg-[#f9fafb] border border-[#d1d5db] text-[var(--ink-secondary)]">IV: Изолированные</span>
        <span className="px-2 py-1 rounded-md bg-white border border-[var(--border)] text-[var(--ink-secondary)]">
          Серый вектор: односторонний выбор
        </span>
        <span className="px-2 py-1 rounded-md bg-white border border-[var(--border)] text-[var(--ink-secondary)]">
          Фиолетовый вектор: взаимный выбор
        </span>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white p-2">
        <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full h-auto max-h-[78vh]">
          <defs>
            <marker id="socio-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
            </marker>
            <marker id="socio-arrow-mutual" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.4" markerHeight="5.4" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6d28d9" />
            </marker>
          </defs>

          <circle cx={center} cy={center} r={outerRadius} fill="#f9fafb" />
          <circle cx={center} cy={center} r={zoneConfig[2].radius} fill="#eef2ff" />
          <circle cx={center} cy={center} r={zoneConfig[1].radius} fill="#fce7f3" />
          <circle cx={center} cy={center} r={zoneConfig[0].radius} fill="#ede9fe" />

          <line x1={center} y1={center - outerRadius} x2={center} y2={center + outerRadius} stroke="#9ca3af" strokeWidth={1.4} />
          <text x={center + 10} y={center - outerRadius + 20} className="fill-[var(--ink-secondary)] text-[12px]">
            Сектор I
          </text>
          <text x={center + 10} y={center + outerRadius - 10} className="fill-[var(--ink-secondary)] text-[12px]">
            Сектор II
          </text>

          {zoneConfig.map((zone, index) => (
            <g key={zone.status}>
              <circle
                cx={center}
                cy={center}
                r={zone.radius}
                fill="none"
                stroke="#9ca3af"
                strokeWidth={index === zoneConfig.length - 1 ? 1.6 : 1.2}
                strokeDasharray={index === zoneConfig.length - 1 ? "6 5" : undefined}
              />
            </g>
          ))}

          {graphEdges.map(({ edge, path, fromNode, toNode }) => (
            <path
              key={`${edge.from}->${edge.to}`}
              d={path}
              fill="none"
              stroke={edge.mutual ? "#6d28d9" : "#9ca3af"}
              strokeWidth={edge.mutual ? 2 : 1.2}
              markerEnd={edge.mutual ? "url(#socio-arrow-mutual)" : "url(#socio-arrow)"}
              opacity={edge.mutual ? 0.9 : 0.75}
            >
              <title>
                {`${fromNode.fullName} → ${toNode.fullName}${edge.mutual ? " (взаимный выбор)" : ""}`}
              </title>
            </path>
          ))}

          {labelVisuals.map((label) => (
            <g key={`${label.id}-leader`}>
              <line
                x1={label.nodeX}
                y1={label.nodeY}
                x2={label.x}
                y2={label.y}
                stroke="#c4b5fd"
                strokeWidth={0.8}
                opacity={0.7}
              />
            </g>
          ))}

          {Array.from(nodesById.values()).map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.radius}
                fill={node.fill}
                stroke={node.stroke}
                strokeWidth={2}
              >
                <title>
                  {`${node.fullName}\nСтатус: ${zoneConfig.find((zone) => zone.status === node.status)?.label ?? node.status}\nВходящие: ${node.inDegree}\nИсходящие: ${node.outDegree}\nВзаимные: ${node.mutualChoices}`}
                </title>
              </circle>
            </g>
          ))}

          {labelVisuals.map((label) => (
            <g key={`${label.id}-label`}>
              <text
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                className="fill-[var(--ink)] text-[12px]"
              >
                {label.text}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
