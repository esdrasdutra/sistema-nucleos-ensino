import urllib.request
import json
import urllib.error

url = 'http://127.0.0.1:8000/api/v1/polos/1'
payload = json.dumps({'nome': 'Tentativa Aluno', 'codigo': 'POLO-SP-01', 'cidade': 'SP', 'estado': 'SP'}).encode('utf-8')
headers = {'Content-Type': 'application/json', 'X-User-Role': 'ALUNO'}

req = urllib.request.Request(url, data=payload, headers=headers, method='PUT')

try:
    res = urllib.request.urlopen(req)
    print("Sucesso inesperado:", res.status)
except urllib.error.HTTPError as e:
    print(f"HTTP Status: {e.code}")
    print(f"Body: {e.read().decode('utf-8')}")
