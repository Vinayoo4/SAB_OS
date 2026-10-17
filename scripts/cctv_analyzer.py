import sys
import json
import random
import time

def analyze_stream(feed_url):
    print(f"[CCTV Sandbox] Connecting to feed: {feed_url}")
    time.sleep(1) # Simulating connection

    # Placeholder for actual OpenCV/YOLO bounding box logic
    # In a real implementation we would capture frames, detect humans, and track vectors

    print(f"[CCTV Sandbox] Analyzing motion vectors...")

    # Mock detection of a runner
    is_runner = random.choice([True, False])

    if is_runner:
        result = {
            "status": "alert",
            "event": "RUNNER_DETECTED",
            "confidence": 0.92,
            "bounding_box": {"x": 120, "y": 45, "w": 200, "h": 350},
            "velocity": {"vx": 5.2, "vy": 0.3}
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
            feed_url = params.get("feed_url", "0")
            res = analyze_stream(feed_url)
            print(json.dumps(res))
        except Exception as e:
            print(json.dumps({"status": "error", "message": str(e)}))
    else:
        # Default mock run
        res = analyze_stream("rtsp://mock-stream")
        print(json.dumps(res))
