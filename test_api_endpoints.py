import httpx
import json
import re

def test_endpoints_with_auth():
    base_url = "http://localhost:8000"
    openapi_url = f"{base_url}/openapi.json"
    
    with httpx.Client(base_url=base_url) as client:
        # Fetch openapi spec
        try:
            response = client.get("/openapi.json")
            response.raise_for_status()
            openapi_spec = response.json()
        except Exception as e:
            print(f"Error fetching openapi.json: {e}")
            return

        # Login to get cookies/token
        login_data = {
            "email": "admin@ejemplo.com",
            "password": "1234"
        }
        try:
            login_response = client.post("/users/login", json=login_data)
            print(f"Login status: {login_response.status_code}")
            if login_response.status_code != 200:
                print(f"Failed to login: {login_response.text}")
        except Exception as e:
            print(f"Login exception: {e}")

        working = []
        failed = []

        paths = openapi_spec.get("paths", {})
        
        for path, methods_dict in paths.items():
            for method in methods_dict.keys():
                method_upper = method.upper()
                
                if method_upper not in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
                    continue
                    
                # Skip logout to keep the session alive
                if path == "/users/logout":
                    continue
                    
                test_path = path
                test_path = re.sub(r'\{[^\}]+\}', '1', test_path)
                
                print(f"Testing {method_upper} {test_path}...")
                
                data = None
                if method_upper in ["POST", "PUT", "PATCH"]:
                    if path == "/users/register":
                        data = {"nombre": "test", "pri_ape": "test", "email": "test@test.com", "password": "password", "id_rol": 2}
                    elif path == "/users/login":
                        data = {"email": "admin@ejemplo.com", "password": "1234"}
                    elif path == "/reservations/create":
                        data = {"fecha": "2026-06-01", "hora_inicio": "10:00:00", "hora_fin": "11:00:00", "plazas_parciales": None, "tipo_reserva": "Completa", "id_user": 2, "id_espacio": 1}
                    elif path.startswith("/reservations/update"):
                        data = {"estado": "Confirmada"}
                    else:
                        data = {}
                
                try:
                    if method_upper == "GET":
                        res = client.get(test_path)
                    elif method_upper == "POST":
                        res = client.post(test_path, json=data)
                    elif method_upper == "PUT":
                        res = client.put(test_path, json=data)
                    elif method_upper == "DELETE":
                        res = client.delete(test_path)
                    elif method_upper == "PATCH":
                        res = client.patch(test_path, json=data)
                        
                    status = res.status_code
                    
                    if 200 <= status < 300:
                        working.append(f"{method_upper} {path} - Status: {status}")
                    else:
                        failed.append(f"{method_upper} {path} - Status: {status} - Response: {res.text[:100]}...")
                except Exception as e:
                    failed.append(f"{method_upper} {path} - Exception: {str(e)}")
                    
        # Test logout at the end
        try:
            res = client.post("/users/logout")
            status = res.status_code
            if 200 <= status < 300:
                working.append(f"POST /users/logout - Status: {status}")
            else:
                failed.append(f"POST /users/logout - Status: {status} - Response: {res.text[:100]}...")
        except Exception as e:
            failed.append(f"POST /users/logout - Exception: {str(e)}")

        with open("working_endpoints.txt", "w", encoding="utf-8") as f:
            f.write("Working Endpoints (OK):\n")
            f.write("\n".join(working))
            
        with open("failed_endpoints.txt", "w", encoding="utf-8") as f:
            f.write("Failed Endpoints (Not OK):\n")
            f.write("\n".join(failed))

        print(f"Finished. Working: {len(working)}, Failed: {len(failed)}")

if __name__ == "__main__":
    test_endpoints_with_auth()
