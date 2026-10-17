import sys
import json
import random
import time

try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

def analyze_stream(feed_url):
    print(f"[CCTV Sandbox] Connecting to feed: {feed_url}")

    if HAS_CV2 and feed_url != "rtsp://mock-stream":
        print("[CCTV Sandbox] OpenCV found. Initializing VideoCapture...")
        cap = cv2.VideoCapture(feed_url)
        if not cap.isOpened():
            print("[CCTV Sandbox] Could not open video stream. Falling back to mock.")
        else:
            # We would read a frame here for actual ML inference
            ret, frame = cap.read()
            if ret:
                print(f"[CCTV Sandbox] Successfully captured frame: {frame.shape}")
            cap.release()
    else:
        time.sleep(1) # Simulating connection delay
        print("[CCTV Sandbox] Running mock bounding box logic.")

    print(f"[CCTV Sandbox] Analyzing motion vectors...")

    # Mock detection of a runner/shoplifter event
    is_runner = random.choice([True, False])

    if is_runner:
        result = {
            "status": "alert",
            "event": "RUNNER_DETECTED",
            "confidence": round(random.uniform(0.85, 0.99), 2),
            "bounding_box": {"x": 120, "y": 45, "w": 200, "h": 350},
            "velocity": {"vx": round(random.uniform(4.5, 8.5), 2), "vy": round(random.uniform(0.1, 1.2), 2)}
        }
    else:
        result = {
            "status": "normal",
            "event": "NO_MOTION",
            "confidence": 0.99
        }

    return result

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            params = json.loads(sys.argv[1])
            feed_url = params.get("feed_url", "0") # "0" usually opens local webcam
            res = analyze_stream(feed_url)
            print(json.dumps(res))
        except Exception as e:
            print(json.dumps({"status": "error", "message": str(e)}))
    else:
        # Default mock run
        res = analyze_stream("rtsp://mock-stream")
        print(json.dumps(res))
