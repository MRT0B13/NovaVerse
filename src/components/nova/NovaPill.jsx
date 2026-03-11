import React from 'react';

export default function NovaPill({ text, color = '#c084fc' }) {
  return (
    <span
      className="font-mono text-[10px] uppercase px-2 py-[2px] rounded-[3px] inline-flex items-center"
      style={{
        letterSpacing: '0.05em',
        ...{
      style={{
        color,
        backgroundColor: color + '18',
        border: `1px solid ${color}40`,
      }}
    >
      {text}
    </span>
  );
}