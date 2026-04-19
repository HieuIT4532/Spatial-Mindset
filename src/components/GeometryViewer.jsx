import React, { useMemo } from 'react';
import { Line, Sphere, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import SpatialVector from './Math/SpatialVector';

const COLORS = {
  red: '#f43f5e',
  blue: '#22d3ee',
  green: '#2dd4bf',
  black: '#475569',
  white: '#f1f5f9',
  labelLight: '#0f172a',
  labelDark: '#f8fafc'
};

const GeometryViewer = ({ data, currentStep = 0, theme = 'dark', showAxes = true }) => {
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
          color={theme === 'dark' ? '#475569' : '#cbd5e1'}
          lineWidth={2}
          transparent
          opacity={0.6}
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
                  lineWidth={el.style === 'solid' ? 5 : 3}
                  dashed={el.style === 'dashed'}
                  dashScale={1}
                  dashSize={0.2}
                  gapSize={0.15}
                  transparent
                  opacity={0.9}
                />
              );
            }
          } else if (el.type === 'vector' || el.type === 'arrow') {
            const p1 = data.vertices[el.from] || [0, 0, 0];
            const p2 = data.vertices[el.to];
            if (p2) {
              elements.push(
                <SpatialVector
                  key={key}
                  start={p1}
                  end={p2}
                  color={COLORS[el.color] || COLORS.blue}
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

  // Render 3D Vectors (Prompt 3 Mission 1)
  const vectorElements = useMemo(() => {
    if (!data.vectors) return [];
    return data.vectors.map((vec, idx) => {
      const origin = new THREE.Vector3(...vec.start);
      const dir = new THREE.Vector3(...vec.direction).normalize();
      const length = vec.length || 2;
      return (
        <primitive 
          key={`vector-${idx}`} 
          object={new THREE.ArrowHelper(dir, origin, length, 0x22d3ee, 0.2, 0.1)} 
        />
      );
    });
  }, [data.vectors]);

  // Render vertices & labels
  const vertexElements = useMemo(() => {
    return Object.entries(data.vertices).map(([name, coords]) => (
      <group key={`vertex-${name}`} position={coords}>
        <Sphere args={[0.06, 16, 16]}>
          <meshStandardMaterial
            color={theme === 'dark' ? '#ffffff' : '#0f172a'}
            emissive={theme === 'dark' ? '#ffffff' : '#0f172a'}
            emissiveIntensity={theme === 'dark' ? 0.3 : 0}
          />
        </Sphere>
        <Html distanceFactor={10}>
          <div className={`px-2 py-0.5 rounded border text-[10px] font-bold whitespace-nowrap select-none pointer-events-none transform -translate-x-1/2 -translate-y-full mb-1 shadow-lg transition-all
            ${theme === 'dark'
              ? 'bg-slate-900/80 border-white/20 text-white backdrop-blur-sm'
              : 'bg-white/90 border-slate-200 text-slate-900 backdrop-blur-sm'}`}>
            {name}
          </div>
        </Html>
      </group>
    ));
  }, [data.vertices]);

  return (
    <group>
      {showAxes && <axesHelper args={[2]} />}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        {baseEdges}
        {stepElements}
        {vectorElements}
        {vertexElements}
      </Float>
    </group>
  );
};

export default GeometryViewer;
