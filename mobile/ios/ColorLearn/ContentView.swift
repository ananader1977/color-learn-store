import SwiftUI
import WebKit

struct ContentView: View {
    @State private var browser = StoreBrowser()
    @State private var loading = true
    @State private var backAvailable = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if loading { ProgressView().tint(.purple) }
                StoreWebView(browser: browser, loading: $loading, backAvailable: $backAvailable)
            }
            .navigationTitle("Color & Learn")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button(action: { browser.goBack() }) {
                        Image(systemName: "chevron.backward")
                    }.disabled(!backAvailable)
                }
                ToolbarItemGroup(placement: .topBarTrailing) {
                    Button(action: { browser.reload() }) {
                        Image(systemName: "arrow.clockwise")
                    }
                    ShareLink(item: URL(string: "https://www.anasnader.net/")!)
                }
            }
        }
    }
}

@MainActor final class StoreBrowser {
    weak var webView: WKWebView?
    func reload() { webView?.reload() }
    func goBack() { webView?.goBack() }
}

struct StoreWebView: UIViewRepresentable {
    let browser: StoreBrowser
    @Binding var loading: Bool
    @Binding var backAvailable: Bool

    func makeCoordinator() -> Coordinator { Coordinator(self) }
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        config.websiteDataStore = .default()
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        browser.webView = webView
        webView.load(URLRequest(url: URL(string: "https://www.anasnader.net/")!))
        return webView
    }
    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate {
        let parent: StoreWebView
        init(_ parent: StoreWebView) { self.parent = parent }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.cancel); return
            }
            if url.scheme == "https" && url.host == "www.anasnader.net" {
                decisionHandler(.allow)
            } else {
                if ["https", "mailto", "tel"].contains(url.scheme ?? "") {
                    UIApplication.shared.open(url)
                }
                decisionHandler(.cancel)
            }
        }
        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            parent.loading = true
        }
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            parent.loading = false
            parent.backAvailable = webView.canGoBack
        }
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            parent.loading = false
        }
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            parent.loading = false
        }
    }
}
