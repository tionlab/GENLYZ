import { AlertCircle, CheckCircle, Share2, Download } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import domtoimage from "dom-to-image-more";

export default function ResultsDisplay({ results, imageUrl }) {
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const imageCardRef = useRef(null);
    const { isAiGenerated, confidence } = results;
    const getConfidenceColor = () => {
        return isAiGenerated ? "text-red-500" : "text-green-500";
    };

    const getConfidenceGradient = () => {
        return isAiGenerated
            ? "bg-gradient-to-r from-red-500 to-orange-500"
            : "bg-gradient-to-r from-green-500 to-emerald-500";
    };

    const generateShareImage = async () => {
        if (!imageCardRef.current) return;

        try {
            const node = imageCardRef.current;
            const scale = 5;

            const style = {
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: `${node.offsetWidth}px`,
                height: `${node.offsetHeight}px`,
                boxShadow: "none",
                outline: "none",
                border: "none",
                backgroundColor: "#ffffff",
            };

            const param = {
                quality: 1.0,
                width: node.offsetWidth * scale,
                height: node.offsetHeight * scale,
                style,
            };

            const dataUrl = await domtoimage.toPng(node, param);
            setGeneratedImage(dataUrl);
        } catch (error) {
            console.error("이미지 생성 중 오류 발생:", error);
        }
    };

    const handleDownload = () => {
        if (!generatedImage) return;

        const link = document.createElement("a");
        link.href = generatedImage;
        link.download = `AI_분석결과_${new Date()
            .toISOString()
            .slice(0, 10)}.png`;
        link.click();
    };

    useEffect(() => {
        if (shareModalOpen) {
            generateShareImage();
        }
    }, [shareModalOpen]);

    return (
        <>
            <Card
                className="overflow-hidden border-t-4 animate-in fade-in slide-in-from-bottom-5 duration-500"
                style={{
                    borderTopColor: isAiGenerated ? "#ef4444" : "#22c55e",
                }}
            >
                <CardHeader className="pb-2 bg-[#f9fafb]">
                    <CardTitle className="flex items-center text-lg">
                        {isAiGenerated ? (
                            <>
                                <AlertCircle className="h-5 w-5 text-[#fb2c36] mr-2" />
                                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                    AI 생성 이미지 감지됨
                                </span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    AI 생성 이미지가 아닐 가능성이 높음
                                </span>
                            </>
                        )}
                    </CardTitle>
                    <CardDescription>
                        분석 결과 (신뢰도: {(confidence - 0.1).toFixed(2)}%)
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">
                                    신뢰도
                                </span>
                                <span
                                    className={`text-sm font-medium ${getConfidenceColor()}`}
                                >
                                    {(confidence - 0.1).toFixed(2)}%
                                </span>
                            </div>
                            <div className="h-2 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${getConfidenceGradient()}`}
                                    style={{
                                        width: `${(confidence - 0.1).toFixed(
                                            2
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 my-3">
                            <div className="bg-[#f9fafb] p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-[#364153]">
                                    {isAiGenerated ? "높음" : "낮음"}
                                </div>
                                <div className="text-xs text-[#6a7282]">
                                    AI 생성 확률
                                </div>
                            </div>
                            <div className="bg-[#f9fafb] p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-[#364153]">
                                    {(100 - (confidence - 0.1)).toFixed(2)}%
                                </div>
                                {isAiGenerated ? (
                                    <div className="text-xs text-[#6a7282]">
                                        사람이 생성했을 확률
                                    </div>
                                ) : (
                                    <div className="text-xs text-[#6a7282]">
                                        AI가 생성했을 확률
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-[#f9fafb] flex justify-between py-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShareModalOpen(true)}
                    >
                        <Share2 className="h-4 w-4 mr-1" />
                        결과 공유
                    </Button>
                </CardFooter>
            </Card>

            <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
                <DialogContent className="max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>결과 이미지 공유</DialogTitle>
                        <DialogDescription>
                            분석 결과가 포함된 이미지를 저장하여 공유할 수
                            있습니다.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {generatedImage ? (
                            <div className="flex justify-center">
                                <img
                                    src={generatedImage}
                                    alt="결과 이미지"
                                    className="max-w-full rounded-md shadow-md"
                                />
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-40 bg-[#f3f4f6] rounded-md">
                                <span className="text-[#99a1af]">
                                    이미지 생성 중...
                                </span>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShareModalOpen(false)}
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleDownload}
                            disabled={!generatedImage}
                        >
                            <Download className="h-4 w-4 mr-1" />
                            이미지 저장
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div>
                <div
                    ref={imageCardRef}
                    className="p-4 bg-[#ffffff] outline-1 outline-black"
                    style={{
                        width: "500px",
                        outline: "none !important",
                        boxShadow: "none !important",
                        border: "none !important",
                        backgroundColor: "#ffffff",
                        position: "absolute",
                        top: "-9999px",
                        left: "-9999px",
                        pointerEvents: "none",
                    }}
                >
                    <div
                        className="p-4 rounded-lg"
                        style={{
                            border: "none",
                            boxShadow: "none",
                            outline: "none",
                        }}
                    >
                        <div
                            className="flex items-center mb-2"
                            style={{
                                border: "none",
                                boxShadow: "none",
                                outline: "none",
                            }}
                        >
                            {isAiGenerated ? (
                                <>
                                    <AlertCircle
                                        className="h-5 w-5 text-[#fb2c36] mr-2"
                                        style={{
                                            border: "none",
                                            boxShadow: "none",
                                            outline: "none",
                                        }}
                                    />
                                    <span
                                        className="font-bold text-[#d4222b] whitespace-nowrap "
                                        style={{
                                            border: "none",
                                            boxShadow: "none",
                                            outline: "none",
                                        }}
                                    >
                                        AI 생성 이미지 감지됨
                                    </span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle
                                        className="h-5 w-5 text-[#37fa5b] mr-2"
                                        style={{
                                            border: "none",
                                            boxShadow: "none",
                                            outline: "none",
                                        }}
                                    />
                                    <span
                                        className="font-bold text-[#32c94d] whitespace-nowrap "
                                        style={{
                                            border: "none",
                                            boxShadow: "none",
                                            outline: "none",
                                        }}
                                    >
                                        AI 생성 이미지가 아닐 가능성이 높음
                                    </span>
                                </>
                            )}
                        </div>
                        <div
                            className="flex justify-between text-sm whitespace-nowrap "
                            style={{
                                border: "none",
                                boxShadow: "none",
                                outline: "none",
                            }}
                        >
                            <span
                                style={{
                                    border: "none",
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                            >
                                분석 신뢰도:
                            </span>
                            <span
                                style={{
                                    border: "none",
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                                className={getConfidenceColor()}
                            >
                                {(confidence - 0.1).toFixed(2)}%
                            </span>
                        </div>

                        {imageUrl && (
                            <div
                                style={{
                                    border: "none",
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                                className="flex justify-center"
                            >
                                <img
                                    src={imageUrl}
                                    alt="원본 이미지"
                                    className="w-36 h-36 rounded-lg mb-4"
                                    style={{
                                        border: "none",
                                        outline: "none",
                                        boxShadow: "none",
                                    }}
                                />
                            </div>
                        )}
                        <div
                            className="h-2 w-full bg-[#f3f4f6] whitespace-nowrap rounded-full overflow-hidden mt-1"
                            style={{
                                border: "none",
                                boxShadow: "none",
                                outline: "none",
                            }}
                        >
                            <div
                                className={`h-full ${getConfidenceGradient()}`}
                                style={{
                                    width: `${confidence - 0.1}%`,
                                    border: "none",
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                            ></div>
                        </div>
                        <div
                            className="mt-2 text-xs text-[#6a7282] text-right"
                            style={{
                                border: "none",
                                boxShadow: "none",
                                outline: "none",
                            }}
                        >
                            tionlab.software/photo_verf 에서 분석함.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
