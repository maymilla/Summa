import React from 'react';
import styled from 'styled-components';

interface HoverCardProps {
  children: React.ReactNode;
  backgroundColor?: string;
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
  colorCycle?: number;
}

const StyledWrapper = styled.div<{
  $backgroundColor?: string;
  $width?: string;
  $height?: string;
  $borderRadius?: string;
  $colorCycle?: number;
}>`
  .hover-card {
    position: relative;
    display: block;
    width: ${props => props.$width || '100%'};
    max-width: 419px;
    min-width: 320px;
    height: ${props => props.$height || '124px'};
    border-radius: ${props => props.$borderRadius || '20px'};
    box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.25);
    margin: 0 auto;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease;
    background-color: ${props => {
      if (props.$backgroundColor) return props.$backgroundColor;
      const colors = ['rgba(255, 234, 253, 0.9)', 'rgba(233, 223, 255, 0.9)', 'rgba(235, 245, 255, 0.9)'];
      const cycle = props.$colorCycle || 0;
      return colors[cycle % 3];
    }};
  }

  .hover-card:hover {
    transform: translateY(-2px);
  }

  .card-bg {
    overflow: hidden;
    border-radius: ${props => props.$borderRadius || '20px'};
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: scale(1);
    transition: transform 1.8s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .card-bg-layers {
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    top: -60%;
    aspect-ratio: 1 / 1;
    width: max(200%, 10rem);
  }

  .card-bg-layer {
    border-radius: 9999px;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: scale(0);
  }

  .card-bg-layer.-purple {
    background-color: ${props => {
      const colors = ['rgba(233, 223, 255, 0.9)', 'rgba(235, 245, 255, 0.9)', 'rgba(255, 234, 253, 0.9)'];
      const cycle = props.$colorCycle || 0;
      return colors[cycle % 3];
    }};
  }

  .card-bg-layer.-turquoise {
    background-color: ${props => {
      const colors = ['rgba(233, 223, 255, 0.9)', 'rgba(235, 245, 255, 0.9)', 'rgba(255, 234, 253, 0.9)'];
      const cycle = props.$colorCycle || 0;
      return colors[(cycle + 1) % 3];
    }};
  }

  .card-bg-layer.-yellow {
    background-color: ${props => {
      const colors = ['rgba(233, 223, 255, 0.9)', 'rgba(235, 245, 255, 0.9)', 'rgba(255, 234, 253, 0.9)'];
      const cycle = props.$colorCycle || 0;
      return colors[(cycle + 2) % 3];
    }};
  }

  .card-content {
    position: relative;
    z-index: 10;
    padding: 1rem;
    height: 100%;
  }

  .card-inner {
    position: relative;
  }

  .card-inner-static {
    display: block;
    transition: transform 1.4s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s linear;
  }

  .card-inner-hover {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    transform: translateY(70%);
    display: block;
    transition: transform 1.4s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.4s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .hover-card:hover .card-inner-static {
    opacity: 0;
    transform: translateY(-70%);
  }

  .hover-card:hover .card-inner-hover {
    opacity: 1;
    transform: translateY(0);
  }

  .hover-card:hover .card-bg-layer {
    transition: transform 1.3s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s linear;
  }

  .hover-card:hover .card-bg-layer-1 {
    transform: scale(1);
  }

  .hover-card:hover .card-bg-layer-2 {
    transition-delay: 0.1s;
    transform: scale(1);
  }

  .hover-card:hover .card-bg-layer-3 {
    transition-delay: 0.2s;
    transform: scale(1);
  }
`;

export default function HoverCard({
  children,
  backgroundColor,
  width,
  height,
  borderRadius,
  className,
  style,
  colorCycle = 0,
}: HoverCardProps) {
  return (
    <StyledWrapper
      $backgroundColor={backgroundColor}
      $width={width}
      $height={height}
      $borderRadius={borderRadius}
      $colorCycle={colorCycle}
    >
      <div className={`hover-card ${className || ''}`} style={style}>
        <span className="card-bg">
          <span className="card-bg-layers">
            <span className="card-bg-layer card-bg-layer-1 -purple" />
            <span className="card-bg-layer card-bg-layer-2 -turquoise" />
            <span className="card-bg-layer card-bg-layer-3 -yellow" />
          </span>
        </span>
        
        <div className="card-content">
          {children}
        </div>
      </div>
    </StyledWrapper>
  );
}

// Export a hook for content with hover effects
export function useHoverContent(content: React.ReactNode) {
  return (
    <div className="card-inner">
      <div className="card-inner-static">{content}</div>
      <div className="card-inner-hover">{content}</div>
    </div>
  );
}
