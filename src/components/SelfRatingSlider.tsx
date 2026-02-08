'use client';

import { useState } from 'react';

interface SelfRatingSliderProps {
  question: string;
  value: number;
  onChange: (value: number) => void;
}

export default function SelfRatingSlider({ question, value, onChange }: SelfRatingSliderProps) {
  const [displayValue, setDisplayValue] = useState(value);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setDisplayValue(newValue);
    onChange(newValue);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <label className="text-sm font-medium text-gray-700 flex-1">
          {question}
        </label>
        <span className="text-2xl font-bold text-primary-600 ml-4 min-w-[3rem] text-right">
          {displayValue}
        </span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={displayValue}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${((displayValue - 1) / 9) * 100}%, #e5e7eb ${((displayValue - 1) / 9) * 100}%, #e5e7eb 100%)`
          }}
        />
        
        {/* Scale markers */}
        <div className="flex justify-between mt-2 px-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <span
              key={num}
              className={`text-xs ${
                num === displayValue ? 'text-primary-600 font-semibold' : 'text-gray-400'
              }`}
            >
              {num}
            </span>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #0ea5e9;
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #0ea5e9;
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
