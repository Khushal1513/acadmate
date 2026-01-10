setup .env

pip install -r req.txt

#for 4 worker
uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4

#for one worker
uvicorn api:app --host 0.0.0.0 --port 8000