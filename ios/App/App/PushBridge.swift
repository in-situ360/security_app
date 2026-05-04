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
