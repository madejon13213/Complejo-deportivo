import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_endpoints():
    client = TestClient(app)
    working = []
    failed = []

    for route in app.routes:
        if hasattr(route, "methods"):
            path = route.path
            methods = route.methods
            name = route.name
            
            # Skip websocket or other non-http routes
            if not methods:
                continue

            # Testing GET endpoints is generally safer and easier.
            # But let's try to do a basic test for all endpoints.
            method = "GET" if "GET" in methods else list(methods)[0]
            
            print(f"Testing {method} {path}...")
            
            # Since some paths have path parameters (e.g., /users/{user_id}),
            # we need to replace them with dummy values
            test_path = path
            import re
            test_path = re.sub(r'\{[^\}]+\}', '1', test_path)
            
            try:
                response = client.request(method, test_path)
                # We consider it "working" if it doesn't return 500. 
                # 422 (validation error), 401 (unauthorized), 404 (not found) mean the endpoint exists and handles the request.
                if response.status_code < 500:
                    working.append(f"{method} {path} - Status: {response.status_code}")
                else:
                    failed.append(f"{method} {path} - Status: {response.status_code} - Response: {response.text}")
            except Exception as e:
                failed.append(f"{method} {path} - Exception: {str(e)}")

    with open("working_endpoints.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(working))
        
    with open("failed_endpoints.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(failed))

    print(f"Finished testing. {len(working)} working, {len(failed)} failed.")

if __name__ == "__main__":
    test_endpoints()
