import { useState, useEffect } from "react";
import {
    Info,
    ChevronDown,
    Share2,
    History,
    Settings,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

export default function InfoCards() {
    const [expandedCard, setExpandedCard] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadHistoryData = () => {
        const savedResults = localStorage.getItem("aiOrHumanResults");
        if (savedResults) {
            try {
                const parsedResults = JSON.parse(savedResults);
                setHistoryData(
                    Array.isArray(parsedResults)
                        ? parsedResults
                        : [parsedResults]
                );
            } catch (error) {
                console.error("Error parsing stored results:", error);
                setHistoryData([]);
            }
        }
    };

    useEffect(() => {
        loadHistoryData();

        const handleStorageChange = (e) => {
            if (e.key === "aiOrHumanResults") {
                loadHistoryData();
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const toggleCard = (index) => {
        if (expandedCard === index) {
            setExpandedCard(null);
        } else {
            setExpandedCard(index);
        }
    };

    const refreshHistory = () => {
        setIsRefreshing(true);
        loadHistoryData();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const infoCards = [
        {
            title: "작동 방식",
            content:
                "사용자가 이미지를 선택하여 업로드하면, 해당 이미지는 모델에 입력으로 제공된다. 딥러닝으로 학습된 모델은 이미지의 특징을 분석하고, 이를 바탕으로 AI 생성 이미지인지 인간 생성 이미지인지를 판단한다. \n이 과정에서 모델은 학습된 패턴과 특징을 활용하여 이미지를 분류하며, 최종적으로는 신뢰도와 함께 결과를 반환하게 되며 이를 웹페이지로 가져와 결과를 표시한다.",
        },
        {
            title: "모델 세부 사항",
            content:
                "본 프로젝트에서는 사전 학습된 EfficientNet-B0 모델을 기반으로 전이 학습을 수행하였다. 기존 모델의 출력 노드 수는 ImageNet 기준 1000개로 설정되어 있으나, 본 작업에서는 이진 분류를 목표로 하기 때문에 출력 노드 수를 2개로 수정하였다. 전이 학습 과정에서는 모델의 하위 계층은 고정하고, 상위 분류기 부분만 학습 가능하도록 설정하였다. \n최적화 알고리즘으로는 일반적으로 사용되는 Adam이 아닌, 일반화 성능 향상 및 L2 정규화 효과를 포함한 AdamW를 사용하였다. 이와 함께 학습률 조절을 위해 Learning Rate Scheduler를 적용하였으며, 5 epoch마다 학습률을 1/10로 감소시켜, 초기에는 빠르게 수렴하고 후반부에는 안정적으로 학습되도록 하였다. 또한, 모델 성능이 N epoch 동안 개선되지 않을 경우 학습을 조기 종료할 수 있도록 Early Stopping 기법을 적용하여, 불필요한 학습을 방지하고 과적합(overfitting)을 줄였다.",
        },
        {
            title: "크레딧 & 자료 출처",
            content:
                "# 모델 학습데이터\nOfficial dataset for the 2025 Women in AI Kaggle Competition - Kaggle\n- Shutterstock 에서 수집된 이미지.\n- Apache 2.0 라이센스\n- 79,950개 (4.30GB) 수집\n\nai-generated-images-vs-real-images - Kaggle\n- WikiArt, Pexels, Unsplash, Stable Diffusion, MidJourney, DALL-E 에서 수집된 이미지.\n- MIT 라이센스\n- 60,000개 (48.8GB) 수집\n\n# 참고한 모델 학습 코드\nEfficientNet: Detect AI vs. Human Generated Images - Kaggle\nBy Agnes Augusthy\n - Apache 2.0 라이센스\n\nAI Vs Human|Final Submission - Kaggle\nBy Sheema Masood\n - Apache 2.0 라이센스",
        },
    ];

    return (
        <div className="space-y-4">
            <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid grid-cols-2 mb-2">
                    <TabsTrigger
                        value="info"
                        className="transition-all duration-200 hover:scale-105"
                    >
                        정보
                    </TabsTrigger>
                    <TabsTrigger
                        value="history"
                        className="transition-all duration-200 hover:scale-105"
                    >
                        기록
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-3">
                    {infoCards.map((card, index) => (
                        <Card
                            key={index}
                            className="overflow-hidden transition-shadow duration-300 hover:shadow-md"
                        >
                            <CardHeader
                                className="py-3 px-4 cursor-pointer transition-colors duration-200 hover:bg-gray-50"
                                onClick={() => toggleCard(index)}
                            >
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-sm flex items-center">
                                        <motion.div
                                            animate={{
                                                rotate:
                                                    expandedCard === index
                                                        ? 360
                                                        : 0,
                                                color:
                                                    expandedCard === index
                                                        ? "#3b82f6"
                                                        : "#3b82f6",
                                            }}
                                            transition={{ duration: 0.5 }}
                                            className="mr-2"
                                        >
                                            <Info className="h-4 w-4 text-blue-500" />
                                        </motion.div>
                                        {card.title}
                                    </CardTitle>
                                    <motion.div
                                        animate={{
                                            rotate:
                                                expandedCard === index
                                                    ? 180
                                                    : 0,
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </motion.div>
                                </div>
                            </CardHeader>
                            <AnimatePresence>
                                {expandedCard === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <CardContent className="py-3 px-4 text-sm text-gray-600 bg-gray-50 whitespace-pre-line">
                                            {card.content}
                                        </CardContent>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="history" className="space-y-3">
                    <Card className="transition-transform duration-300 hover:scale-[1.01]">
                        <CardHeader className="py-3 px-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-sm flex items-center">
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                        className="mr-2"
                                    >
                                        <History className="h-4 w-4 text-purple-500" />
                                    </motion.div>
                                    분석 기록
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={refreshHistory}
                                    className="p-1 h-auto"
                                >
                                    <motion.div
                                        animate={{
                                            rotate: isRefreshing ? 360 : 0,
                                        }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <RefreshCw className="h-4 w-4 text-gray-500" />
                                    </motion.div>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            {historyData && historyData.length > 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-3 max-h-80 overflow-y-auto pr-1"
                                >
                                    {historyData.map((item, index) => (
                                        <div
                                            key={index}
                                            className="border rounded-lg p-3 mb-2 hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>분석 시간:</span>
                                                <span>{item.analyzedAt}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>파일 이름:</span>
                                                <span>
                                                    {item.imageData?.name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>파일 크기:</span>
                                                <span>
                                                    {Math.round(
                                                        item.imageData?.size /
                                                            1024
                                                    )}{" "}
                                                    KB
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm font-medium">
                                                <span>분석 결과:</span>
                                                <span
                                                    className={
                                                        item.isAiGenerated
                                                            ? "text-red-500"
                                                            : "text-green-500"
                                                    }
                                                >
                                                    {item.isAiGenerated
                                                        ? "AI 생성"
                                                        : "인간 생성"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>신뢰도:</span>
                                                <span>{item.confidence}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center py-6 text-[#6a7282]"
                                >
                                    <History className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">
                                        분석 기록이 여기에 표시됩니다
                                    </p>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
