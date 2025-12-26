
import React, { useEffect, useState, useRef } from 'react';
import { Theme } from '../types';

interface TileProps {
  value: number;
  theme: Theme;
}

const Tile: React.FC<TileProps> = ({ value, theme }) => {
  const isDark = theme === Theme.DARK;
  const [animClass, setAnimClass] = useState('');
  const prevValue = useRef(value);

  useEffect(() => {
    if (value === 0) {
      setAnimClass('');
      prevValue.current = 0;
      return;
    }

    if (prevValue.current === 0 && value > 0) {
      setAnimClass('animate-tile-pop');
    } else if (prevValue.current !== value && value > 0) {
      setAnimClass('');
      const raf = requestAnimationFrame(() => {
        setAnimClass('animate-tile-merge');
      });
      return () => cancelAnimationFrame(raf);
    }

    prevValue.current = value;
  }, [value]);

  const getColors = (val: number) => {
    if (val === 0) return isDark ? 'bg-gray-800/20' : 'bg-[#f5f0e8]';

    if (isDark) {
      // Vibrant Dark Mode: Neon Jewel Tones
      switch (val) {
        case 2: return 'bg-[#2d3748] text-[#e2e8f0] border-[#4a5568]';
        case 4: return 'bg-[#c05621] text-white border-[#dd6b20]'; // Amber Glow
        case 8: return 'bg-[#b83280] text-white border-[#d53f8c]'; // Magenta Flare
        case 16: return 'bg-[#805ad5] text-white border-[#9f7aea]'; // Purple Spark
        case 32: return 'bg-[#3182ce] text-white border-[#4299e1]'; // Electric Blue
        case 64: return 'bg-[#38a169] text-white border-[#48bb78]'; // Neon Green
        case 128: return 'bg-[#d69e2e] text-white border-[#ecc94b]'; // Golden Sun
        case 256: return 'bg-[#e53e3e] text-white border-[#f56565]'; // Ruby Red
        case 512: return 'bg-[#00b5d8] text-white border-[#0bc5ea]'; // Cyan Beam
        case 1024: return 'bg-[#ed64a6] text-white border-[#f687b3]'; // Pink Laser
        case 2048: return 'bg-gradient-to-br from-[#ff0080] via-[#7928ca] to-[#3b82f6] text-white border-white shadow-[0_0_25px_rgba(255,0,128,0.6)]'; 
        default: return 'bg-gray-900 text-white';
      }
    } else {
      // Vibrant Light Mode: Candy-Pop Palette
      switch (val) {
        case 2: return 'bg-[#ffccd5] text-[#ff4d6d] border-2 border-[#ffb3c1]'; // Strawberry Milk
        case 4: return 'bg-[#ffe5b4] text-[#fb8500] border-2 border-[#ffd7ba]'; // Peach Candy
        case 8: return 'bg-[#fdffb6] text-[#ffd60a] border-2 border-[#f9ffb3]'; // Lemon Drop
        case 16: return 'bg-[#caffbf] text-[#38b000] border-2 border-[#b9fbc0]'; // Minty Kitten
        case 32: return 'bg-[#9bf6ff] text-[#0077b6] border-2 border-[#a0f6ff]'; // Blue Raspberry
        case 64: return 'bg-[#a0c4ff] text-[#3a86ff] border-2 border-[#bdb2ff]'; // Periwinkle
        case 128: return 'bg-[#bdb2ff] text-[#5a189a] border-2 border-[#d0d1ff]'; // Grape Soda
        case 256: return 'bg-[#ffc6ff] text-[#ff006e] border-2 border-[#ffd6ff]'; // Bubblegum
        case 512: return 'bg-[#ffadad] text-[#d00000] border-2 border-[#ffc1c1]'; // Cherry Pop
        case 1024: return 'bg-[#ffd6a5] text-[#fb5607] border-2 border-[#ffe5cc]'; // Apricot
        case 2048: return 'bg-gradient-to-br from-[#ff006e] via-[#8338ec] to-[#3a86ff] text-white border-2 border-white shadow-[0_8px_15px_rgba(131,56,236,0.3)]'; 
        default: return 'bg-white text-gray-800';
      }
    }
  };

  const fontSize = value > 1000 ? 'text-2xl sm:text-3xl' : value > 100 ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl';
  const colors = getColors(value);

  if (value === 0) {
    return (
      <div className={`w-full h-full rounded-2xl ${isDark ? 'bg-[#1a1c23]' : 'bg-[#f5f0e8]'} opacity-40`} />
    );
  }

  // Extract the background color class to apply to the ears
  // For gradients, we use a fallback color from the primary palette
  const baseBg = colors.includes('gradient') ? (isDark ? 'bg-[#7928ca]' : 'bg-[#8338ec]') : colors.split(' ').find(c => c.startsWith('bg-')) || 'bg-white';

  return (
    <div className={`w-full h-full relative group ${animClass}`}>
      {/* Ear Left */}
      <div 
        className={`absolute -top-2.5 left-2 w-[30%] h-[30%] rounded-full ${baseBg} border-t-2 border-l-2 transition-all duration-300 transform -rotate-12 z-0`}
        style={{ borderColor: 'inherit' }}
      />
      {/* Ear Right */}
      <div 
        className={`absolute -top-2.5 right-2 w-[30%] h-[30%] rounded-full ${baseBg} border-t-2 border-r-2 transition-all duration-300 transform rotate-12 z-0`}
        style={{ borderColor: 'inherit' }}
      />
      
      {/* Tile Body */}
      <div className={`w-full h-full rounded-2xl flex items-center justify-center font-black select-none border-b-4 transition-all duration-150 ease-in-out relative z-10 ${colors}`}>
        <span className={`${fontSize} font-['Nunito'] drop-shadow-sm`}>
          {value}
        </span>
      </div>
    </div>
  );
};

export default Tile;
