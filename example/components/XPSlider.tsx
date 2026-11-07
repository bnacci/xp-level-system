"use client";

import * as Slider from "@radix-ui/react-slider";
import { GripVertical, Minus, Plus } from "lucide-react";

export function XPSlider({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (value: number) => void;
}) {
  return (
    <div className="xp-slider-field">
      <div className="range-label">
        <span id="base-xp-label">Base XP</span>
        <output id="base-xp-value">{value} XP</output>
      </div>
      <div className="xp-slider-controls">
        <button
          className="slider-step"
          aria-label="Decrease base XP by 50"
          disabled={value <= 50}
          onClick={() => onValueChange(Math.max(50, value - 50))}
        >
          <Minus aria-hidden="true" />
        </button>
        <Slider.Root
          className="xp-slider"
          min={50}
          max={300}
          step={50}
          value={[value]}
          onValueChange={([next]) => onValueChange(next)}
        >
          <Slider.Track className="xp-slider-track">
            <Slider.Range className="xp-slider-range" />
          </Slider.Track>
          <Slider.Thumb
            className="xp-slider-thumb"
            aria-labelledby="base-xp-label"
            aria-valuetext={`${value} XP`}
          >
            <GripVertical aria-hidden="true" />
          </Slider.Thumb>
        </Slider.Root>
        <button
          className="slider-step"
          aria-label="Increase base XP by 50"
          disabled={value >= 300}
          onClick={() => onValueChange(Math.min(300, value + 50))}
        >
          <Plus aria-hidden="true" />
        </button>
      </div>
      <div className="slider-scale" aria-hidden="true">
        <span>50 XP</span>
        <span>300 XP</span>
      </div>
    </div>
  );
}
