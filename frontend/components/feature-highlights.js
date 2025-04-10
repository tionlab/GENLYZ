import { Zap, Shield, BarChart3 } from "lucide-react";

export default function FeatureHighlights() {
    const features = [
        {
            icon: <Zap className="h-5 w-5 text-amber-500" />,
            title: "빠른 분석",
            description: "결과를 몇 초 안에 얻을 수 있습니다.",
        },
        {
            icon: <Shield className="h-5 w-5 text-green-500" />,
            title: "보안",
            description: "이미지는 서버에 저장되지 않습니다.",
        },
        {
            icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
            title: "딥러닝 기반 학습",
            description: "파이썬으로 학습된 모델을 사용합니다.",
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-2 mb-6">
            {features.map((feature, index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg p-3 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div className="flex justify-center mb-2">
                        {feature.icon}
                    </div>
                    <h3 className="text-sm font-medium">{feature.title}</h3>
                    <p className="text-xs text-gray-500">
                        {feature.description}
                    </p>
                </div>
            ))}
        </div>
    );
}
