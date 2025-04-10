import { useState, useRef, useEffect } from "react";
import { Upload, ImageIcon, Loader2, Image as ImageLucide } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import ImagePreview from "@/components/image-preview";
import ResultsDisplay from "@/components/results-display";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export default function ImageUploader() {
    const { toast } = useToast();
    const fileInputRef = useRef(null);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState(null);
    const [progress, setProgress] = useState(0);
    const [showCompressionModal, setShowCompressionModal] = useState(false);
    const [compressedPreview, setCompressedPreview] = useState(null);
    const [originalSize, setOriginalSize] = useState(0);
    const [compressedSize, setCompressedSize] = useState(0);
    const [showExampleModal, setShowExampleModal] = useState(false);
    const [exampleImages, setExampleImages] = useState({
        real: [],
        fake: [],
    });
    const [displayExampleImages, setDisplayExampleImages] = useState({
        real: [],
        fake: [],
    });

    useEffect(() => {
        const realImages = Array.from(
            { length: 30 },
            (_, i) => `/real/real_${i + 1}.jpg`
        );
        const fakeImages = Array.from(
            { length: 30 },
            (_, i) => `/fake/fake_${i + 1}.jpg`
        );

        setExampleImages({
            real: realImages,
            fake: fakeImages,
        });
    }, []);

    useEffect(() => {
        if (showExampleModal) {
            getRandomImages();
        }
    }, [showExampleModal]);

    const getRandomImages = () => {
        const randomReal = [...exampleImages.real]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        const randomFake = [...exampleImages.fake]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        setDisplayExampleImages({
            real: randomReal,
            fake: randomFake,
        });
    };

    const handleRefreshExamples = () => {
        getRandomImages();
    };

    const handleExampleImageSelect = async (imageSrc) => {
        try {
            const response = await fetch(imageSrc);
            const blob = await response.blob();
            const fileName = imageSrc.split("/").pop();
            const file = new File([blob], fileName, {
                type: `image/${fileName.split(".").pop()}`,
            });

            await processFile(file);
            setShowExampleModal(false);

            toast({
                title: "예시 이미지 로드 완료",
                description: "선택한 예시 이미지가 로드되었습니다.",
                variant: "success",
            });
        } catch (error) {
            console.error("예시 이미지 로드 실패:", error);
            toast({
                title: "이미지 로드 실패",
                description: "예시 이미지를 로드하는데 실패했습니다.",
                variant: "destructive",
            });
        }
    };

    const compressImage = async (file, quality) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const compressedFile = new File(
                                    [blob],
                                    file.name,
                                    {
                                        type: file.type,
                                        lastModified: new Date().getTime(),
                                    }
                                );
                                const previewUrl =
                                    URL.createObjectURL(compressedFile);
                                setCompressedPreview(previewUrl);
                                setCompressedSize(compressedFile.size);
                                resolve({
                                    file: compressedFile,
                                    previewUrl: previewUrl,
                                });
                            }
                        },
                        "image/jpeg",
                        quality / 100
                    );
                };
            };
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files[0];
        if (file && file.type.includes("image/")) {
            processFile(file);
        } else {
            toast({
                title: "유효하지 않은 파일 형식",
                description: "이미지 파일을 업로드해주세요.",
                variant: "destructive",
            });
        }
    };

    const handleAnalyze = async () => {
        if (!image) {
            toast({
                title: "이미지가 선택되지 않았습니다.",
                description: "먼저 이미지를 업로드해주세요.",
                variant: "destructive",
            });
            return;
        }
        setIsAnalyzing(true);
        setProgress(0);
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + Math.floor(Math.random() * 10);
            });
        }, 300);
        try {
            const formData = new FormData();
            formData.append("file", image);

            const response = await fetch(
                "https://api.tionlab.software/predict",
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error("Failed to analyze image");
            }

            const result = await response.json();
            console.log("API Response:", result);

            setResults(result);
            const resultsToSave = {
                ...result,
                timestamp: new Date().toISOString(),
                analyzedAt: new Date().toLocaleString("ko-KR"),
                imageData: {
                    name: image.name,
                    size: image.size,
                },
            };

            let existingResults = [];
            try {
                const savedResults = localStorage.getItem("aiOrHumanResults");
                if (savedResults) {
                    existingResults = JSON.parse(savedResults);
                    if (!Array.isArray(existingResults)) {
                        existingResults = [existingResults];
                    }
                }
            } catch (error) {
                console.error("Error parsing stored results:", error);
            }

            existingResults.push(resultsToSave);

            localStorage.setItem(
                "aiOrHumanResults",
                JSON.stringify(existingResults)
            );

            setProgress(100);
        } catch (error) {
            toast({
                title: "분석 실패",
                description: error.message || "문제가 발생했습니다.",
                variant: "destructive",
            });
        } finally {
            clearInterval(progressInterval);
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setImage(null);
        setPreview(null);
        setResults(null);
    };

    const autoCompressImage = async (file) => {
        let quality = 50;
        const fileSizeMB = file.size / (1024 * 1024);
        const originalFileSize = file.size;
        const maxSizeLimit = 5 * 1024 * 1024;

        if (fileSizeMB > 15) quality = 50;
        else if (fileSizeMB > 10) quality = 60;
        else if (fileSizeMB > 5) quality = 70;

        setOriginalSize(originalFileSize);
        setShowCompressionModal(true);

        let compressResult = await compressImage(file, quality);
        let compressedFile = compressResult.file;
        let previewUrl = compressResult.previewUrl;

        if (compressedFile.size > maxSizeLimit) {
            setShowCompressionModal(false);
            setImage(null);
            setPreview(null);
            setResults(null);
            toast({
                title: "이미지가 너무 큽니다",
                description:
                    "압축 후에도 5MB 이상입니다. 더 작은 이미지를 사용해주세요.",
                variant: "destructive",
            });

            return null;
        }

        setImage(compressedFile);
        setPreview(previewUrl);
        setResults(null);

        setTimeout(() => {
            setShowCompressionModal(false);
            const resultMessage =
                compressedFile === file
                    ? "이미지를 원본 크기로 유지합니다."
                    : `${(originalFileSize / (1024 * 1024)).toFixed(2)}MB → ${(
                          compressedFile.size /
                          (1024 * 1024)
                      ).toFixed(2)}MB로 자동 압축되었습니다.`;

            toast({
                title:
                    compressedFile === file
                        ? "압축 건너뜀"
                        : "이미지 압축 완료",
                description: resultMessage,
                variant: "success",
            });
        }, 1500);

        return compressedFile;
    };
    function convertToJpg(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function () {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;

                    const ctx = canvas.getContext("2d");
                    if (!ctx) return reject("캔버스 컨텍스트 에러");

                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob(
                        function (blob) {
                            if (!blob) return reject("JPG 변환 실패");

                            const newFile = new File([blob], "converted.jpg", {
                                type: "image/jpeg",
                            });

                            const previewUrl = URL.createObjectURL(blob);
                            resolve({ file: newFile, previewUrl });
                        },
                        "image/jpeg",
                        0.92
                    );
                };
                img.onerror = function () {
                    reject("이미지 로딩 실패");
                };
                img.src = reader.result;
            };
            reader.onerror = function () {
                reject("파일 읽기 실패");
            };
            reader.readAsDataURL(file);
        });
    }

    const processFile = async (file) => {
        if (!file) return null;

        if (!file.type.includes("image/")) {
            toast({
                title: "유효하지 않은 파일 형식",
                description: "이미지 파일을 업로드해주세요.",
                variant: "destructive",
            });
            return null;
        }

        const isJpgOrPng =
            file.type === "image/jpeg" ||
            file.type === "image/jpg" ||
            file.type === "image/png";

        if (!isJpgOrPng) {
            toast({
                title: "이미지 형식 변환",
                description: "JPG, PNG가 아닌 이미지는 JPG로 자동 변환됩니다.",
                variant: "info",
            });

            const convertResult = await convertToJpg(file);
            file = convertResult.file;
            setPreview(convertResult.previewUrl);
            setImage(file);
            setResults(null);
            return file;
        }

        if (file.size > 5 * 1024 * 1024) {
            return await autoCompressImage(file);
        }
        const reader = new FileReader();
        reader.onload = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
        setImage(file);
        setResults(null);
        return file;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full space-y-6"
        >
            <AnimatePresence mode="wait">
                {!preview ? (
                    <motion.div
                        key="uploader"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                    >
                        <motion.div
                            className="border-2 border-dashed border-[#d1cdff] bg-[#eff6ff80] rounded-lg p-8 text-center cursor-pointer transition-all"
                            whileHover={{
                                scale: 1.02,
                                borderColor: "#3b82f6",
                                backgroundColor: "rgba(219, 234, 254, 0.6)",
                            }}
                            onClick={() => fileInputRef.current.click()}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <input
                                id="image-upload"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <motion.div
                                    className="relative"
                                    whileHover={{ scale: 1.1 }}
                                    animate={{
                                        y: [0, -1, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                        ease: "easeInOut",
                                    }}
                                >
                                    <motion.div
                                        className="absolute -inset-1 rounded-full bg-[#dbeafe] blur-sm"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.7, 1, 0.7],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                        }}
                                    ></motion.div>
                                    <Upload className="relative h-10 w-10 text-blue-400" />
                                </motion.div>
                                <motion.p
                                    className="text-sm text-gray-600 font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    클릭하여 업로드하거나 드래그 앤 드롭하세요.
                                </motion.p>
                                <motion.p
                                    className="text-xs text-gray-400"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    PNG, JPG, GIF (최대 5MB)
                                </motion.p>
                            </div>
                        </motion.div>

                        <Button
                            variant="outline"
                            className="w-full border-dashed border-[#d1cdff] hover:bg-[#eff6ff80]"
                            onClick={() => setShowExampleModal(true)}
                        >
                            <ImageLucide className="h-4 w-4 mr-2" />
                            예시 이미지 선택하기
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ImagePreview
                            src={preview}
                            alt="업로드된 이미지 미리보기"
                            onReset={handleReset}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {preview && !results && !isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Button
                            className="w-full bg-gradient-to-r from-sky-300 to-blue-400 hover:from-sky-500 hover:to-blue-700 transition-all"
                            onClick={handleAnalyze}
                        >
                            <motion.span
                                className="flex items-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ImageIcon className="h-4 w-4 mr-2" />
                                이미지 분석
                            </motion.span>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isAnalyzing && (
                    <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="flex items-center justify-center"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            >
                                <Loader2 className="h-6 w-6 text-purple-500" />
                            </motion.div>
                            <motion.span
                                className="ml-2 text-gray-600 font-medium"
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                이미지 분석 중...
                            </motion.span>
                        </motion.div>
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        >
                            <Progress value={progress} className="h-2" />
                        </motion.div>
                        <motion.div
                            className="text-xs text-center text-[#6a7282]"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {progress < 30
                                ? "분석 초기화 중..."
                                : progress < 60
                                ? "특징 분석 중..."
                                : progress < 90
                                ? "결과 마무리 중..."
                                : "결과 데이터를 정리하는 중..."}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {results && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <ResultsDisplay results={results} imageUrl={preview} />
                    </motion.div>
                )}
            </AnimatePresence>

            <Dialog
                open={showCompressionModal}
                onOpenChange={setShowCompressionModal}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogContent className="sm:max-w-[500px] bg-white shadow-xl">
                    <DialogHeader>
                        <DialogTitle>이미지 자동 압축 중</DialogTitle>
                        <DialogDescription>
                            이미지를 자동으로 압축하고 있습니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="text-sm text-gray-600">
                            <p>
                                원본 이미지 크기:{" "}
                                {(originalSize / (1024 * 1024)).toFixed(2)}MB
                            </p>
                        </div>

                        <div className="flex items-center justify-center py-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                            >
                                <Loader2 className="h-8 w-8 text-blue-500" />
                            </motion.div>
                        </div>

                        {compressedPreview && (
                            <div className="space-y-2">
                                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={compressedPreview}
                                        alt="압축된 이미지"
                                        className="w-full h-48 object-contain"
                                    />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>
                                        압축 후 크기:{" "}
                                        {(
                                            compressedSize /
                                            (1024 * 1024)
                                        ).toFixed(2)}
                                        MB (
                                        {(
                                            (compressedSize / originalSize) *
                                            100
                                        ).toFixed(0)}
                                        %)
                                    </span>
                                </div>
                                <motion.div
                                    className="w-full bg-[#dbeafe] h-2 rounded-full overflow-hidden"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div
                                        className="bg-[#4a3cff] h-full rounded-full"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.2 }}
                                    />
                                </motion.div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showExampleModal} onOpenChange={setShowExampleModal}>
                <DialogContent className="sm:max-w-[700px] bg-white">
                    <DialogHeader>
                        <DialogTitle>예시 이미지 선택</DialogTitle>
                        <DialogDescription>
                            실제 이미지와 AI 생성 이미지 중 선택하세요
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-6">
                        <div>
                            <h3 className="text-sm font-medium mb-2">
                                사람이 생성한 이미지
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                {displayExampleImages.real.map((img, index) => (
                                    <div
                                        key={`real-${index}`}
                                        className="relative border rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-sky-300 transition-all"
                                        onClick={() =>
                                            handleExampleImageSelect(img)
                                        }
                                    >
                                        <img
                                            src={img}
                                            alt={`사람이 생성한 이미지 ${
                                                index + 1
                                            }`}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                                            사람이 생성한 이미지
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium mb-2">
                                AI 생성 이미지
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                {displayExampleImages.fake.map((img, index) => (
                                    <div
                                        key={`fake-${index}`}
                                        className="relative border rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                                        onClick={() =>
                                            handleExampleImageSelect(img)
                                        }
                                    >
                                        <img
                                            src={img}
                                            alt={`AI 생성 이미지 ${index + 1}`}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                                            AI 생성 이미지
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefreshExamples}
                                className="text-xs"
                            >
                                다른 예시 이미지 보기
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
