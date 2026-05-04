import UIKit
import Capacitor
import Firebase
import UserNotifications
import FirebaseMessaging

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    var pendingPush: String?

    func application(_ application: UIApplication,
                     didReceiveRemoteNotification userInfo: [AnyHashable: Any],
                     fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {

        print("📥 Push silenciosa recibida: \(userInfo)")

        if let jsonData = try? JSONSerialization.data(withJSONObject: userInfo, options: []),
           let jsonString = String(data: jsonData, encoding: .utf8) {

            if let bridge = (self.window?.rootViewController as? CAPBridgeViewController)?.bridge {
                print("➡️ Disparando evento DataPushReceived a JS")
                print("📤 Payload: \(jsonString)")

                bridge.triggerJSEvent(
                    eventName: "DataPushReceived",
                    target: "window",
                    data: jsonString
                )
            } else {
                print("❌ WebView no disponible, guardando push")
                pendingPush = jsonString
            }
        }

        completionHandler(.newData)
    }

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        FirebaseApp.configure()
        //Bridge.registerPlugin(PushBridge.self)
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}

    func applicationDidBecomeActive(_ application: UIApplication) {
        if let jsonString = pendingPush,
           let bridge = (self.window?.rootViewController as? CAPBridgeViewController)?.bridge {
            print("🔁 Reintentando enviar push guardada")
            bridge.triggerJSEvent(
                eventName: "DataPushReceived",
                target: "window",
                data: jsonString
            )
            pendingPush = nil
        }
    }

    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Messaging.messaging().apnsToken = deviceToken
        Messaging.messaging().token(completion: { (token, error) in
            if let error = error {
                NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
            } else if let token = token {
                NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: token)
            }
        })
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
}

//
// MARK: - PushBridge Plugin (al final del archivo)
//

import Capacitor

@objc(PushBridge)
public class PushBridge: CAPPlugin {

    @objc func getPendingPush(_ call: CAPPluginCall) {
        guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else {
            call.reject("AppDelegate no disponible")
            return
        }

        if let push = appDelegate.pendingPush {
            call.resolve(["data": push])
            appDelegate.pendingPush = nil
        } else {
            call.resolve(["data": NSNull()])
        }
    }
}
