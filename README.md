# 🖼️ GENLYZ - 사진 진위여부 판별기

**GENLYZ**는 이미지가 인간이 만든 것인지, AI가 만든 것인지를 감지하는 이미지 판별기입니다.  
EfficientNet-B0 기반의 딥러닝 모델을 활용한 이진 분류를 수행하여 정확한 판별을 제공합니다.

> AI 이미지가 넘쳐나는 요즘,  
> _진짜와 가짜의 경계를 구분하는 도구가 필요합니다._  
> 그게 바로 GENLYZ입니다.

## 🌐 Try GENLYZ Now!

[🔗 **GENLYZ 데모**](https://tionlab.software/genlyz)  
지금 바로 GENLYZ를 사용해보세요!

## 🚀 Features

-   🔍 **AI gen vs Human gen 이미지 판별**
-   ⚡ **빠르고 정확한 분류 결과 제공**
-   🧠 **EfficientNet 기반 전이 학습 모델 적용**

## 🛠️ How It Works

1. **이미지 업로드**  
   사용자가 이미지를 업로드하면, 해당 이미지가 모델의 입력으로 들어갑니다.

2. **모델 추론**  
   학습된 EfficientNet-B0 기반 모델이 이미지의 시각적 패턴을 분석합니다.

3. **분류 및 결과 반환**  
   이미지가 AI 생성인지 인간 생성인지 판단하고, 그에 따른 신뢰도(score)와 함께 결과를 제공합니다.

4. **결과 시각화**  
   최종 결과는 웹페이지 상에 직관적으로 출력됩니다.

## 🧩 Model Architecture

-   **기본 모델:** `EfficientNet-B0` (ImageNet으로 사전 학습됨)
-   **분류 헤드:**
    -   출력 클래스: `2` (AI 생성, 인간 생성)
    -   하위 계층 고정, 상위 계층만 학습
-   **최적화 알고리즘:** `AdamW` (L2 정규화 포함)
-   **학습률 스케줄러:**
    -   매 `5 에포크`마다 LR ↓ `10x`
-   **조기 종료:**
    -   성능 개선이 없을 경우 학습 조기 종료

## 📚 Dataset Sources

| Dataset Name                                                                                                                            | Source                                        | License    | Size                   |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------- | ---------------------- |
| [alessandrasala79/ai-vs-human-generated-dataset](https://www.kaggle.com/datasets/alessandrasala79/ai-vs-human-generated-dataset/data)   | Shutterstock                                  | Apache 2.0 | 79,950 images (4.3GB)  |
| [atristanzhang32/ai-generated-images-vs-real-images](https://www.kaggle.com/datasets/tristanzhang32/ai-generated-images-vs-real-images) | WikiArt, Pexels, Unsplash, MidJourney, DALL·E | MIT        | 60,000 images (48.8GB) |

## 🔗 Reference Notebooks

이 프로젝트에서 사용된 모델 학습 코드는 아래 코드를 참고하여 만들어졌습니다:

-   [EfficientNet: Detect AI vs. Human Generated Images](https://www.kaggle.com/code/agnesa/efficientnet-detect-ai-vs-human-generated-images)  
    _By Agnes Augusthy (Apache 2.0)_

-   [AI Vs Human | Final Submission](https://www.kaggle.com/code/sheemamasood/ai-vs-human-final-submission)  
    _By Sheema Masood (Apache 2.0)_

## 🧪 사용 환경

-   **딥러닝 프레임워크:** PyTorch
-   **기반 모델:** EfficientNet-B0
-   **에포크:** 16 (Early Stopping)
-   **정확도:** 98%
-   **API 서버:** FastAPI + Uvicorn
-   **프론트엔드:** Nextjs + Tailwind
-   **학습 환경:** CPU : AMD Ryzen AI 9 HX 370 w/ Radeon 890M / GPU : NVIDIA GeForce RTX 4070 Laptop GPU

## 📜 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.
