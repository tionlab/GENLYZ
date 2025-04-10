import Head from "next/head";
import ImageUploader from "@/components/image-uploader";
import FeatureHighlights from "@/components/feature-highlights";
import InfoCards from "@/components/info-cards";
import { Sparkles } from "lucide-react";

export default function Home() {
    return (
        <>
            <Head>
                <title>사진 진위여부 판별기</title>
                <meta
                    name="description"
                    content="사진이 AI에 의해 생성되었는지 확인하세요"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50">
                <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute top-40 right-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute bottom-20 left-20 w-40 h-40 bg-cyan-200 rounded-full blur-3xl opacity-20"></div>

                <div className="w-full max-w-md mx-auto p-4 break-keep text-pretty">
                    <div className="text-center mb-6 mt-8">
                        <div className="flex justify-center mb-3">
                            <div className="relative">
                                <Sparkles className="h-10 w-10 text-cyan-100">
                                    <Sparkles className="h-10 w-10 text-blue-600 animate-pulse" />
                                </Sparkles>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                            사진 진위여부 판별기
                        </h1>
                        <p className="text-gray-600 mt-2 max-w-xs mx-auto">
                            이미지를 업로드하여 AI에 의해 생성된 이미지인지
                            확인하세요.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-5 mb-6 border border-gray-100">
                        <ImageUploader />
                    </div>

                    <FeatureHighlights />
                    <InfoCards />
                </div>
                <footer className="text-center text-gray-500 text-sm mt-10">
                    &copy; {new Date().getFullYear()} Tionlab. All rights
                    reserved.
                    <br />
                    <a
                        href="https://github.com/tionlab/GENLYZ"
                        className="text-cyan-600 hover:underline"
                    >
                        Github
                    </a>
                </footer>
            </div>
        </>
    );
}
