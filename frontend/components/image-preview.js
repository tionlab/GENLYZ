"use client";

import { useState } from "react";
import { X, ZoomIn, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImagePreview({ src, onReset }) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [rotation, setRotation] = useState(0);

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    return (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            <div className="relative aspect-square w-full overflow-hidden flex items-center justify-center">
                <div
                    className={`transition-all duration-300 ${
                        isZoomed ? "scale-150" : "scale-100"
                    }`}
                >
                    <img
                        src={src}
                        alt="미리보기"
                        className="max-w-full max-h-full transition-transform"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    />
                </div>
            </div>
            <div className="absolute top-2 right-2 flex space-x-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/80 hover:bg-white"
                    onClick={() => setIsZoomed(!isZoomed)}
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/80 hover:bg-white"
                    onClick={handleRotate}
                >
                    <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/80 hover:bg-white"
                    onClick={onReset}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 text-white text-xs">
                <p className="truncate">분석 준비 완료</p>
            </div>
        </div>
    );
}
