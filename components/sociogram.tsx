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
type Gender = "male" | "female";
type Shape = "triangle" | "circle";

type NodeVisual = Point & {
  id: string;
  fullName: string;
  orderNumber: number;
  status: SocialStatus;
  radius: number;
  fill: string;
  stroke: string;
  inDegree: number;
  outDegree: number;
  mutualChoices: number;
  gender: Gender;
  shape: Shape;
};

const zoneConfig: Array<{
  status: SocialStatus;
  label: string;
  radius: number;
  nodeRadius: number;
  fill: string;
  stroke: string;
}> = [
  { status: "STAR", label: "I - Звезды", radius: 84, nodeRadius: 15, fill: "#c8b6ff", stroke: "#7c3aed" },
  { status: "PREFERRED", label: "II - Предпочитаемые", radius: 162, nodeRadius: 13, fill: "#ffd6e8", stroke: "#db2777" },
  { status: "NEGLECTED", label: "III - Пренебрегаемые", radius: 240, nodeRadius: 11, fill: "#eef2ff", stroke: "#7c3aed" },
  { status: "ISOLATED", label: "IV - Изолированные", radius: 318, nodeRadius: 10, fill: "#f3f4f6", stroke: "#9ca3af" },
];

const svgSize = 920;
const center = svgSize / 2;
const outerRadius = 340;

const maleEndingExceptions = new Set([
  "илья",
  "никита",
  "лева",
  "лёва",
  "кузьма",
  "фома",
  "данила",
  "савва",
  "лука",
]);

function inferGender(firstName: string): Gender {
  const normalized = firstName.trim().toLowerCase();
  if (!normalized) return "female";
  if (maleEndingExceptions.has(normalized)) return "male";

  const endsWithFemale =
    normalized.endsWith("а") ||
    normalized.endsWith("я") ||
    normalized.endsWith("ия") ||
    normalized.endsWith("ья");

  return endsWithFemale ? "female" : "male";
}

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
  const endPadding = toNode.radius + 10;
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

function trianglePoints(node: NodeVisual): string {
  const r = node.radius;
  const top: Point = { x: node.x, y: node.y - r };
  const left: Point = { x: node.x - r * 0.9, y: node.y + r * 0.75 };
  const right: Point = { x: node.x + r * 0.9, y: node.y + r * 0.75 };
  return `${top.x.toFixed(2)},${top.y.toFixed(2)} ${right.x.toFixed(2)},${right.y.toFixed(2)} ${left.x.toFixed(2)},${left.y.toFixed(2)}`;
}

function symbolForNode(shape: Shape): string {
  return shape === "triangle" ? "▲" : "●";
}

export function Sociogram({ students, edges }: SociogramProps) {
  const studentsSorted = useMemo(() => {
    return [...students].sort((a, b) => {
      const byLast = a.lastName.localeCompare(b.lastName, "ru");
      if (byLast !== 0) return byLast;
      return a.firstName.localeCompare(b.firstName, "ru");
    });
  }, [students]);

  const orderByStudentId = useMemo(() => {
    const map = new Map<string, number>();
    studentsSorted.forEach((student, index) => {
      map.set(student.id, index + 1);
    });
    return map;
  }, [studentsSorted]);

  const nodesById = useMemo(() => {
    const map = new Map<string, NodeVisual>();

    for (const zone of zoneConfig) {
      const inZone = studentsSorted
        .filter((student) => student.status === zone.status)
        .sort((a, b) => (orderByStudentId.get(a.id) ?? 0) - (orderByStudentId.get(b.id) ?? 0));

      const points =
        zone.status === "STAR" && inZone.length === 1
          ? [{ x: center, y: center }]
          : pointsOnCircle(inZone.length, zone.radius);

      inZone.forEach((student, index) => {
        const point = points[index];
        const gender = inferGender(student.firstName);
        const shape: Shape = gender === "male" ? "triangle" : "circle";

        map.set(student.id, {
          id: student.id,
          fullName: `${student.lastName} ${student.firstName}`,
          orderNumber: orderByStudentId.get(student.id) ?? 0,
          status: student.status,
          x: point.x,
          y: point.y,
          radius: zone.nodeRadius,
          fill: zone.fill,
          stroke: zone.stroke,
          inDegree: student.inDegree,
          outDegree: student.outDegree,
          mutualChoices: student.mutualChoices,
          gender,
          shape,
        });
      });
    }

    return map;
  }, [studentsSorted, orderByStudentId]);

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

  const classList = useMemo(() => {
    return studentsSorted.map((student) => {
      const node = nodesById.get(student.id);
      return {
        id: student.id,
        orderNumber: orderByStudentId.get(student.id) ?? 0,
        fullName: `${student.lastName} ${student.firstName}`,
        shape: node?.shape ?? "circle",
        status: student.status,
      };
    });
  }, [studentsSorted, nodesById, orderByStudentId]);

  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-6 text-[var(--ink-secondary)]">
        Нет данных для построения социограммы.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2 text-sm text-[var(--ink-secondary)]">
        <span className="px-2 py-1 rounded-md bg-[#ede9fe] border border-[#d8b4fe] text-[var(--ink)]">I: Звезды</span>
        <span className="px-2 py-1 rounded-md bg-[#fce7f3] border border-[#f9a8d4] text-[var(--ink)]">II: Предпочитаемые</span>
        <span className="px-2 py-1 rounded-md bg-[#eef2ff] border border-[#c4b5fd] text-[var(--ink-secondary)]">III: Пренебрегаемые</span>
        <span className="px-2 py-1 rounded-md bg-[#f9fafb] border border-[#d1d5db] text-[var(--ink-secondary)]">IV: Изолированные</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-3 items-start">
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

            {zoneConfig.map((zone, index) => (
              <circle
                key={zone.status}
                cx={center}
                cy={center}
                r={zone.radius}
                fill="none"
                stroke="#9ca3af"
                strokeWidth={index === zoneConfig.length - 1 ? 1.6 : 1.2}
                strokeDasharray={index === zoneConfig.length - 1 ? "6 5" : undefined}
              />
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
                <title>{`${fromNode.orderNumber}. ${fromNode.fullName} -> ${toNode.orderNumber}. ${toNode.fullName}${edge.mutual ? " (взаимный выбор)" : ""}`}</title>
              </path>
            ))}

            {Array.from(nodesById.values()).map((node) => (
              <g key={node.id}>
                {node.shape === "triangle" ? (
                  <polygon
                    points={trianglePoints(node)}
                    fill={node.fill}
                    stroke={node.stroke}
                    strokeWidth={2}
                  >
                    <title>
                      {`${node.orderNumber}. ${node.fullName}\nВходящие: ${node.inDegree}\nИсходящие: ${node.outDegree}\nВзаимные: ${node.mutualChoices}`}
                    </title>
                  </polygon>
                ) : (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={node.fill}
                    stroke={node.stroke}
                    strokeWidth={2}
                  >
                    <title>
                      {`${node.orderNumber}. ${node.fullName}\nВходящие: ${node.inDegree}\nИсходящие: ${node.outDegree}\nВзаимные: ${node.mutualChoices}`}
                    </title>
                  </circle>
                )}

                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  className="fill-[var(--ink)] text-[11px] font-semibold"
                >
                  {node.orderNumber}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-white p-3 space-y-3">
          <div className="text-sm font-semibold text-[var(--ink)]">Список класса</div>

          <div className="space-y-1 max-h-[72vh] overflow-auto pr-1">
            {classList.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm px-2 py-1 rounded-md bg-[var(--cloud-bg)]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] text-[var(--ink-secondary)] w-5 text-right">{item.orderNumber}.</span>
                  <span className="text-[var(--ink)] truncate">{item.fullName}</span>
                </div>
                <span className="text-[11px] text-[var(--ink-secondary)] ml-2 shrink-0">{symbolForNode(item.shape)}</span>
              </div>
            ))}
          </div>

          <div className="text-xs text-[var(--ink-secondary)] space-y-1 pt-1 border-t border-[var(--border)]">
            <div>▲ — мальчики, ● — девочки</div>
            <div>Серая стрелка — односторонний выбор</div>
            <div>Фиолетовая стрелка — взаимный выбор</div>
          </div>
        </div>
      </div>
    </div>
  );
}
