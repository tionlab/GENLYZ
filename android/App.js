import { useState, useRef, useEffect } from "react";
import {
    ToastAndroid,
    Platform,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    StyleSheet,
    View,
    BackHandler,
} from "react-native";
import WebView from "react-native-webview";
import { SvgXml } from "react-native-svg";
import NetInfo from "@react-native-community/netinfo";
import * as WebBrowser from "expo-web-browser";
const offlineSvg = `
<svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 549.76 549.76" xml:space="preserve">
  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
  <g id="SVGRepo_iconCarrier">
    <g>
      <path d="M332.622,454.776c0,31.58-25.582,57.162-57.161,57.162S218.3,486.356,218.3,454.776c0-31.578,25.582-57.16,57.161-57.16 S332.622,423.198,332.622,454.776z M365.241,254.041c-17.992-7.589-36.658-12.852-55.814-15.667l97.125,97.063l32.007-32.008 C417.384,282.254,392.72,265.607,365.241,254.041z M177.418,257.652c-25.398,11.934-48.226,28.212-67.81,48.531l70.38,68.055 c20.441-21.176,46.573-34.578,75.031-38.984L177.418,257.652z M60.955,141.127C39.106,155.57,18.727,172.155,0,190.944 l69.217,69.217c18.85-18.85,39.964-34.884,62.914-47.797L60.955,141.127z M426.319,107.1 c-47.798-20.074-98.594-30.294-150.858-30.294c-38.127,0-75.398,5.447-111.323,16.157l83.109,83.109 c9.303-0.918,18.728-1.346,28.213-1.346c77.418,0,150.308,29.988,205.326,84.456l68.973-69.523 C514.019,154.285,472.525,126.5,426.319,107.1z M33.292,77.663l382.561,382.561l39.842-39.842L73.134,37.821L33.292,77.663z"></path>
    </g>
  </g>
</svg>
`;

export default function App() {
    const [openedUrl, setOpenedUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(true);
    const webViewRef = useRef(null);
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
        });

        return () => unsubscribe();
    }, []);
    useEffect(() => {
        const backAction = () => {
            if (webViewRef.current) {
                webViewRef.current.goBack();
                return true;
            }
            return false;
        };

        BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => {
            BackHandler.removeEventListener("hardwareBackPress", backAction);
        };
    }, []);
    useEffect(() => {
        let backPressCount = 0;
        let lastPressTime = 0;

        const backAction = () => {
            const currentTime = new Date().getTime();
            const diff = currentTime - lastPressTime;

            if (diff < 500) {
                backPressCount++;
            } else {
                backPressCount = 1;
            }

            lastPressTime = currentTime;

            if (backPressCount === 2) {
                ToastAndroid.show(
                    "연속 3번 뒤로가기를 누르면 앱이 종료됩니다.",
                    ToastAndroid.SHORT
                );
                return true;
            } else if (backPressCount > 2) {
                BackHandler.exitApp();
                return true;
            }

            if (webViewRef.current) {
                webViewRef.current.goBack();
                return true;
            }

            return false;
        };

        BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => {
            BackHandler.removeEventListener("hardwareBackPress", backAction);
        };
    }, []);
    const extractDomain = (url) => {
        const hostname = new URL(url).hostname;
        const domainParts = hostname.split(".").reverse();
        if (domainParts.length > 2) {
            if (domainParts[1].length === 2 && domainParts[0].length === 2) {
                return `${domainParts[2]}.${domainParts[1]}.${domainParts[0]}`;
            }
            return `${domainParts[1]}.${domainParts[0]}`;
        }
        return hostname;
    };

    const handleNavigationStateChange = (newNavState) => {
        const { url } = newNavState;
        const domain = extractDomain(url);
        if (domain !== "tionlab.software") {
            if (openedUrl !== domain) {
                console.log("Opening in app browser", domain);
                WebBrowser.openBrowserAsync(url);
                webViewRef.current.goBack();
                setOpenedUrl(domain);
            }
        }
    };

    return (
        <SafeAreaView
            style={[
                styles.flexContainer,
                {
                    paddingTop:
                        Platform.OS === "android" ? StatusBar.currentHeight : 0,
                },
            ]}
        >
            {isConnected ? (
                <>
                    <StatusBar
                        hidden={false}
                        translucent={true}
                        barStyle="dark-content"
                    />
                    <WebView
                        source={{ uri: "https://tionlab.software/genlyz" }}
                        style={styles.flexContainer}
                        onLoad={() => setLoading(false)}
                        scrollEnabled={false}
                        overScrollMode="never"
                        bounces={false}
                        onNavigationStateChange={handleNavigationStateChange}
                        ref={webViewRef}
                        javaScriptEnabled={true}
                        AppCacheEnabled={true}
                        DomStorageEnabled={true}
                    />
                    {loading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" />
                        </View>
                    )}
                </>
            ) : (
                <View style={styles.offlineContainer}>
                    <SvgXml xml={offlineSvg} width="100" height="100" />
                    <Text>네트워크에 연결 해주세요!</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
    },
    loadingContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    offlineContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
