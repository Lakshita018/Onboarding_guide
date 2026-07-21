import React, { useRef, useState, useEffect } from 'react';
import Button from '../common/Button';

const DigitalSignature = ({ onSave, loading = false }) => {
  const canvasRef     = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [lastPos, setLastPos]       = useState(null);

  // Resize canvas on mount so it fills its container correctly
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  || 400;
    canvas.height = rect.height || 160;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#161616';
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    setLastPos(getPos(e));
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const pos    = getPos(e);
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
    setHasStrokes(true);
  };

  const stopDraw = (e) => {
    e.preventDefault();
    setDrawing(false);
    setLastPos(null);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  const handleSave = () => {
    if (!hasStrokes) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave?.(dataUrl);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#525252]">
        Draw your signature in the box below, then click <strong>Save Signature</strong>.
      </p>

      <div className="border border-[#E0E0E0] rounded-sm bg-white relative" style={{ height: 160 }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair', touchAction: 'none' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasStrokes && (
          <span
            className="absolute inset-0 flex items-center justify-center text-xs text-[#C6C6C6] pointer-events-none select-none"
          >
            Sign here
          </span>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-[#DA1E28] hover:underline"
        >
          Clear
        </button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!hasStrokes || loading}
          loading={loading}
          className="text-xs"
        >
          Save Signature
        </Button>
      </div>
    </div>
  );
};

export default DigitalSignature;
