import React, { useMemo } from 'react';
import { Line, Sphere, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#10b981',
  black: '#94a3b8',
  white: '#f1f5f9'
};

const GeometryViewer = ({ data, currentStep = 0 }) => {
  if (!data || !data.vertices) return null;

  // Render base edges
  const baseEdges = useMemo(() => {
    if (!data.edges) return [];
    return data.edges.map((edge, idx) => {
      const p1 = data.vertices[edge[0]];
      const p2 = data.vertices[edge[1]];
      if (!p1 || !p2) return null;
      return (
        <Line
          key={`base-edge-${idx}`}
          points={[p1, p2]}
          color={COLORS.black}
          lineWidth={2}
          transparent
          opacity={0.4}
        />
      );
    });
  }, [data]);

  // Render steps (up to currentStep)
  const stepElements = useMemo(() => {
    if (!data.steps) return [];
    const elements = [];
    
    data.steps.forEach((step) => {
      if (step.step_number <= currentStep) {
        step.draw_elements.forEach((el, elIdx) => {
          const key = `step-${step.step_number}-el-${elIdx}`;
          
          if (el.type === 'line') {
            const p1 = data.vertices[el.from];
            const p2 = data.vertices[el.to];
            if (p1 && p2) {
              elements.push(
                <Line
                  key={key}
                  points={[p1, p2]}
                  color={COLORS[el.color] || COLORS.red}
                  lineWidth={el.style === 'solid' ? 4 : 2}
                  dashed={el.style === 'dashed'}
                  dashScale={el.style === 'dashed' ? 50 : 0}
                  transparent
                  opacity={0.9}
                />
              );
            }
          } else if (el.type === 'point') {
            const p = data.vertices[el.name];
            if (p) {
              elements.push(
                <Sphere key={key} position={p} args={[0.08, 16, 16]}>
                  <meshStandardMaterial 
                    color={COLORS[el.color] || COLORS.blue} 
                    emissive={COLORS[el.color] || COLORS.blue}
                    emissiveIntensity={2}
                  />
                </Sphere>
              );
            }
          }
        });
      }
    });
    return elements;
  }, [data, currentStep]);

  // Render vertices & labels
  const vertexElements = useMemo(() => {
    return Object.entries(data.vertices).map(([name, coords]) => (
      <group key={`vertex-${name}`} position={coords}>
        <Sphere args={[0.05, 16, 16]}>
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </Sphere>
        <Html distanceFactor={10}>
          <div className="bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded border border-white/20 text-[10px] font-bold text-white whitespace-nowrap select-none pointer-events-none transform -translate-x-1/2 -translate-y-full mb-1 shadow-lg">
            {name}
          </div>
        </Html>
      </group>
    ));
  }, [data.vertices]);

  return (
    <group>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        {baseEdges}
        {stepElements}
        {vertexElements}
      </Float>
    </group>
  );
};

export default GeometryViewer;
